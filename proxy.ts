import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher(["/sign-in(.*)"])

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  // #region agent log
  fetch('http://127.0.0.1:7664/ingest/a6ead943-0cdd-4332-9789-ee47ff2e3949',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d98e34'},body:JSON.stringify({sessionId:'d98e34',runId:'pre-fix',hypothesisId:'A',location:'proxy.ts:middleware',message:'middleware request',data:{path:req.nextUrl.pathname,userId:userId??null,isPublic:isPublicRoute(req)},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
    // Always run for Clerk-specific frontend API routes
    '/__clerk/(.*)',
  ],
}