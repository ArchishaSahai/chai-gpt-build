import { onBoard } from "@/features/auth/action/onboard";
import { auth } from "@clerk/nextjs/server";
import React from "react";

const RootGroupLayout = async ({ children }: { children: React.ReactNode }) => {
  const { userId: layoutUserId } = await auth();
  // #region agent log
  fetch('http://127.0.0.1:7664/ingest/a6ead943-0cdd-4332-9789-ee47ff2e3949',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d98e34'},body:JSON.stringify({sessionId:'d98e34',runId:'post-fix',hypothesisId:'A',location:'app/(root)/layout.tsx:entry',message:'root layout rendering',data:{layoutUserId:layoutUserId??null},timestamp:Date.now()})}).catch(()=>{});
  // #endregion

  await onBoard();

  return <div>{children}</div>;
};

export default RootGroupLayout;
