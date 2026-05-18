import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Return } from './entities/return.entity';
import { ReturnItem, ReturnQCResult } from './entities/return-item.entity';
import { ReturnService } from './return.service';
import { ReturnController } from './return.controller';
import { ReturnRepository } from './return.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Return, ReturnItem, ReturnQCResult])],
  controllers: [ReturnController],
  providers: [ReturnService, ReturnRepository],
  exports: [ReturnService, ReturnRepository],
})
export class ReturnModule {}