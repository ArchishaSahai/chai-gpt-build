"use server";

import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import type { User } from "@/lib/generated/prisma/client";

export async function onBoard() {
    const clerkUser = await currentUser();
    // #region agent log
    fetch('http://127.0.0.1:7664/ingest/a6ead943-0cdd-4332-9789-ee47ff2e3949',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d98e34'},body:JSON.stringify({sessionId:'d98e34',runId:'pre-fix',hypothesisId:'C',location:'features/auth/action/onboard.ts:onBoard',message:'onBoard user check',data:{hasClerkUser:Boolean(clerkUser)},timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    if (!clerkUser) {
        throw new Error("Unauthorized")
    }

    const email = clerkUser.emailAddresses[0]?.emailAddress ?? null;

    return prisma.user.upsert({
        where: { clerkId: clerkUser.id },
        create: {
            clerkId: clerkUser.id,
            email,
            firstName: clerkUser.firstName,
            lastName: clerkUser.lastName,
            imageUrl: clerkUser.imageUrl
        },
        update: {
            email,
            firstName: clerkUser.firstName,
            lastName: clerkUser.lastName,
            imageUrl: clerkUser.imageUrl
        }
    })
}