import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductVariant, VariantOption } from './entities/variant.entity';
import { VariantService } from './variant.service';
import { VariantController } from './variant.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProductVariant, VariantOption])],
  controllers: [VariantController],
  providers: [VariantService],
  exports: [VariantService],
})
export class VariantModule {}