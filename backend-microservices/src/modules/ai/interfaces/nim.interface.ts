// src/modules/ai/interfaces/nim.interface.ts

export type NimRole = "system" | "user" | "assistant";

export type NimMessage = {
  role: NimRole;
  content: string;
};

/** Raw response from NVIDIA NIM /v1/chat/completions */
export type NimApiResponse = {
  id: string;
  object: "chat.completion";
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: NimMessage;
    finish_reason: "stop" | "length" | "content_filter" | null;
    logprobs: null;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

/** Streaming chunk from NIM when stream: true */
export type NimStreamChunk = {
  id: string;
  object: "chat.completion.chunk";
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: Partial<NimMessage>;
    finish_reason: string | null;
  }>;
};

export type NimChatOptions = {
  model?: string;
  messages: NimMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  systemPrompt?: string;
};
