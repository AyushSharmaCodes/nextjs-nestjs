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
 *  - AuthAuditListener (event-driven audit logging)
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
import { AuthAuditListener } from './listeners/auth-audit.listener';
import { AuthEventEmitter } from './events/auth-event.emitter';
import { SessionModule } from './session/session.module';

@Module({
  imports: [
    PrismaModule,
    SessionModule,   // device detection, GeoIP, risk assessment, SuspiciousSessionService
  ],
  controllers: [
    AuthController,
    SessionController,  // GET /auth/sessions, POST /auth/session/confirm/:id, POST /auth/session/revoke/:id
  ],
  providers: [
    AuthService,
    AuthRepository,
    BootstrapService,
    BetterAuthGuard,
    RolesGuard,
    AuthAuditListener,
    // AuthEventEmitter is provided here and visible to SessionModule
    // via the parent module context — NestJS resolves it cross-module
    // when SessionModule is imported here.
    AuthEventEmitter,
  ],
  exports: [
    BetterAuthGuard,
    RolesGuard,
    AuthService,
    AuthRepository,
    AuthEventEmitter,
  ],
})
export class AuthDomainModule {}
