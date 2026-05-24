// src/modules/ai/events/ai.listener.ts
/**
 * Listens to events from other modules and optionally triggers AI calls.
 *
 * Pattern:
 *   Another module emits  → AppEvent.ORDER_CREATED
 *   AiListener catches it → calls NimService
 *   AiListener emits      → AppEvent.AI_COMPLETION_DONE
 *   Caller module handles → does something with the AI result
 *
 * Add/remove @OnEvent handlers here to wire AI into any event flow.
 */

import { Injectable, Logger } from "@nestjs/common";
import { OnEvent }           from "@nestjs/event-emitter";
import { EventEmitter2 }     from "@nestjs/event-emitter";
import { NimService }        from "../nim.service";
import { AppEvent }          from "../../../shared/events/app.events";
import type {
  AiCompletionDonePayload,
  AiCompletionErrorPayload,
} from "./ai.events";

@Injectable()
export class AiListener {
  private readonly logger = new Logger(AiListener.name);

  constructor(
    private readonly nimService: NimService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // ── Example: generate an AI summary when an order is created ─────────────

  @OnEvent(AppEvent.ORDER_CREATED, { async: true })
  async handleOrderCreated(payload: {
    orderId: string;
    items: Array<{ name: string; qty: number }>;
    totalAmount: number;
  }): Promise<void> {
    this.logger.log(
      `[AiListener] Generating summary for order ${payload.orderId}`,
    );

    const itemsList = payload.items
      .map((i) => `${i.qty}x ${i.name}`)
      .join(", ");

    try {
      const response = await this.nimService.chatCompletion({
        systemPrompt:
          "You are a concise order summarization assistant. " +
          "Reply with a single sentence summary, no extra commentary.",
        messages: [
          {
            role: "user",
            content:
              `Summarize this order: ${itemsList}. ` +
              `Total: $${payload.totalAmount}.`,
          },
        ],
      });

      const result = response.choices[0]?.message?.content ?? "";

      const done: AiCompletionDonePayload = {
        contextId:        payload.orderId,
        triggeredByEvent: AppEvent.ORDER_CREATED,
        result,
        usage:  response.usage,
        model:  response.model,
      };
      this.eventEmitter.emit(AppEvent.AI_COMPLETION_DONE, done);

    } catch (err: unknown) {
      const error: AiCompletionErrorPayload = {
        contextId:        payload.orderId,
        triggeredByEvent: AppEvent.ORDER_CREATED,
        error:            err instanceof Error ? err.message : "Unknown error",
      };
      this.eventEmitter.emit(AppEvent.AI_COMPLETION_ERROR, error);
      this.logger.error("[AiListener] handleOrderCreated failed:", err);
    }
  }

  // ── Example: generate a welcome message when a user registers ────────────

  @OnEvent(AppEvent.USER_REGISTERED, { async: true })
  async handleUserRegistered(payload: {
    userId: string;
    firstName?: string;
    lastName?: string;
    email: string;
  }): Promise<void> {
    const name = payload.firstName ? `${payload.firstName} ${payload.lastName ?? ""}`.trim() : payload.email;
    this.logger.log(`[AiListener] Generating welcome message for ${payload.userId}`);

    try {
      const result = await this.nimService.simplePrompt(
        `Write a warm, two-sentence welcome message for a new user named ${name}.`,
        "You are a friendly customer success assistant.",
      );

      this.eventEmitter.emit(AppEvent.AI_COMPLETION_DONE, {
        contextId:        payload.userId,
        triggeredByEvent: AppEvent.USER_REGISTERED,
        result,
      } satisfies Partial<AiCompletionDonePayload>);

    } catch (err: unknown) {
      this.logger.error("[AiListener] handleUserRegistered AI call failed:", err);
    }
  }
}
