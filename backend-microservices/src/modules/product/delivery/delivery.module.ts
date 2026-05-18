import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryConfig } from './entities/delivery-config.entity';
import { DeliveryZone, DeliveryCharge, DeliveryPartner } from './entities/delivery-zone.entity';
import { DeliveryService, DeliveryZoneService } from './delivery.service';
import { DeliveryController } from './delivery.controller';
import { DeliveryRepository } from './delivery.repository';

@Module({
  imports: [TypeOrmModule.forFeature([DeliveryConfig, DeliveryZone, DeliveryCharge, DeliveryPartner])],
  controllers: [DeliveryController],
  providers: [DeliveryRepository, DeliveryService, DeliveryZoneService],
  exports: [DeliveryService, DeliveryZoneService],
})
export class DeliveryModule {}