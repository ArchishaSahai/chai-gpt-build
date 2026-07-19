import { webSearchTool } from "./tools";
import { loadChatMessages, saveChatMessages } from "@/features/ai/actions/chat-store";
import { getChatModel } from "@/features/ai/utils/model";
import { requireUser } from "@/features/auth/action/require-user";
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

/**
 * POST /api/chat — Streams an AI assistant reply for a conversation.
 *
 * Validates auth and ownership, persists the user message, then streams the
 * assistant response via the AI SDK. Final messages are saved when the stream ends.
 */
export async function POST(req: Request) {
    const requestId = crypto.randomUUID();
    const authenticationStartedAt = performance.now();
    await auth.protect();

    const { message, id }: { message: UIMessage, id: string } = await req.json();

    if (!message || !id) {
        return new Response("Missing message or conversation id", { status: 400 });
    }

    const user = await requireUser();
    logDuration(requestId, "Authentication", authenticationStartedAt);

    const conversationLookupStartedAt = performance.now();
    const conversation = await prisma.conversation.findFirst({
        where: {
            id,
            userId: user.id
        }
    });

    if (!conversation) {
        return new Response("Conversation not found", { status: 404 });
    }
    logDuration(requestId, "Prisma conversation lookup", conversationLookupStartedAt);

    const messagesLoadStartedAt = performance.now();
    const previousMessages = await loadChatMessages(id);
    logDuration(requestId, "Loading messages", messagesLoadStartedAt);

    const alreadySaved = previousMessages.some(
        (storedMessage)=>storedMessage.id === message.id
    )

    const messages = alreadySaved ? previousMessages : [...previousMessages, message];

    if(!alreadySaved){
        const saveStartedAt = performance.now();
        await saveChatMessages(id, [message]);
        logDuration(requestId, "Saving user message", saveStartedAt);
    }

<<<<<<< HEAD
    const result = streamText({
    model: getChatModel(conversation.model),

    system:
        conversation.systemPrompt ??
        "You are ChaiGpt, a helpful assistant. Use the webSearch tool whenever the user asks about current events, recent news, live information, or anything you are uncertain about.",

    messages: await convertToModelMessages(messages),

    tools: {
        webSearch: webSearchTool,
    },

    stopWhen: stepCountIs(5),
});
    return result.toUIMessageStreamResponse({
  originalMessages: messages,
  generateMessageId: createIdGenerator({
    prefix: "msg",
    size: 16,
  }),
  onFinish: async ({ messages: finalMessages }) => {
    try {
      await saveChatMessages(id, finalMessages, {
        updateTitle: false,
      });
    } catch (error) {
      console.error(error);
    }
  },
});
=======
    const openAiStartedAt = performance.now();
    let receivedFirstOpenAiChunk = false;
    const result =  streamText({
        model: getChatModel(conversation.model),
        system:
            conversation.systemPrompt ??
            "You are ChaiGpt, a helpful assistant. Use the webSearch tool whenever the user asks about current events, recent news, live information, or anything you are uncertain about.",
        messages: await convertToModelMessages(messages),
        tools: {
            webSearch: webSearchTool,
        },
        stopWhen: stepCountIs(5),
        onChunk: () => {
            if (!receivedFirstOpenAiChunk) {
                receivedFirstOpenAiChunk = true;
                logDuration(requestId, "OpenAI API call (first chunk)", openAiStartedAt);
            }
        },
        onFinish: () => {
            logDuration(requestId, "OpenAI API call (complete)", openAiStartedAt);
        },
    });

    return createUIMessageStreamResponse({
        stream:toUIMessageStream({
           stream:result.stream,
           originalMessages:messages,
           generateMessageId:createIdGenerator({prefix:"msg" , size:16}),
           onEnd:async({messages:finalMessages})=>{
            try {
                const saveStartedAt = performance.now();
                const newMessages = finalMessages.filter(
                    (finalMessage) => !messages.some(
                        (persistedMessage) => persistedMessage.id === finalMessage.id
                    )
                );
                await saveChatMessages(id , newMessages , {updateTitle:false})
                logDuration(requestId, "Saving messages", saveStartedAt);
            } catch (error) {
                console.error(error);
            }
           }
        })
    })
>>>>>>> chat-branching

}
