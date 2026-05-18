import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { OtpService } from './otp/otp.service';
import { RolesService } from './rbac/services/roles.service';
import { PermissionsService } from './rbac/services/permissions.service';
import { BootstrapService } from './bootstrap/bootstrap.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}), // Secrets and signOptions handled dynamically in AuthService
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    OtpService,
    RolesService,
    PermissionsService,
    BootstrapService,
  ],
  exports: [AuthService, RolesService, PermissionsService],
})
export class AuthDomainModule {}
