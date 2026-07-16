import { ChatShell } from "@/features/conversation/components/chat-shell";
import React from "react";

/**
 * Chat layout — wraps conversation pages in the app shell with sidebar.
 */
const ConversationLayout = ({ children }: { children: React.ReactNode }) => {
  return <ChatShell>{children}</ChatShell>;
};

export default ConversationLayout;
