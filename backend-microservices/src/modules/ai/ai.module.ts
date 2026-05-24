// src/modules/ai/ai.module.ts
import { Module }       from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { NimService }   from "./nim.service";
import { NimController } from "./nim.controller";
import { AiListener }   from "./events/ai.listener";
import { NimLog }       from "./nim-log.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([NimLog]),
  ],
  controllers: [NimController],
  providers:   [NimService, AiListener],
  exports:     [NimService],   // ← other modules import AiModule to use NimService
})
export class AiModule {}
