"use client";

import { GitBranchIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useConversationBranches,
  useDeleteConversation,
  useUpdateConversation,
} from "@/features/conversation/hooks/use-conversation";

/** Compact switcher for a conversation and its direct branches. */
export function BranchNavigation({ conversationId }: { conversationId: string }) {
  const router = useRouter();
  const { data: branches } = useConversationBranches(conversationId);
  const updateConversation = useUpdateConversation();
  const deleteConversation = useDeleteConversation(conversationId);

  if (!branches || branches.length <= 1) {
    return null;
  }

  const currentIndex = branches.findIndex((branch) => branch.id === conversationId);
  const currentBranch = branches[currentIndex];

  function handleRename() {
    const title = window.prompt("Rename branch", currentBranch?.title);
    if (!title || title.trim() === currentBranch?.title) return;
    updateConversation.mutate({ id: conversationId, title });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button type="button" variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
            <GitBranchIcon className="size-3.5" />
            {currentIndex + 1} of {branches.length}
          </Button>
        }
      />
      <DropdownMenuContent align="start" className="min-w-52">
        <DropdownMenuLabel>Conversation branches</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {branches.map((branch, index) => (
          <DropdownMenuItem
            key={branch.id}
            onClick={() => router.push(`/c/${branch.id}`)}
            disabled={branch.id === conversationId}
          >
            <GitBranchIcon />
            <span className="truncate">{index === 0 ? "Original" : `Branch ${index}`}: {branch.title}</span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleRename}>
          <PencilIcon />
          Rename branch
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          onClick={() => deleteConversation.mutate(conversationId)}
        >
          <Trash2Icon />
          Delete branch
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
