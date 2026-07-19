ALTER TABLE "Conversation"
ADD COLUMN "parentConversationId" TEXT,
ADD COLUMN "branchFromMessageId" TEXT;

ALTER TABLE "Conversation"
ADD CONSTRAINT "Conversation_parentConversationId_fkey"
FOREIGN KEY ("parentConversationId") REFERENCES "Conversation"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Conversation_parentConversationId_lastMessageAt_idx"
ON "Conversation"("parentConversationId", "lastMessageAt" DESC);
