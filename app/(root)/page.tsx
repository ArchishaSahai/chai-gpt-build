import { startNewChat } from "@/features/home/actions/start-new-chat";
import { redirect } from "next/navigation";

/**
 * Home page — creates a new chat and redirects to `/c/{id}`.
 */
export default async function HomePage() {
  // #region agent log
  fetch('http://127.0.0.1:7664/ingest/a6ead943-0cdd-4332-9789-ee47ff2e3949',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d98e34'},body:JSON.stringify({sessionId:'d98e34',runId:'post-fix',hypothesisId:'B',location:'app/(root)/page.tsx:HomePage',message:'home page creating chat',data:{route:'/'},timestamp:Date.now()})}).catch(()=>{});
  // #endregion

  const conversationId = await startNewChat();

  redirect(`/c/${conversationId}`);
}
