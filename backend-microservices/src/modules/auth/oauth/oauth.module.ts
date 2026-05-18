import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OAuthIdentity } from './entities/oauth-identity.entity';
import { OAuthService } from './oauth.service';
import { OAuthController } from './oauth.controller';
import { OAuthRepository } from './oauth.repository';
import { SessionModule } from '../session/session.module';
import { IdentityModule } from '../identity/identity.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OAuthIdentity]),
    IdentityModule,
    SessionModule,
  ],
  controllers: [OAuthController],
  providers: [OAuthService, OAuthRepository],
  exports: [OAuthService, OAuthRepository],
})
export class OAuthModule {}