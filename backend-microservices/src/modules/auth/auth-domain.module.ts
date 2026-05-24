/**
 * @file auth-domain.module.ts
 *
 * Registers all auth module providers:
 *  - AuthController (routes)
 *  - SessionController (device session trust/revoke/list endpoints)
 *  - AuthService (orchestration)
 *  - AuthRepository (DB access)
 *  - BetterAuthGuard (session validation)
 *  - RolesGuard (RBAC)
 *  - BootstrapService (admin seed)
 *  - AuthEventEmitter (SOLE event emission point — wraps EventEmitter2)
 *  - SessionModule (device parser, GeoIP, risk assessment, suspicious session)
 *
 * Exports BetterAuthGuard and RolesGuard so AppModule can use them as
 * global guards via APP_GUARD token.
 *
 * COUPLING RULE: This module MUST NOT import CommunicationDomainModule
 * or any of its services. The event bus is the ONLY interface.
 */

import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/database/prisma/prisma.module';

import { AuthController } from './auth.controller';
import { SessionController } from './session/session.controller';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { BootstrapService } from './bootstrap/bootstrap.service';
import { BetterAuthGuard } from './guards/better-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { AuthEventEmitterModule } from './events/auth-event-emitter.module';
import { SessionModule } from './session/session.module';

@Module({
  imports: [
    PrismaModule,
    AuthEventEmitterModule,  // provides AuthEventEmitter — shared with SessionModule
    SessionModule,           // device detection, GeoIP, risk assessment, SuspiciousSessionService
  ],
  controllers: [
    AuthController,
    SessionController,
  ],
  providers: [
    AuthService,
    AuthRepository,
    BootstrapService,
    BetterAuthGuard,
    RolesGuard,
    // AuthEventEmitter is provided by AuthEventEmitterModule (imported above)
  ],
  exports: [
    BetterAuthGuard,
    RolesGuard,
    AuthService,
    AuthRepository,
    AuthEventEmitterModule,  // re-export the module so consumers get AuthEventEmitter
  ],
})
export class AuthDomainModule {}
