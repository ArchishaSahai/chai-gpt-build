import { loadChatMessages } from "@/features/ai/actions/chat-store";
import { getConversation } from "@/features/conversation/actions/conversation-actions";
import { ConversationView } from "@/features/conversation/components/conversation-view";
import { notFound } from "next/navigation";

type ConversationPageProps = {
  params: Promise<{ id: string }>;
};

/**
 * Conversation page — loads messages and renders the chat UI.
 */
export default async function ConversationPage({ params }: ConversationPageProps) {
  const { id } = await params;

  // #region agent log
  fetch('http://127.0.0.1:7664/ingest/a6ead943-0cdd-4332-9789-ee47ff2e3949',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d98e34'},body:JSON.stringify({sessionId:'d98e34',runId:'post-fix',hypothesisId:'B',location:'app/(root)/c/[id]/page.tsx:ConversationPage',message:'conversation page rendering',data:{conversationId:id},timestamp:Date.now()})}).catch(()=>{});
  // #endregion

  try {
    await getConversation(id);
  } catch {
    notFound();
  }

  const initialMessages = await loadChatMessages(id);

  return (
    <ConversationView conversationId={id} initialMessages={initialMessages} />
  );
}
