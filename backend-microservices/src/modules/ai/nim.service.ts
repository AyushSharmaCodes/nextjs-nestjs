// src/modules/ai/nim.service.ts
import {
  Injectable,
  Logger,
  InternalServerErrorException,
  GatewayTimeoutException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { appConfig } from "../../config/env.config";
import { NimLog } from "./nim-log.entity";
import type { NimApiResponse, NimChatOptions, NimMessage } from "./interfaces/nim.interface";

@Injectable()
export class NimService {
  private readonly logger = new Logger(NimService.name);
  private readonly baseUrl = appConfig.nvidia.nimBaseUrl;
  private readonly apiKey  = appConfig.nvidia.apiKey;

  constructor(
    @InjectRepository(NimLog)
    private readonly nimLogRepo: Repository<NimLog>,
  ) {}

  // ─── Core method ─────────────────────────────────────────────────────────

  async chatCompletion(options: NimChatOptions): Promise<NimApiResponse> {
    const model       = options.model       ?? appConfig.nvidia.defaultModel;
    const temperature = options.temperature ?? appConfig.nvidia.temperature;
    const maxTokens   = options.maxTokens   ?? appConfig.nvidia.maxTokens;

    // Prepend system prompt as a system message if provided
    const messages: NimMessage[] = options.systemPrompt
      ? [{ role: "system", content: options.systemPrompt }, ...options.messages]
      : options.messages;

    const requestBody = {
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: false,                  // streaming handled separately via streamCompletion()
    };

    const start = Date.now();
    let responseData: NimApiResponse | null = null;
    let errorMsg: string | null = null;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(
        () => controller.abort(),
        appConfig.nvidia.timeoutMs,
      );

      const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
          "Accept":        "application/json",
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `NIM API error ${response.status} ${response.statusText}: ${errorText}`,
        );
      }

      responseData = (await response.json()) as NimApiResponse;
      return responseData;

    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.name === "AbortError") {
          errorMsg = `Request timed out after ${appConfig.nvidia.timeoutMs}ms`;
          this.logger.error(`[NimService] ${errorMsg}`);
          throw new GatewayTimeoutException(errorMsg);
        }
        errorMsg = err.message;
      }
      this.logger.error("[NimService] chatCompletion failed:", err);
      throw new InternalServerErrorException(
        `NIM API call failed: ${errorMsg ?? "Unknown error"}`,
      );

    } finally {
      // Always log to DB — even failed requests
      await this.logRequest({
        model,
        requestPayload:  requestBody,
        responsePayload: responseData ?? undefined,
        latencyMs:       Date.now() - start,
        usage:           responseData?.usage,
        finishReason:    responseData?.choices?.[0]?.finish_reason ?? null,
        error:           errorMsg,
      }).catch((logErr) =>
        this.logger.warn("[NimService] Failed to write log:", logErr),
      );
    }
  }

  // ─── Convenience wrapper ──────────────────────────────────────────────────

  async simplePrompt(
    prompt: string,
    systemPrompt?: string,
    model?: string,
  ): Promise<string> {
    const response = await this.chatCompletion({
      model,
      systemPrompt,
      messages: [{ role: "user", content: prompt }],
    });
    return response.choices[0]?.message?.content ?? "";
  }

  // ─── Streaming (Server-Sent Events) ──────────────────────────────────────

  async *streamCompletion(
    options: NimChatOptions,
  ): AsyncGenerator<string, void, unknown> {
    const model    = options.model ?? appConfig.nvidia.defaultModel;
    const messages = options.systemPrompt
      ? [{ role: "system" as const, content: options.systemPrompt }, ...options.messages]
      : options.messages;

    const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${this.apiKey}`,
        "Accept":        "text/event-stream",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: options.temperature ?? appConfig.nvidia.temperature,
        max_tokens:  options.maxTokens   ?? appConfig.nvidia.maxTokens,
        stream:      true,
      }),
    });

    if (!response.ok || !response.body) {
      throw new InternalServerErrorException("NIM streaming request failed");
    }

    const reader  = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      for (const line of chunk.split("\n")) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6).trim();
        if (data === "[DONE]") return;
        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) yield content;
        } catch {
          // Malformed SSE line — skip silently
        }
      }
    }
  }

  // ─── Available models ─────────────────────────────────────────────────────

  async listModels(): Promise<string[]> {
    const response = await fetch(`${this.baseUrl}/v1/models`, {
      headers: { Authorization: `Bearer ${this.apiKey}` },
    });
    if (!response.ok) {
      throw new InternalServerErrorException("Failed to fetch NIM model list");
    }
    const data = await response.json();
    return (data.data ?? []).map((m: { id: string }) => m.id);
  }

  // ─── DB logging ───────────────────────────────────────────────────────────

  private async logRequest(params: {
    model: string;
    requestPayload: Record<string, unknown>;
    responsePayload?: Record<string, unknown>;
    latencyMs: number;
    usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
    finishReason: string | null;
    error: string | null;
    triggeredByEvent?: string;
  }): Promise<void> {
    const log = this.nimLogRepo.create({
      model:           params.model,
      promptTokens:    params.usage?.prompt_tokens     ?? null,
      completionTokens: params.usage?.completion_tokens ?? null,
      totalTokens:     params.usage?.total_tokens       ?? null,
      latencyMs:       params.latencyMs,
      finishReason:    params.finishReason,
      requestPayload:  params.requestPayload,
      responsePayload: (params.responsePayload as Record<string, unknown>) ?? null,
      error:           params.error,
      triggeredByEvent: params.triggeredByEvent ?? null,
    });
    await this.nimLogRepo.save(log);
  }

  // Expose private log method for the event listener
  async logEventDrivenRequest(params: Parameters<NimService["logRequest"]>[0]) {
    return this.logRequest(params);
  }
}
