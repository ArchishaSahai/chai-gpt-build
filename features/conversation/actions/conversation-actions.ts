"use server";

import { requireUser } from "@/features/auth/action/require-user";
import { prisma } from "@/lib/db";
import type { Message } from "@/lib/generated/prisma/client";
import { revalidatePath } from "next/cache";

/** Shape of a conversation row returned in the sidebar list. */
export type ConversationListItem = {
    id: string;
    title: string;
    isPinned: boolean;
    isArchived: boolean;
    lastMessageAt: Date;
    createdAt: Date;
    updatedAt: Date;
    parentConversationId: string | null;
    branchFromMessageId: string | null;
};


/**
 * Verifies that a conversation exists and belongs to the given user.
 *
 * @throws {Error} When the conversation is not found or not owned by the user.
 */
async function assertOwnsConversation(conversationId: string, userId: string) {
    const conversation = await prisma.conversation.findFirst({
        where: {
            id: conversationId,
            userId
        }
    });

    if (!conversation) {
        throw new Error("Conversation not found")
    }

    return conversation
}

/**
 * Fetches a single conversation owned by the current user.
 *
 * @param conversationId - The conversation to load.
 * @throws {Error} When the conversation is not found.
 */
export async function getConversation(conversationId: string) {
    const user = await requireUser();
    return assertOwnsConversation(conversationId, user.id)
}


/**
 * Lists non-archived conversations for the current user.
 * Pinned conversations appear first, then sorted by most recent activity.
 */
export async function listConversations(): Promise<ConversationListItem[]> {
    const user = await requireUser();

    return prisma.conversation.findMany({
        where: { userId: user.id, isArchived: false },
        orderBy: [{ isPinned: "desc" }, { lastMessageAt: "desc" }],
        select: {
            id: true,
            title: true,
            isPinned: true,
            isArchived: true,
            lastMessageAt: true,
            createdAt: true,
            updatedAt: true,
            parentConversationId: true,
            branchFromMessageId: true,
        },
    })
}

/**
 * Lists the current conversation's fork group: its parent (or itself) and
 * every direct branch from that conversation.
 */
export async function listConversationBranches(conversationId: string) {
    const user = await requireUser();
    const conversation = await assertOwnsConversation(conversationId, user.id);
    const branchPointId = conversation.parentConversationId ?? conversation.id;
    const branchQueryStartedAt = performance.now();

    const branches = await prisma.conversation.findMany({
        where: {
            userId: user.id,
            OR: [
                { id: branchPointId },
                { parentConversationId: branchPointId },
            ],
        },
        orderBy: { createdAt: "asc" },
        select: {
            id: true,
            title: true,
            parentConversationId: true,
            branchFromMessageId: true,
        },
    });

    console.info("[chat-profile]", {
        step: "Branch queries",
        durationMs: Math.round(performance.now() - branchQueryStartedAt),
        conversationId,
    });

    return branches;
}

/**
 * Creates a new conversation branch containing the selected message and all
 * preceding messages. The source conversation and its messages are unchanged.
 */
export async function createConversationBranch(
    conversationId: string,
    messageId: string
) {
    const user = await requireUser();

    const branch = await prisma.$transaction(async (tx) => {
        const source = await tx.conversation.findFirst({
            where: { id: conversationId, userId: user.id },
        });

        if (!source) {
            throw new Error("Conversation not found");
        }

        const [messages, existingBranches]: [
            Message[],
            { title: string }[],
        ] = await Promise.all([
            tx.message.findMany({
                where: { conversationId },
                orderBy: { createdAt: "asc" },
            }),
            tx.conversation.findMany({
                where: { parentConversationId: source.id },
                select: { title: true },
            }),
        ]);
        const selectedIndex = messages.findIndex((message) => message.id === messageId);

        if (selectedIndex === -1) {
            throw new Error("Message not found");
        }

        const copiedMessages = messages.slice(0, selectedIndex + 1);
        const existingTitles = new Set(existingBranches.map((branch) => branch.title));
        let branchNumber = existingBranches.length + 1;

        while (existingTitles.has(`Branch ${branchNumber}`)) {
            branchNumber += 1;
        }

        const conversation = await tx.conversation.create({
            data: {
                userId: user.id,
                title: `Branch ${branchNumber}`,
                model: source.model,
                systemPrompt: source.systemPrompt,
                parentConversationId: source.id,
                branchFromMessageId: messageId,
                lastMessageAt: copiedMessages.at(-1)?.createdAt ?? new Date(),
            },
        });

        if (copiedMessages.length) {
            await tx.message.createMany({
                data: copiedMessages.map((message) => ({
                    conversationId: conversation.id,
                    role: message.role,
                    status: message.status,
                    content: message.content,
                    parts: message.parts ?? undefined,
                    metadata: message.metadata ?? undefined,
                    createdAt: message.createdAt,
                    updatedAt: message.updatedAt,
                })),
            });
        }

        return conversation;
    });

    revalidatePath("/");
    revalidatePath(`/c/${conversationId}`);
    return branch;
}

/**
 * Creates a new conversation for the current user.
 *
 * @param title - Optional title; defaults to "New Chat".
 */
export async function createConversation(title = "New Chat") {
    const user = await requireUser();

    return prisma.conversation.create({
        data: {
            userId: user.id,
            title: title.trim() || "New Chat",
        },
    });
}

/**
 * Updates conversation metadata (title, pin, or archive status).
 *
 * @param conversationId - The conversation to update.
 * @param data - Fields to change; omitted fields are left unchanged.
 */
export async function updateConversation(
    conversationId: string,
    data: { title?: string; isPinned?: boolean; isArchived?: boolean }
) {
    const user = await requireUser();
    await assertOwnsConversation(conversationId, user.id);

    const conversation = await prisma.conversation.update({
        where: { id: conversationId },
        data: {
            ...(data.title !== undefined ? { title: data.title.trim() || "New Chat" } : {}),
            ...(data.isPinned !== undefined ? { isPinned: data.isPinned } : {}),
            ...(data.isArchived !== undefined ? { isArchived: data.isArchived } : {}),
        },
    });

    revalidatePath("/");
    revalidatePath(`/c/${conversationId}`);
    return conversation;
}



/**
 * Permanently deletes a conversation owned by the current user.
 *
 * @param conversationId - The conversation to delete.
 * @returns The deleted conversation ID.
 */
export async function deleteConversation(conversationId: string) {
    const user = await requireUser();
    await assertOwnsConversation(conversationId, user.id);

    await prisma.conversation.delete({
        where: { id: conversationId },
    });

    revalidatePath("/");
    return { id: conversationId };
}
