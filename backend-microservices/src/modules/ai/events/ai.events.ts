// src/modules/ai/events/ai.events.ts
// Payloads for events emitted BY the AI module

import type { NimApiResponse } from "../interfaces/nim.interface";

export type AiCompletionRequestedPayload = {
  prompt: string;
  systemPrompt?: string;
  model?: string;
  triggeredByEvent: string;   // which app event triggered this
  contextId?: string;         // e.g. orderId, userId — for correlation
};

export type AiCompletionDonePayload = {
  contextId?: string;
  triggeredByEvent: string;
  result: string;
  usage?: NimApiResponse["usage"];
  model?: string;
};

export type AiCompletionErrorPayload = {
  contextId?: string;
  triggeredByEvent: string;
  error: string;
};
