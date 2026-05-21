/**
 * @file infrastructure/events/global-suspicious-session-dispatcher.ts
 *
 * Singleton bridge that exposes SuspiciousSessionService to contexts outside
 * NestJS DI — specifically the Better Auth session.create hook in better-auth.config.ts.
 *
 * Initialized during AuthDomainModule bootstrap (BootstrapService.onModuleInit).
 * Mirrors the GlobalEventDispatcher pattern already in use.
 *
 * IMPORTANT: This must be set before the first sign-in occurs.
 * BootstrapService calls setService() during onModuleInit.
 */

import { Logger } from '@nestjs/common';
import type { SuspiciousSessionService } from '../../modules/auth/session/suspicious-session.service';
import type { SignInContext } from '../../shared/types/device.types';
import type { DeviceSessionEntity } from '../../shared/types/device.types';

const logger = new Logger('GlobalSuspiciousSessionDispatcher');

export class GlobalSuspiciousSessionDispatcher {
  private static service: SuspiciousSessionService | null = null;

  /** Called from BootstrapService.onModuleInit() after NestJS DI resolves. */
  static setService(service: SuspiciousSessionService): void {
    if (!GlobalSuspiciousSessionDispatcher.service) {
      GlobalSuspiciousSessionDispatcher.service = service;
      logger.log('GlobalSuspiciousSessionDispatcher initialized');
    }
  }

  /**
   * Process a sign-in event through the risk detection pipeline.
   * Returns void. Errors inside the pipeline are swallowed and logged.
   */
  static async processSignIn(context: SignInContext): Promise<void> {
    if (!GlobalSuspiciousSessionDispatcher.service) {
      logger.warn(`processSignIn called before dispatcher was initialized — skipping risk check for user ${context.userId}`);
      return;
    }

    try {
      await GlobalSuspiciousSessionDispatcher.service.processSignIn(context);
    } catch (err: unknown) {
      const reason = err instanceof Error ? err.message : String(err);
      logger.error({ userId: context.userId, reason }, 'GlobalSuspiciousSessionDispatcher.processSignIn failed (non-fatal)');
    }
  }
}
