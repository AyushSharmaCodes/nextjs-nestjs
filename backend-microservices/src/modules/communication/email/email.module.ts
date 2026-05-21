import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailTemplate, EmailQueue } from './entities/email.entity';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
// AuthEmailListener is removed — superseded by the typed per-event
// listeners in src/modules/communication/listeners/auth/ (AuthEmailModule).

@Module({
  imports: [TypeOrmModule.forFeature([EmailTemplate, EmailQueue])],
  controllers: [EmailController],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}