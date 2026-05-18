import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Identity } from './entities/identity.entity';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { IdentityService } from './identity.service';
import { IdentityController } from './identity.controller';
import { IdentityRepository } from './identity.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Identity, PasswordResetToken])],
  controllers: [IdentityController],
  providers: [IdentityService, IdentityRepository],
  exports: [IdentityService, IdentityRepository],
})
export class IdentityModule {}