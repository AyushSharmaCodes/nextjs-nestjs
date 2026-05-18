import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactInfo } from './entities/contact-info.entity';
import { ContactInfoService } from './contact-info.service';
import { ContactInfoController } from './contact-info.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ContactInfo])],
  controllers: [ContactInfoController],
  providers: [ContactInfoService],
  exports: [ContactInfoService],
})
export class ContactInfoModule {}