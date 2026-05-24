// src/modules/ai/nim-log.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from "typeorm";

@Entity({ name: "ai_nim_logs", schema: "public" })
export class NimLog {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Index()
  @Column({ name: "model", type: "varchar", length: 100 })
  model: string;

  @Column({ name: "prompt_tokens", type: "int", nullable: true })
  promptTokens: number | null;

  @Column({ name: "completion_tokens", type: "int", nullable: true })
  completionTokens: number | null;

  @Column({ name: "total_tokens", type: "int", nullable: true })
  totalTokens: number | null;

  @Column({ name: "latency_ms", type: "int", nullable: true })
  latencyMs: number | null;

  @Column({ name: "finish_reason", type: "varchar", length: 50, nullable: true })
  finishReason: string | null;

  @Column({ name: "request_payload", type: "jsonb" })
  requestPayload: Record<string, unknown>;

  @Column({ name: "response_payload", type: "jsonb", nullable: true })
  responsePayload: Record<string, unknown> | null;

  @Column({ name: "error", type: "text", nullable: true })
  error: string | null;

  @Index()
  @Column({ name: "triggered_by_event", type: "varchar", length: 100, nullable: true })
  triggeredByEvent: string | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt: Date;
}
