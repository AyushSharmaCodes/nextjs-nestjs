// src/modules/ai/nim.controller.ts
import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  HttpCode,
  Logger,
} from "@nestjs/common";
import { FastifyReply } from "fastify";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { NimService }    from "./nim.service";
import { ChatCompletionDto, SimplePromptDto } from "./dto/chat.dto";
import { Public } from "../auth/decorators/public.decorator";

@ApiTags("AI / NIM")
@ApiBearerAuth()
@Controller("ai")
export class NimController {
  private readonly logger = new Logger(NimController.name);

  constructor(private readonly nimService: NimService) {}

  // ── POST /ai/chat ─────────────────────────────────────────────────────────
  @Public()
  @Post("chat")
  @HttpCode(200)
  @ApiOperation({ summary: "Multi-turn chat completion via NVIDIA NIM" })
  async chatCompletion(
    @Body() dto: ChatCompletionDto,
  ) {
    const response = await this.nimService.chatCompletion({
      messages:    dto.messages,
      model:       dto.model,
      temperature: dto.temperature,
      maxTokens:   dto.maxTokens,
    });

    return {
      success: true,
      model:   response.model,
      content: response.choices[0]?.message?.content ?? "",
      usage:   response.usage,
      finishReason: response.choices[0]?.finish_reason,
    };
  }

  // ── POST /ai/prompt ───────────────────────────────────────────────────────
  @Public()
  @Post("prompt")
  @HttpCode(200)
  @ApiOperation({ summary: "Simple single-turn prompt" })
  async simplePrompt(
    @Body() dto: SimplePromptDto,
  ) {
    const content = await this.nimService.simplePrompt(
      dto.prompt,
      dto.systemPrompt,
      dto.model,
    );
    return { success: true, content };
  }

  // ── POST /ai/stream ───────────────────────────────────────────────────────
  @Public()
  @Post("stream")
  @ApiOperation({ summary: "Streaming chat completion (Server-Sent Events)" })
  async streamCompletion(
    @Body() dto: ChatCompletionDto,
    @Res() res: FastifyReply,
  ) {
    // Under Fastify, we set headers on the raw response object or via FastifyReply API
    const rawRes = res.raw;
    rawRes.setHeader("Content-Type",  "text/event-stream");
    rawRes.setHeader("Cache-Control", "no-cache");
    rawRes.setHeader("Connection",    "keep-alive");
    rawRes.setHeader("X-Accel-Buffering", "no");   // disable Nginx buffering

    try {
      for await (const chunk of this.nimService.streamCompletion({
        messages: dto.messages,
        model:    dto.model,
      })) {
        rawRes.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
      }
      rawRes.write("data: [DONE]\n\n");
    } catch (err: unknown) {
      this.logger.error("[NimController] Stream error:", err);
      rawRes.write(`data: ${JSON.stringify({ error: "Stream failed" })}\n\n`);
    } finally {
      rawRes.end();
    }
  }

  // ── GET /ai/models ────────────────────────────────────────────────────────
  @Public()
  @Get("models")
  @ApiOperation({ summary: "List available NIM models" })
  async listModels() {
    const models = await this.nimService.listModels();
    return { success: true, models };
  }
}
