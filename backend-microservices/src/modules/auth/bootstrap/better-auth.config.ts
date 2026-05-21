import { betterAuth } from 'better-auth';
import { Logger } from '@nestjs/common';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { magicLink, twoFactor, emailOTP } from 'better-auth/plugins';
import { createAuthMiddleware } from 'better-auth/api';
import { GlobalEventDispatcher } from '../../../infrastructure/events/global-event-dispatcher';
import { GlobalSuspiciousSessionDispatcher } from '../../../infrastructure/events/global-suspicious-session-dispatcher';
import { AUTH_EVENTS } from '../../../shared/events/auth/auth-events.constants';
import { hashAuthPassword, verifyAuthPassword } from './password-hashing';
import type {
  UserRegisteredPayload,
  PasswordResetRequestedPayload,
  EmailVerificationRequestedPayload,
  OtpRequestedPayload,
  MagicLinkRequestedPayload,
  TwoFaCodeRequestedPayload,
  TwoFaEnabledPayload,
  GoogleAccountLinkedPayload,
  EmailChangeRequestedPayload,
} from '../../../shared/events/auth/auth-event-payloads.types';

// ─────────────────────────────────────────────────────────────────────────────
// Startup guard
// ─────────────────────────────────────────────────────────────────────────────

if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error(
    '[BetterAuth] BETTER_AUTH_SECRET environment variable is not set. ' +
    'Sessions would be signed with a public fallback key. Refusing to start.',
  );
}

const logger = new Logger('BetterAuthConfig');
const EMAIL_VERIFICATION_EXPIRES_IN_SECONDS = 60 * 60;

interface BetterAuthEmailUser {
  readonly id: string;
  readonly email: string;
}

interface EmailVerificationTokenPayload {
  readonly email?: string;
  readonly updateTo?: string;
  readonly requestType?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: build a base event payload from the fields available inside BA hooks.
//
// BA hooks run outside NestJS request scope — there is no AsyncLocalStorage
// requestId here. We generate a UUID for requestId and default locale to 'en'.
// In a future iteration, BA's custom context can carry the requestId forward.
// ─────────────────────────────────────────────────────────────────────────────

function basePayload(userId: string, email: string) {
  return {
    eventId:     crypto.randomUUID(),
    userId:      userId as ReturnType<typeof import('../../../shared/types/index').toUserId>,
    email,
    locale:      'en' as const,
    triggeredAt: new Date().toISOString(),
    requestId:   crypto.randomUUID(), // no request context in BA hooks
  };
}

function decodeEmailVerificationToken(token: string): EmailVerificationTokenPayload | null {
  const [, payload] = token.split('.');
  if (!payload) return null;

  try {
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    const parsed = JSON.parse(Buffer.from(padded, 'base64').toString('utf8')) as Record<string, unknown>;

    return {
      email:       typeof parsed.email === 'string' ? parsed.email : undefined,
      updateTo:    typeof parsed.updateTo === 'string' ? parsed.updateTo : undefined,
      requestType: typeof parsed.requestType === 'string' ? parsed.requestType : undefined,
    };
  } catch (err) {
    logger.warn(`[EmailVerification] Could not decode verification token metadata: ${err instanceof Error ? err.message : String(err)}`);
    return null;
  }
}

function emitVerificationEmailEvent(user: BetterAuthEmailUser, url: string, token: string): void {
  const tokenPayload = decodeEmailVerificationToken(token);
  const expiresAt = new Date(Date.now() + EMAIL_VERIFICATION_EXPIRES_IN_SECONDS * 1000).toISOString();
  const currentEmail = tokenPayload?.email ?? user.email;
  const newEmail = tokenPayload?.updateTo;

  if (newEmail) {
    GlobalEventDispatcher.emit(AUTH_EVENTS.EMAIL_CHANGE_REQUESTED, {
      ...basePayload(user.id, currentEmail),
      newEmail,
      verifyUrl: url,
      verifyToken: token,
      expiresAt,
    } satisfies EmailChangeRequestedPayload);
    return;
  }

  GlobalEventDispatcher.emit(AUTH_EVENTS.EMAIL_VERIFICATION_REQUESTED, {
    ...basePayload(user.id, user.email),
    verifyUrl: url,
    verifyToken: token,
    expiresAt,
  } satisfies EmailVerificationRequestedPayload);
}

// ─────────────────────────────────────────────────────────────────────────────
// Database setup
// ─────────────────────────────────────────────────────────────────────────────

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prismaClient = new PrismaClient({ adapter, log: ['error', 'warn'] });

const baseAdapter = prismaAdapter(prismaClient, {
  provider: 'postgresql',
});

type BaseAdapterCreator = typeof baseAdapter;
type AdapterInstance = ReturnType<BaseAdapterCreator>;
type TransactionAdapter = Parameters<Parameters<AdapterInstance['transaction']>[0]>[0];

type DbRecord = Record<string, string | string[] | number | boolean | Date | null | object>;

const convertBackupCodesForDb = (backupCodes: string | string[] | null): string[] => {
  if (Array.isArray(backupCodes)) {
    return backupCodes;
  }
  if (typeof backupCodes === 'string') {
    try {
      const parsed = JSON.parse(backupCodes) as string | string[];
      if (Array.isArray(parsed)) {
        return parsed;
      }
      return [backupCodes];
    } catch {
      return [backupCodes];
    }
  }
  return [];
};

const convertBackupCodesFromDb = (backupCodes: string | string[] | null): string | string[] | null => {
  if (Array.isArray(backupCodes)) {
    if (backupCodes.length === 1) {
      const first = backupCodes[0];
      if (typeof first === 'string') {
        if (first.startsWith('$ba$') || /^[0-9a-fA-F]{30,}$/.test(first)) {
          return first;
        }
      }
    }
    return JSON.stringify(backupCodes);
  }
  return backupCodes;
};

const mapTwoFactorRecord = <T>(record: T): T => {
  if (!record) return record;
  const rec = record as DbRecord;
  if ('backupCodes' in rec) {
    const updated = {
      ...rec,
      backupCodes: convertBackupCodesFromDb(rec.backupCodes as string | string[] | null),
    };
    return updated as T;
  }
  return record;
};

const wrapDBAdapter = (adapter: AdapterInstance): AdapterInstance => {
  return {
    ...adapter,
    create: async <T, R>(params: Parameters<AdapterInstance['create']>[0]): Promise<R> => {
      const { model, data } = params;
      if (model === 'twoFactor' && data && typeof data === 'object' && 'backupCodes' in data) {
        const dataObj = data as Record<string, string | string[] | null>;
        if (dataObj.backupCodes !== null) {
          const convertedData = {
            ...dataObj,
            backupCodes: convertBackupCodesForDb(dataObj.backupCodes),
          };
          const result = await adapter.create({
            ...params,
            data: convertedData
          }) as R;
          return mapTwoFactorRecord(result);
        }
      }
      const result = await adapter.create(params) as R;
      if (model === 'twoFactor') {
        return mapTwoFactorRecord(result);
      }
      return result;
    },
    findOne: async <T>(params: Parameters<AdapterInstance['findOne']>[0]): Promise<T | null> => {
      const { model } = params;
      const result = await adapter.findOne(params) as T | null;
      if (model === 'twoFactor') {
        return mapTwoFactorRecord(result);
      }
      return result;
    },
    findMany: async <T>(params: Parameters<AdapterInstance['findMany']>[0]): Promise<T[]> => {
      const { model } = params;
      const results = await adapter.findMany(params) as T[];
      if (model === 'twoFactor') {
        return results.map(mapTwoFactorRecord);
      }
      return results;
    },
    update: async <T>(params: Parameters<AdapterInstance['update']>[0]): Promise<T | null> => {
      const { model, update } = params;
      if (model === 'twoFactor' && update && 'backupCodes' in update) {
        const updateObj = update as Record<string, string | string[] | null>;
        if (updateObj.backupCodes !== null) {
          const convertedUpdate = {
            ...updateObj,
            backupCodes: convertBackupCodesForDb(updateObj.backupCodes),
          };
          const result = await adapter.update({ ...params, update: convertedUpdate }) as T | null;
          return mapTwoFactorRecord(result);
        }
      }
      const result = await adapter.update(params) as T | null;
      if (model === 'twoFactor') {
        return mapTwoFactorRecord(result);
      }
      return result;
    },
    consumeOne: async <T>(params: Parameters<AdapterInstance['consumeOne']>[0]): Promise<T | null> => {
      const { model } = params;
      const result = await adapter.consumeOne(params) as T | null;
      if (model === 'twoFactor') {
        return mapTwoFactorRecord(result);
      }
      return result;
    },
    transaction: async <R>(
      callback: (trx: TransactionAdapter) => Promise<R>
    ): Promise<R> => {
      return adapter.transaction<R>(async (trx) => {
        return callback(wrapTransactionAdapter(trx));
      });
    }
  };
};

const wrapTransactionAdapter = (adapter: TransactionAdapter): TransactionAdapter => {
  return {
    ...adapter,
    create: async <T, R>(params: Parameters<TransactionAdapter['create']>[0]): Promise<R> => {
      const { model, data } = params;
      if (model === 'twoFactor' && data && typeof data === 'object' && 'backupCodes' in data) {
        const dataObj = data as Record<string, string | string[] | null>;
        if (dataObj.backupCodes !== null) {
          const convertedData = {
            ...dataObj,
            backupCodes: convertBackupCodesForDb(dataObj.backupCodes),
          };
          const result = await adapter.create({
            ...params,
            data: convertedData
          }) as R;
          return mapTwoFactorRecord(result);
        }
      }
      const result = await adapter.create(params) as R;
      if (model === 'twoFactor') {
        return mapTwoFactorRecord(result);
      }
      return result;
    },
    findOne: async <T>(params: Parameters<TransactionAdapter['findOne']>[0]): Promise<T | null> => {
      const { model } = params;
      const result = await adapter.findOne(params) as T | null;
      if (model === 'twoFactor') {
        return mapTwoFactorRecord(result);
      }
      return result;
    },
    findMany: async <T>(params: Parameters<TransactionAdapter['findMany']>[0]): Promise<T[]> => {
      const { model } = params;
      const results = await adapter.findMany(params) as T[]
      if (model === 'twoFactor') {
        return results.map(mapTwoFactorRecord);
      }
      return results;
    },
    update: async <T>(params: Parameters<TransactionAdapter['update']>[0]): Promise<T | null> => {
      const { model, update } = params;
      if (model === 'twoFactor' && update && 'backupCodes' in update) {
        const updateObj = update as Record<string, string | string[] | null>;
        if (updateObj.backupCodes !== null) {
          const convertedUpdate = {
            ...updateObj,
            backupCodes: convertBackupCodesForDb(updateObj.backupCodes),
          };
          const result = await adapter.update({ ...params, update: convertedUpdate }) as T | null;
          return mapTwoFactorRecord(result);
        }
      }
      const result = await adapter.update(params) as T | null;
      if (model === 'twoFactor') {
        return mapTwoFactorRecord(result);
      }
      return result;
    },
    consumeOne: async <T>(params: Parameters<TransactionAdapter['consumeOne']>[0]): Promise<T | null> => {
      const { model } = params;
      const result = await adapter.consumeOne(params) as T | null;
      if (model === 'twoFactor') {
        return mapTwoFactorRecord(result);
      }
      return result;
    }
  };
};

const customAdapter = (options: Parameters<BaseAdapterCreator>[0]): AdapterInstance => {
  return wrapDBAdapter(baseAdapter(options));
};

// ─────────────────────────────────────────────────────────────────────────────
// Plugin: sync 2FA verified flag onto session record after successful verify
// ─────────────────────────────────────────────────────────────────────────────

const twoFactorSessionSync = () => {
  return {
    id: 'two-factor-session-sync',
    hooks: {
      after: [
        {
          matcher(context: { path?: string }) {
            return (
              context.path === '/two-factor/verify-otp' ||
              context.path === '/two-factor/verify-totp' ||
              context.path === '/two-factor/verify-backup-code'
            );
          },
          handler: createAuthMiddleware(async (ctx) => {
            const sessionTokenName = ctx.context.authCookies.sessionToken.name;
            let sessionToken: string | null = null;

            const cookieHeader = ctx.headers?.get('cookie');
            if (cookieHeader) {
              const match = cookieHeader.match(
                new RegExp(`(?:^|;\\s*)${sessionTokenName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\s*=\\s*([^;]*)`)
              );
              if (match && match[1]) {
                sessionToken = decodeURIComponent(match[1]).split('.')[0];
              }
            }

            if (!sessionToken) {
              const setCookieHeader = ctx.context.responseHeaders?.get('set-cookie');
              if (setCookieHeader) {
                const match = setCookieHeader.match(
                  new RegExp(`(?:^|;|,)\\s*${sessionTokenName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\s*=\\s*([^;]*)`)
                );
                if (match && match[1]) {
                  sessionToken = decodeURIComponent(match[1]).split('.')[0];
                }
              }
            }

            if (!sessionToken && ctx.context.newSession?.session?.token) {
              sessionToken = ctx.context.newSession.session.token;
            }

            if (!sessionToken) {
              try {
                const session = await ctx.context.getSession(ctx);
                if (session?.session?.token) {
                  sessionToken = session.session.token;
                }
              } catch {
                // ignore
              }
            }

            if (sessionToken) {
              try {
                await prismaClient.session.update({
                  where: { token: sessionToken },
                  data: { twoFactorVerified: true }
                });
                logger.log(`[Two-Factor Session Sync] Verified session: ${sessionToken}`);
              } catch (err) {
                logger.error('[Two-Factor Session Sync] Error updating session:', err);
              }
            } else {
              logger.warn('[Two-Factor Session Sync] Could not extract session token');
            }
          })
        }
      ]
    }
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Plugin: rotate other sessions after security-sensitive actions.
//         Also emits TWO_FA_ENABLED after /two-factor/enable.
// ─────────────────────────────────────────────────────────────────────────────

const securitySessionRotation = () => {
  return {
    id: 'security-session-rotation',
    hooks: {
      after: [
        {
          matcher(context: { path?: string }) {
            return (
              context.path === '/reset-password' ||
              context.path === '/change-password' ||
              context.path === '/two-factor/enable' ||
              context.path === '/two-factor/disable'
            );
          },
          handler: createAuthMiddleware(async (ctx) => {
            try {
              const sessionTokenName = ctx.context.authCookies.sessionToken.name;
              let sessionToken: string | null = null;

              const cookieHeader = ctx.headers?.get('cookie');
              if (cookieHeader) {
                const match = cookieHeader.match(
                  new RegExp(`(?:^|;\\s*)${sessionTokenName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\s*=\\s*([^;]*)`)
                );
                if (match && match[1]) {
                  sessionToken = decodeURIComponent(match[1]).split('.')[0];
                }
              }

              if (sessionToken) {
                const sessionRecord = await prismaClient.session.findUnique({ where: { token: sessionToken } });
                if (sessionRecord) {
                  // Rotate sessions
                  await prismaClient.session.deleteMany({
                    where: {
                      userId: sessionRecord.userId,
                      token: { not: sessionToken },
                    },
                  });
                  logger.log(`[Security] Rotated sessions for user ${sessionRecord.userId}`);

                  // ── Emit TWO_FA_ENABLED after /two-factor/enable ──────────────
                  if (ctx.path === '/two-factor/enable') {
                    const user = await prismaClient.user.findUnique({
                      where: { id: sessionRecord.userId },
                    });
                    if (user) {
                      GlobalEventDispatcher.emit(AUTH_EVENTS.TWO_FA_ENABLED, {
                        ...basePayload(user.id, user.email),
                        enabledAt: new Date().toISOString(),
                      } satisfies TwoFaEnabledPayload);
                    }
                  }
                }
              }
            } catch (err) {
              logger.error('[Security] Error in session rotation hook:', err);
            }
          })
        }
      ]
    }
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Plugin: emit GOOGLE_ACCOUNT_LINKED after Google OAuth creates an account
//         or links to an existing one.
// ─────────────────────────────────────────────────────────────────────────────

const googleAccountLinkedPlugin = () => {
  return {
    id: 'google-account-linked',
    hooks: {
      after: [
        {
          matcher(context: { path?: string }) {
            // Better Auth calls /callback/google after OAuth completes
            return context.path === '/callback/google';
          },
          handler: createAuthMiddleware(async (ctx) => {
            try {
              // After Google OAuth, ctx.context.newSession has the user
              const session = ctx.context.newSession;
              if (!session?.user) return;

              const user = session.user;
              // Find the Google account record to get the Google email
              const googleAccount = await prismaClient.account.findFirst({
                where: { userId: user.id, providerId: 'google' },
              });

              GlobalEventDispatcher.emit(AUTH_EVENTS.GOOGLE_ACCOUNT_LINKED, {
                ...basePayload(user.id, user.email),
                googleEmail: googleAccount?.accountId ?? user.email,
                linkedAt:    new Date().toISOString(),
              } satisfies GoogleAccountLinkedPayload);
            } catch (err) {
              logger.error('[Google Linked] Error emitting event:', err);
            }
          })
        }
      ]
    }
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Better Auth configuration
// ─────────────────────────────────────────────────────────────────────────────

export const auth = betterAuth({
  database: customAdapter,
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL!,
  trustedOrigins: [
    process.env.FRONTEND_URL!,
  ],
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
      strategy: 'jwt',
    },
    additionalFields: {
      twoFactorVerified: {
        type: 'boolean',
        required: false,
        defaultValue: false,
      },
    },
  },
  user: {
    fields: {
      name: 'firstName',
    },
    changeEmail: {
      enabled: true,
      updateEmailWithoutVerification: false,
    },
    additionalFields: {
      lastName: {
        type: 'string',
        required: false,
      },
      role: {
        type: 'string',
        required: false,
        defaultValue: 'CUSTOMER',
      },
    },
  },
  rateLimit: {
    window: 60,
    max: 100,
    customRules: {
      '/sign-in':           { window: 60, max: 5 },
      '/sign-up':           { window: 60, max: 5 },
      '/magic-link/send':   { window: 60, max: 3 },
      '/two-factor/send-otp':   { window: 60, max: 3 },
      '/two-factor/verify-otp': { window: 60, max: 5 },
    }
  },
  advanced: {
    disableOriginCheck: process.env.NODE_ENV !== 'production',
    disableCSRFCheck: process.env.DISABLE_CSRF_PROTECTION === 'true',
    cookies: {
      session_token: {
        name: '__Host-session',
      },
    },
    getIp: (req: Request) => {
      if (!req || !req.headers) return '0.0.0.0';
      const cfIp = req.headers.get('cf-connecting-ip');
      if (cfIp) return cfIp;
      
      const forwardedFor = req.headers.get('x-forwarded-for');
      if (forwardedFor) {
        return forwardedFor.split(',')[0].trim();
      }

      const realIp = req.headers.get('x-real-ip');
      if (realIp) return realIp;

      // Fallback for native Node request object if exposed
      const socketIp = (req as any).socket?.remoteAddress;
      return socketIp || '0.0.0.0';
    },
  },

  // ── Database hooks ────────────────────────────────────────────────────────

  databaseHooks: {
    user: {
      create: {
        /**
         * USER_REGISTERED — fired after new user row is committed to DB.
         * Covers email/password sign-up and first-time Google OAuth.
         */
        after: async (user) => {
          GlobalEventDispatcher.emit(AUTH_EVENTS.USER_REGISTERED, {
            ...basePayload(user.id, user.email),
            displayName: (user as { name?: string }).name ?? user.email.split('@')[0],
            authMethod:  'email_password',   // BA doesn't tell us here; Google path adds its own event via googleAccountLinkedPlugin
          } satisfies UserRegisteredPayload);
        },
      },
    },
    session: {
      create: {
        /**
         * processSignIn — fires on every sign-in session creation.
         * We use the BA session object to extract userId then delegate to
         * GlobalSuspiciousSessionDispatcher which calls SuspiciousSessionService.
         *
         * IP extraction order: cf-connecting-ip → x-forwarded-for (first IP) → x-real-ip → socket.
         * Note: BA hooks don't expose the raw request — IP comes from session.ipAddress
         * which BA populates from the request before calling this hook.
         */
        after: async (session) => {
          // BA already stores ipAddress and userAgent on the session record
          const ipAddress = session.ipAddress ?? '0.0.0.0';
          const userAgent = session.userAgent ?? '';

          // Look up user email — needed for event payload
          const user = await prismaClient.user.findUnique({
            where: { id: session.userId },
            select: { email: true },
          });

          if (!user) return;  // should not happen, but guard defensively

          await GlobalSuspiciousSessionDispatcher.processSignIn({
            userId:              session.userId as (string & { readonly _brand: 'UserId' }),
            betterAuthSessionId: session.id,
            sessionId:           session.token  as (string & { readonly _brand: 'SessionId' }),
            email:               user.email,
            locale:              'en',
            ipAddress:           ipAddress      as (string & { readonly _brand: 'IpAddress' }),
            userAgent,
            requestId:           crypto.randomUUID(),  // no request context in BA hooks
          });

        },
      },
    },
  },

  emailVerification: {
    expiresIn: EMAIL_VERIFICATION_EXPIRES_IN_SECONDS,
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async (
      { user, url, token }: { user: BetterAuthEmailUser; url: string; token: string },
    ) => {
      emitVerificationEmailEvent(user, url, token);
    },
  },

  // ── Email/password ────────────────────────────────────────────────────────

  emailAndPassword: {
    enabled: true,
    password: {
      hash: hashAuthPassword,
      verify: verifyAuthPassword,
    },
    /**
     * PASSWORD_RESET_REQUESTED — Better Auth calls this when the user
     * requests a password reset. `token` is the raw reset token; `url` is
     * the fully constructed reset URL.
     */
    sendResetPassword: async ({ user, url, token }: { user: { id: string; email: string }; url: string; token: string }) => {
      // Expiry: BA default is 1 hour for reset tokens
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

      GlobalEventDispatcher.emit(AUTH_EVENTS.PASSWORD_RESET_REQUESTED, {
        ...basePayload(user.id, user.email),

        resetUrl:   url,
        resetToken: token,
        expiresAt,
        ipAddress:  'unknown', // no request context in BA callback — enrich via middleware if needed
        userAgent:  'unknown',
      } satisfies PasswordResetRequestedPayload);
    },
  },

  // ── Plugins ───────────────────────────────────────────────────────────────

  plugins: [
    magicLink({
      /**
       * MAGIC_LINK_REQUESTED — BA calls this when a magic link is sent.
       * `email` is the user's email; `url` is the fully constructed magic link.
       */
      sendMagicLink: async ({ email, url, token }: { email: string; url: string; token: string }) => {
        // Resolve userId from email — needed for BaseAuthEventPayload
        const user = await prismaClient.user.findUnique({
          where: { email },
          select: { id: true },
        });

        if (!user) {
          logger.warn(`[MagicLink] User not found for email ${email} — event not emitted`);
          return;
        }

        // BA magic link token TTL is typically 5 minutes
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

        GlobalEventDispatcher.emit(AUTH_EVENTS.MAGIC_LINK_REQUESTED, {
          ...basePayload(user.id, email),
          magicLinkUrl: url,
          expiresAt,
        } satisfies MagicLinkRequestedPayload);
      },
    }),

    twoFactor({
      allowPasswordless: true,
      skipVerificationOnEnable: false,
      otpOptions: {
        period: 600, // 10 minutes
        /**
         * TWO_FA_CODE_REQUESTED — fired when the twoFactor plugin sends an OTP.
         * This is the login-time 2FA code (different from email verification OTP).
         */
        sendOTP: async ({ user, otp }: { user: { id: string; email: string }; otp: string }) => {
          const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

          GlobalEventDispatcher.emit(AUTH_EVENTS.TWO_FA_CODE_REQUESTED, {
            ...basePayload(user.id, user.email),
            totpCode:   otp,
            expiresAt,
            deviceHint: 'unknown', // no UA context in BA hook
          } satisfies TwoFaCodeRequestedPayload);
        },
      },
    }),

    emailOTP({
      /**
       * OTP_REQUESTED — fired when the emailOTP plugin sends a verification code.
       * Covers: sign-up email verification, login OTP, and OTP-based email change verification.
       * `type` can be 'sign-in' | 'email-verification' | 'forget-password' | 'change-email'
       */
      sendVerificationOTP: async ({ email, otp, type }: { email: string; otp: string; type: string }) => {
        const user = await prismaClient.user.findUnique({
          where: { email },
          select: { id: true },
        });

        if (!user) {
          logger.warn(`[EmailOTP] User not found for email ${email} — event not emitted`);
          return;
        }

        const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

        // Map BA's `type` to our OtpPurpose enum
        const purposeMap: Record<string, 'EMAIL_VERIFICATION' | 'LOGIN' | 'PASSWORD_RESET'> = {
          'email-verification': 'EMAIL_VERIFICATION',
          'sign-in':            'LOGIN',
          'forget-password':    'PASSWORD_RESET',
          'change-email':       'EMAIL_VERIFICATION',
        };
        const purpose = purposeMap[type] ?? 'EMAIL_VERIFICATION';

        GlobalEventDispatcher.emit(AUTH_EVENTS.OTP_REQUESTED, {
          ...basePayload(user.id, email),
          otpCode:      otp,
          purpose,
          expiresAt,
          attemptCount: 1,   // BA doesn't expose attempt count in this hook
        } satisfies OtpRequestedPayload);
      },
    }),

    twoFactorSessionSync(),
    securitySessionRotation(),
    googleAccountLinkedPlugin(),
  ],
});
