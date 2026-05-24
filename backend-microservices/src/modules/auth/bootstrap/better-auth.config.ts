import { Logger } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { createAuthMiddleware } from 'better-auth/api';
import { emailOTP, magicLink, twoFactor } from 'better-auth/plugins';
import { i18n } from '@better-auth/i18n';
import { Pool } from 'pg';
import { GlobalEventDispatcher } from '../../../infrastructure/events/global-event-dispatcher';
import { GlobalSuspiciousSessionDispatcher } from '../../../infrastructure/events/global-suspicious-session-dispatcher';
import type {
  EmailChangeRequestedPayload,
  EmailVerificationRequestedPayload,
  GoogleAccountLinkedPayload,
  MagicLinkRequestedPayload,
  OtpRequestedPayload,
  PasswordResetRequestedPayload,
  TwoFaCodeRequestedPayload,
  TwoFaEnabledPayload,
  UserRegisteredPayload,
} from '../../../shared/events/auth/auth-event-payloads.types';
import { AUTH_EVENTS } from '../../../shared/events/auth/auth-events.constants';
import { hashAuthPassword, verifyAuthPassword } from './password-hashing';

// ─────────────────────────────────────────────────────────────────────────────
// Startup guard
// ─────────────────────────────────────────────────────────────────────────────

if (!process.env.BETTER_AUTH_SECRET) { // ts-audit-ignore
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
    eventId: crypto.randomUUID(),
    userId: userId as ReturnType<typeof import('../../../shared/types/index').toUserId>,
    email,
    locale: 'en' as const,
    triggeredAt: new Date().toISOString(),
    requestId: crypto.randomUUID(), // no request context in BA hooks
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
      email: typeof parsed.email === 'string' ? parsed.email : undefined,
      updateTo: typeof parsed.updateTo === 'string' ? parsed.updateTo : undefined,
      requestType: typeof parsed.requestType === 'string' ? parsed.requestType : undefined,
    };
  } catch (err: unknown) {
    logger.warn(
      `[EmailVerification] Could not decode verification token metadata: ${err instanceof Error ? err.message : String(err)}`,
    );
    return null;
  }
}

function emitVerificationEmailEvent(user: BetterAuthEmailUser, url: string, token: string): void {
  const tokenPayload = decodeEmailVerificationToken(token);
  const expiresAt = new Date(Date.now() + EMAIL_VERIFICATION_EXPIRES_IN_SECONDS * 1000).toISOString();
  const currentEmail = tokenPayload?.email ?? user.email;
  const newEmail = tokenPayload?.updateTo;

  if (newEmail) {
    setImmediate(() => {
      GlobalEventDispatcher.emit(AUTH_EVENTS.EMAIL_CHANGE_REQUESTED, {
        ...basePayload(user.id, currentEmail),
        newEmail,
        verifyUrl: url,
        verifyToken: token,
        expiresAt,
      } satisfies EmailChangeRequestedPayload);
    });
    return;
  }

  setImmediate(() => {
    GlobalEventDispatcher.emit(AUTH_EVENTS.EMAIL_VERIFICATION_REQUESTED, {
      ...basePayload(user.id, user.email),
      verifyUrl: url,
      verifyToken: token,
      expiresAt,
    } satisfies EmailVerificationRequestedPayload);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Database setup
// ─────────────────────────────────────────────────────────────────────────────

const connectionString = process.env.DATABASE_URL; // ts-audit-ignore
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
          const result = (await adapter.create({
            ...params,
            data: convertedData,
          })) as R;
          return mapTwoFactorRecord(result);
        }
      }
      const result = (await adapter.create(params)) as R;
      if (model === 'twoFactor') {
        return mapTwoFactorRecord(result);
      }
      return result;
    },
    findOne: async <T>(params: Parameters<AdapterInstance['findOne']>[0]): Promise<T | null> => {
      const { model } = params;
      const result = (await adapter.findOne(params)) as T | null;
      if (model === 'twoFactor') {
        return mapTwoFactorRecord(result);
      }
      return result;
    },
    findMany: async <T>(params: Parameters<AdapterInstance['findMany']>[0]): Promise<T[]> => {
      const { model } = params;
      const results = (await adapter.findMany(params)) as T[];
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
          const result = (await adapter.update({ ...params, update: convertedUpdate })) as T | null;
          return mapTwoFactorRecord(result);
        }
      }
      const result = (await adapter.update(params)) as T | null;
      if (model === 'twoFactor') {
        return mapTwoFactorRecord(result);
      }
      return result;
    },
    consumeOne: async <T>(params: Parameters<AdapterInstance['consumeOne']>[0]): Promise<T | null> => {
      const { model } = params;
      const result = (await adapter.consumeOne(params)) as T | null;
      if (model === 'twoFactor') {
        return mapTwoFactorRecord(result);
      }
      return result;
    },
    transaction: async <R>(callback: (trx: TransactionAdapter) => Promise<R>): Promise<R> => {
      return adapter.transaction<R>(async trx => {
        return callback(wrapTransactionAdapter(trx));
      });
    },
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
          const result = (await adapter.create({
            ...params,
            data: convertedData,
          })) as R;
          return mapTwoFactorRecord(result);
        }
      }
      const result = (await adapter.create(params)) as R;
      if (model === 'twoFactor') {
        return mapTwoFactorRecord(result);
      }
      return result;
    },
    findOne: async <T>(params: Parameters<TransactionAdapter['findOne']>[0]): Promise<T | null> => {
      const { model } = params;
      const result = (await adapter.findOne(params)) as T | null;
      if (model === 'twoFactor') {
        return mapTwoFactorRecord(result);
      }
      return result;
    },
    findMany: async <T>(params: Parameters<TransactionAdapter['findMany']>[0]): Promise<T[]> => {
      const { model } = params;
      const results = (await adapter.findMany(params)) as T[];
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
          const result = (await adapter.update({ ...params, update: convertedUpdate })) as T | null;
          return mapTwoFactorRecord(result);
        }
      }
      const result = (await adapter.update(params)) as T | null;
      if (model === 'twoFactor') {
        return mapTwoFactorRecord(result);
      }
      return result;
    },
    consumeOne: async <T>(params: Parameters<TransactionAdapter['consumeOne']>[0]): Promise<T | null> => {
      const { model } = params;
      const result = (await adapter.consumeOne(params)) as T | null;
      if (model === 'twoFactor') {
        return mapTwoFactorRecord(result);
      }
      return result;
    },
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
          handler: createAuthMiddleware(async ctx => {
            const sessionTokenName = ctx.context.authCookies.sessionToken.name;
            let sessionToken: string | null = null;

            const cookieHeader = ctx.headers?.get('cookie');
            if (cookieHeader) {
              const match = cookieHeader.match(
                new RegExp(`(?:^|;\\s*)${sessionTokenName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\s*=\\s*([^;]*)`),
              );
              if (match && match[1]) {
                sessionToken = decodeURIComponent(match[1]).split('.')[0];
              }
            }

            if (!sessionToken) {
              const setCookieHeader = ctx.context.responseHeaders?.get('set-cookie');
              if (setCookieHeader) {
                const match = setCookieHeader.match(
                  new RegExp(
                    `(?:^|;|,)\\s*${sessionTokenName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\s*=\\s*([^;]*)`,
                  ),
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
              } catch (err: unknown) {
                logger.warn(
                  `[Two-Factor Session Sync] Failed to get session from context: ${
                    err instanceof Error ? err.message : String(err)
                  }`,
                );
              }
            }

            if (sessionToken) {
              try {
                await prismaClient.session.update({
                  where: { token: sessionToken },
                  data: { twoFactorVerified: true },
                });
                logger.log(`[Two-Factor Session Sync] Verified session: ${sessionToken}`);
              } catch (err: unknown) {
                logger.error('[Two-Factor Session Sync] Error updating session:', err);
              }
            } else {
              logger.warn('[Two-Factor Session Sync] Could not extract session token');
            }
          }),
        },
      ],
    },
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
              context.path === '/two-factor/verify-totp' ||
              context.path === '/two-factor/disable'
            );
          },
          handler: createAuthMiddleware(async ctx => {
            try {
              const sessionTokenName = ctx.context.authCookies.sessionToken.name;
              let sessionToken: string | null = null;

              const cookieHeader = ctx.headers?.get('cookie');
              if (cookieHeader) {
                const match = cookieHeader.match(
                  new RegExp(
                    `(?:^|;\\s*)${sessionTokenName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\s*=\\s*([^;]*)`,
                  ),
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

                  // ── Emit TWO_FA_ENABLED after 2FA activation is complete ────────
                  if (ctx.path === '/two-factor/enable' || ctx.path === '/two-factor/verify-totp') {
                    const user = await prismaClient.user.findUnique({
                      where: { id: sessionRecord.userId },
                    });
                    if (user && user.twoFactorEnabled) {
                      GlobalEventDispatcher.emit(AUTH_EVENTS.TWO_FA_ENABLED, {
                        ...basePayload(user.id, user.email),
                        enabledAt: new Date().toISOString(),
                      } satisfies TwoFaEnabledPayload);
                    }
                  }
                }
              }
            } catch (err: unknown) {
              logger.error('[Security] Error in session rotation hook:', err);
            }
          }),
        },
      ],
    },
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
          handler: createAuthMiddleware(async ctx => {
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
                linkedAt: new Date().toISOString(),
              } satisfies GoogleAccountLinkedPayload);
            } catch (err: unknown) {
              logger.error('[Google Linked] Error emitting event:', err);
            }
          }),
        },
      ],
    },
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Better Auth configuration
// ─────────────────────────────────────────────────────────────────────────────

export const auth = betterAuth({
  database: customAdapter,
  secret: process.env.BETTER_AUTH_SECRET, // ts-audit-ignore
  baseURL: process.env.BETTER_AUTH_URL!, // ts-audit-ignore
  trustedOrigins: [process.env.FRONTEND_URL!], // ts-audit-ignore
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
      lastLoginAt: {
        type: 'date',
        required: false,
        input: false,
      },
    },
  },
  rateLimit: {
    window: 60,
    max: 100,
    customRules: {
      '/sign-in': { window: 60, max: 5 },
      '/sign-up': { window: 60, max: 5 },
      '/magic-link/send': { window: 60, max: 3 },
      '/two-factor/send-otp': { window: 60, max: 3 },
      '/two-factor/verify-otp': { window: 60, max: 5 },
    },
  },
  advanced: {
    disableOriginCheck: process.env.NODE_ENV !== 'production', // ts-audit-ignore
    disableCSRFCheck: process.env.DISABLE_CSRF_PROTECTION === 'true', // ts-audit-ignore
    cookies: {
      session_token: {
        name: process.env.NODE_ENV === 'production' ? '__Host-session' : 'session', // ts-audit-ignore
        // __Host- prefix requires Secure + HTTPS — only valid in production.
        // In development (HTTP localhost) we use a plain name so the browser
        // actually sends the cookie. The Secure flag is still set in production
        // by Better Auth automatically when the URL is HTTPS.
        attributes: {
          sameSite: 'lax',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production', // ts-audit-ignore
          path: '/',
        },
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
      // We double cast through unknown because the standard Request object has a different type signature, but we check if the underlying socket is exposed.
      const socketIp = (req as unknown as { socket?: { remoteAddress?: string } }).socket?.remoteAddress;
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
        after: async user => {
          GlobalEventDispatcher.emit(AUTH_EVENTS.USER_REGISTERED, {
            ...basePayload(user.id, user.email),
            displayName: (user as { name?: string }).name ?? user.email.split('@')[0],
            authMethod: 'email_password', // BA doesn't tell us here; Google path adds its own event via googleAccountLinkedPlugin
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
        after: async session => {
          try {
            // BA already stores ipAddress and userAgent on the session record
            const ipAddress = session.ipAddress ?? '0.0.0.0';
            const userAgent = session.userAgent ?? '';

            // Track last successful sign-in on the user record while keeping
            // request auth fully stateless (JWT validation still needs no DB read).
            const user = await prismaClient.user.update({
              where: { id: session.userId },
              data: { lastLoginAt: session.createdAt },
              select: { email: true },
            });

            await GlobalSuspiciousSessionDispatcher.processSignIn({
              userId: session.userId as string & { readonly _brand: 'UserId' },
              betterAuthSessionId: session.id,
              sessionId: session.token as string & { readonly _brand: 'SessionId' },
              email: user.email,
              locale: 'en',
              ipAddress: ipAddress as string & { readonly _brand: 'IpAddress' },
              userAgent,
              requestId: crypto.randomUUID(), // no request context in BA hooks
            });
          } catch (err: unknown) {
            logger.error(
              '[Session Create Hook] Failed to persist lastLoginAt or process suspicious-session checks:',
              err,
            );
          }
        },
      },
    },
  },

  emailVerification: {
    expiresIn: EMAIL_VERIFICATION_EXPIRES_IN_SECONDS,
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url, token }: { user: BetterAuthEmailUser; url: string; token: string }) => {
      emitVerificationEmailEvent(user, url, token);
    },
  },

  // ── Email/password ────────────────────────────────────────────────────────

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    password: {
      hash: hashAuthPassword,
      verify: verifyAuthPassword,
    },
    /**
     * PASSWORD_RESET_REQUESTED — Better Auth calls this when the user
     * requests a password reset. `token` is the raw reset token; `url` is
     * the fully constructed reset URL.
     */
    sendResetPassword: async ({
      user,
      url,
      token,
    }: {
      user: { id: string; email: string };
      url: string;
      token: string;
    }) => {
      // Expiry: BA default is 1 hour for reset tokens
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

      setImmediate(() => {
        GlobalEventDispatcher.emit(AUTH_EVENTS.PASSWORD_RESET_REQUESTED, {
          ...basePayload(user.id, user.email),

          resetUrl: url,
          resetToken: token,
          expiresAt,
          ipAddress: 'unknown', // no request context in BA callback — enrich via middleware if needed
          userAgent: 'unknown',
        } satisfies PasswordResetRequestedPayload);
      });
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

        setImmediate(() => {
          GlobalEventDispatcher.emit(AUTH_EVENTS.MAGIC_LINK_REQUESTED, {
            ...basePayload(user.id, email),
            magicLinkUrl: url,
            expiresAt,
          } satisfies MagicLinkRequestedPayload);
        });
      },
    }),

    twoFactor({
      allowPasswordless: true,
      skipVerificationOnEnable: false,
      issuer: 'MeriGauMata',
      otpOptions: {
        period: 600, // 10 minutes
        /**
         * TWO_FA_CODE_REQUESTED — fired when the twoFactor plugin sends an OTP.
         * This is the login-time 2FA code (different from email verification OTP).
         */
        sendOTP: async ({ user, otp }: { user: { id: string; email: string }; otp: string }) => {
          const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

          setImmediate(() => {
            GlobalEventDispatcher.emit(AUTH_EVENTS.TWO_FA_CODE_REQUESTED, {
              ...basePayload(user.id, user.email),
              totpCode: otp,
              expiresAt,
              deviceHint: 'unknown', // no UA context in BA hook
            } satisfies TwoFaCodeRequestedPayload);
          });
        },
      },
    }),

    emailOTP({
      otpLength: 6,
      /**
       * OTP_REQUESTED — fired when the emailOTP plugin sends a verification code.
       * Covers: sign-up email verification, login OTP, and OTP-based email change verification.
       * `type` can be 'sign-in' | 'email-verification' | 'forget-password' | 'change-email'
       */
      sendVerificationOTP: async ({ email, otp, type }: { email: string; otp: string; type: string }) => {
        logger.log(`[EmailOTP] sendVerificationOTP callback invoked: email=${email}, type=${type}`);
        
        let user = await prismaClient.user.findFirst({
          where: { email: { equals: email, mode: 'insensitive' } },
          select: { id: true },
        });

        if (!user) {
          logger.warn(`[EmailOTP] Case-insensitive lookup failed for ${email}. Attempting exact findUnique...`);
          user = await prismaClient.user.findUnique({
            where: { email },
            select: { id: true },
          });
        }

        if (!user) {
          logger.error(`[EmailOTP] User not found in database for email "${email}". Event NOT emitted!`);
          return;
        }

        logger.log(`[EmailOTP] User found: id=${user.id}. Dispatching OTP verification email asynchronously.`);

        const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

        // Map BA's `type` to our OtpPurpose enum
        const purposeMap: Record<string, 'EMAIL_VERIFICATION' | 'LOGIN' | 'PASSWORD_RESET'> = {
          'email-verification': 'EMAIL_VERIFICATION',
          'sign-in': 'LOGIN',
          'forget-password': 'PASSWORD_RESET',
          'change-email': 'EMAIL_VERIFICATION',
        };
        const purpose = purposeMap[type] ?? 'EMAIL_VERIFICATION';

        // Dispatch completely asynchronously to bypass any hook promise blocks
        setImmediate(() => {
          GlobalEventDispatcher.emit(AUTH_EVENTS.OTP_REQUESTED, {
            ...basePayload(user.id, email),
            otpCode: otp,
            purpose,
            expiresAt,
            attemptCount: 1, // BA doesn't expose attempt count in this hook
          } satisfies OtpRequestedPayload);
        });
      },
    }),

    twoFactorSessionSync(),
    securitySessionRotation(),
    googleAccountLinkedPlugin(),
    i18n({
      defaultLocale: 'en',
      detection: ['header', 'cookie'],
      translations: {
        hi: {
          INVALID_EMAIL_OR_PASSWORD: 'गलत ईमेल या पासवर्ड। कृपया अपनी जानकारी जांचें और पुनः प्रयास करें।',
          INVALID_PASSWORD: 'गलत ईमेल या पासवर्ड। कृपया अपनी जानकारी जांचें और पुनः प्रयास करें।',
          USER_NOT_FOUND: 'उपयोगकर्ता नहीं मिला',
          EMAIL_ALREADY_EXISTS: 'इस ईमेल पते से पहले से एक खाता मौजूद है। साइन इन करने या पासवर्ड रीसेट करने का प्रयास करें।',
          EMAIL_NOT_VERIFIED: 'आपका ईमेल पता अभी सत्यापित नहीं हुआ है। कृपया अपने इनबॉक्स में सत्यापन कोड देखें।',
          OTP_EXPIRED: 'सत्यापन कोड की समय-सीमा समाप्त हो गई है। कृपया नया कोड अनुरोध करें।',
          OTP_INVALID: 'आपने जो सत्यापन कोड दर्ज किया वह गलत है। कृपया पुनः प्रयास करें।',
          MAGIC_LINK_EXPIRED: 'यह मैजिक लिंक समाप्त हो गया है। कृपया नया साइन-इन लिंक अनुरोध करें।',
          MAGIC_LINK_INVALID: 'यह मैजिक लिंक अमान्य है। कृपया नया लिंक अनुरोध करें।',
          MAGIC_LINK_ALREADY_USED: 'यह मैजिक लिंक पहले ही उपयोग हो चुका है। कृपया नया साइन-इन लिंक अनुरोध करें।',
          TOKEN_EXPIRED: 'आपका सत्र समाप्त हो गया है। जारी रखने के लिए फिर से साइन इन करें।',
          SESSION_EXPIRED: 'आपका सत्र समाप्त हो गया है। जारी रखने के लिए फिर से साइन इन करें।',
          TOKEN_INVALID: 'आपका सत्र अमान्य है या रद्द कर दिया गया है। कृपया फिर से साइन इन करें।',
          SESSION_INVALID: 'आपका सत्र अमान्य है या रद्द कर दिया गया है। कृपया फिर से साइन इन करें।',
          REFRESH_TOKEN_REUSE: 'आपके सत्र में एक सुरक्षा समस्या का पता चला। आपकी सुरक्षा के लिए आपको साइन आउट कर दिया गया है।',
          GOOGLE_AUTH_FAILED: 'Google साइन-इन में त्रुटि हुई। कृपया पुनः प्रयास करें।',
          ACCOUNT_LOCKED: 'बहुत अधिक असफल प्रयासों के कारण आपका खाता अस्थायी रूप से लॉक हो गया है।',
          ACCOUNT_DISABLED: 'आपका खाता अक्षम कर दिया गया है। सहायता के लिए समर्थन से संपर्क करें।',
          TOKEN_GENERATION_FAILED: 'आपका सत्र बनाने में समस्या हुई। कृपया पुनः प्रयास करें।',
          DB_WRITE_FAILED: 'एक डेटाबेस त्रुटि हुई। कृपया पुनः प्रयास करें।',
        },
        ta: {
          INVALID_EMAIL_OR_PASSWORD: 'தவறான மின்னஞ்சல் அல்லது கடவுச்சொல். உங்கள் தகவலை சரிபார்த்து மீண்டும் முயற்சிக்கவும்.',
          INVALID_PASSWORD: 'தவறான மின்னஞ்சல் அல்லது கடவுச்சொல். உங்கள் தகவலை சரிபார்த்து மீண்டும் முயற்சிக்கவும்.',
          USER_NOT_FOUND: 'பயனர் இல்லை',
          EMAIL_ALREADY_EXISTS: 'இந்த மின்னஞ்சல் முகவரியில் ஏற்கனவே ஒரு கணக்கு உள்ளது.',
          EMAIL_NOT_VERIFIED: 'உங்கள் மின்னஞ்சல் முகவரி இன்னும் சரிபார்க்கப்படவில்லை.',
          OTP_EXPIRED: 'சரிபார்ப்பு குறியீடு காலாவதியாகிவிட்டது. புதிய குறியீட்டை கோரவும்.',
          OTP_INVALID: 'நீங்கள் உள்ளிட்ட சரிபார்ப்பு குறியீடு தவறானது.',
          MAGIC_LINK_EXPIRED: 'இந்த மேஜிக் இணைப்பு காலாவதியாகிவிட்டது.',
          MAGIC_LINK_INVALID: 'இந்த மேஜிக் இணைப்பு செல்லாதது.',
          MAGIC_LINK_ALREADY_USED: 'இந்த மேஜிக் இணைப்பு ஏற்கனவே பயன்படுத்தப்பட்டுள்ளது.',
          TOKEN_EXPIRED: 'உங்கள் அமர்வு காலாவதியாகிவிட்டது. மீண்டும் உள்நுழைக.',
          SESSION_EXPIRED: 'உங்கள் அமர்வு காலாவதியாகிவிட்டது. மீண்டும் உள்நுழைக.',
          TOKEN_INVALID: 'உங்கள் அமர்வு செல்லாதது. மீண்டும் உள்நுழைக.',
          SESSION_INVALID: 'உங்கள் அமர்வு செல்லாதது. மீண்டும் உள்நுழைக.',
          REFRESH_TOKEN_REUSE: 'உங்கள் அமர்வில் பாதுகாப்பு சிக்கல் கண்டறியப்பட்டது.',
          GOOGLE_AUTH_FAILED: 'Google உள்நுழைவில் பிழை ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.',
          ACCOUNT_LOCKED: 'அதிகமான தோல்வியான முயற்சிகளால் உங்கள் கணக்கு தற்காலிகமாக பூட்டப்பட்டுள்ளது.',
          ACCOUNT_DISABLED: 'உங்கள் கணக்கு முடக்கப்பட்டுள்ளது. ஆதரவை தொடர்பு கொள்ளவும்.',
          TOKEN_GENERATION_FAILED: 'உங்கள் அமர்வை உருவாக்குவதில் சிக்கல் ஏற்பட்டது.',
          DB_WRITE_FAILED: 'தரவுத்தள பிழை ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.',
        },
        te: {
          INVALID_EMAIL_OR_PASSWORD: 'తప్పు ఇమెయిల్ లేదా పాస్‌వర్డ్. దయచేసి మీ సమాచారాన్ని తనిఖీ చేసి మళ్ళీ ప్రయత్నించండి.',
          INVALID_PASSWORD: 'తప్పు ఇమెయిల్ లేదా పాస్‌వర్డ్. దయచేసి మీ సమాచారాన్ని తనిఖీ చేసి మళ్ళీ ప్రయత్నించండి.',
          USER_NOT_FOUND: 'వినియోగదారు కనుగొనబడలేదు',
          EMAIL_ALREADY_EXISTS: 'ఈ ఇమెయిల్ చిరునామాతో ఖాతా ఇప్పటికే ఉంది.',
          EMAIL_NOT_VERIFIED: 'మీ ఇమెయిల్ చిరునామా ఇంకా ధృవీకరించబడలేదు.',
          OTP_EXPIRED: 'ధృవీకరణ కోడ్ గడువు ముగిసింది. కొత్త కోడ్ కోసం అభ్యర్థించండి.',
          OTP_INVALID: 'మీరు నమోదు చేసినధృవీకరణ కోడ్ తప్పు.',
          MAGIC_LINK_EXPIRED: 'ఈ మేజిక్ లింక్ గడువు ముగిసింది.',
          MAGIC_LINK_INVALID: 'ఈ మేజిక్ లింక్ చెల్లదు.',
          MAGIC_LINK_ALREADY_USED: 'ఈ మేజిక్ లింక్ ఇప్పటికే ఉపయోగించబడింది.',
          TOKEN_EXPIRED: 'మీ సెషన్ గడువు ముగిసింది. మళ్ళీ సైన్ ఇన్ చేయండి.',
          SESSION_EXPIRED: 'మీ సెషన్ గడువు ముగిసింది. మళ్ళీ సైన్ ఇన్ చేయండి.',
          TOKEN_INVALID: 'మీ సెషన్ చెల్లదు. మళ్ళీ సైన్ ఇన్ చేయండి.',
          SESSION_INVALID: 'మీ సెషన్ చెల్లదు. మళ్ళీ సైన్ ఇన్ చేయండి.',
          REFRESH_TOKEN_REUSE: 'మీ సెషన్‌లో భద్రతా సమస్య కనుగొనబడింది.',
          GOOGLE_AUTH_FAILED: 'Google సైన్-ఇన్‌లో లోపం సంభవించింది.',
          ACCOUNT_LOCKED: 'చాలా విఫల ప్రయత్నాల కారణంగా మీ ఖాతా తాత్కాలికంగా లాక్ అయింది.',
          ACCOUNT_DISABLED: 'మీ ఖాతా నిలిపివేయబడింది. సహాయం కోసం సంప్రదించండి.',
          TOKEN_GENERATION_FAILED: 'మీ సెషన్ సృష్టించడంలో సమస్య ఏర్పడింది.',
          DB_WRITE_FAILED: 'ఆరోపణ కోడ్ గడువు ముగిసింది. మళ్ళీ ప్రయత్నించండి.',
        },
      },
    }),
  ],
});
