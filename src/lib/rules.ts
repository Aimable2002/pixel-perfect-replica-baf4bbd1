import type { Conversation } from "./types";

// Product safeguards. The UI uses them for instant feedback; the backend must enforce them too.
export function canReply(conversation: Conversation | undefined) {
  return !!conversation?.messages.some((m) => m.from === "customer");
}

export function allowedAgentAction(type: string) {
  return ["post", "budget", "reply"].includes(type);
}
