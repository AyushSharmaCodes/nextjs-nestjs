import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BankDetail } from './entities/bank-details.entity';
import { BankDetailsService } from './bank-details.service';
import { BankDetailsController } from './bank-details.controller';

@Module({
  imports: [TypeOrmModule.forFeature([BankDetail])],
  controllers: [BankDetailsController],
  providers: [BankDetailsService],
  exports: [BankDetailsService],
})
export class BankDetailsModule {}