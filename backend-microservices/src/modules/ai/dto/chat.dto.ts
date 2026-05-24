// src/modules/ai/dto/chat.dto.ts
import { createZodDto } from "nestjs-zod";
import { z } from "zod";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

// ─── Schemas ─────────────────────────────────────────────────────────────────

const MessageRoleSchema = z.enum(["system", "user", "assistant"]);

const MessageSchema = z.object({
  role: MessageRoleSchema,
  content: z.string().min(1).max(32000),
});

export const ChatCompletionSchema = z.object({
  messages: z.array(MessageSchema),
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().min(1).max(4096).optional(),
  stream: z.boolean().optional(),
});

export const SimplePromptSchema = z.object({
  prompt: z.string().min(1).max(32000),
  systemPrompt: z.string().max(4000).optional(),
  model: z.string().optional(),
});

// ─── DTO Classes ─────────────────────────────────────────────────────────────

export class MessageDto {
  @ApiProperty({ enum: ["system", "user", "assistant"] })
  role: "system" | "user" | "assistant";

  @ApiProperty()
  content: string;
}

export class ChatCompletionDto extends createZodDto(ChatCompletionSchema) {
  @ApiProperty({ type: [MessageDto] })
  messages: MessageDto[];

  @ApiPropertyOptional({ description: "Override default NIM model" })
  model?: string;

  @ApiPropertyOptional({ minimum: 0, maximum: 2 })
  temperature?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 4096 })
  maxTokens?: number;

  @ApiPropertyOptional()
  stream?: boolean;
}

export class SimplePromptDto extends createZodDto(SimplePromptSchema) {
  @ApiProperty()
  prompt: string;

  @ApiPropertyOptional()
  systemPrompt?: string;

  @ApiPropertyOptional()
  model?: string;
}
