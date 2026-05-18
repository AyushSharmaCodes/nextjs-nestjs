import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Refund } from '../payment/entities/payment.entity';
import { RefundService } from './refund.service';
import { RefundController } from './refund.controller';
import { RefundRepository } from './refund.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Refund])],
  controllers: [RefundController],
  providers: [RefundService, RefundRepository],
  exports: [RefundService],
})
export class RefundModule {}