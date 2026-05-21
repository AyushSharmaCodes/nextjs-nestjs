/**
 * @file communication/types/email.types.ts
 *
 * Locally-owned types for the Communication module.
 * These are NOT shared with Auth module — they are internal to Communication.
 */

/**
 * All template names the TemplateService knows about.
 * Adding a new template = add here + create the .hbs files.
 */
export type EmailTemplateName =
  | 'welcome'
  | 'email-verification'
  | 'password-reset'
  | 'otp'
  | 'magic-link'
  | '2fa-code'
  | '2fa-enabled'
  | 'google-linked'
  | 'account-locked'
  | 'account-unlocked'
  | 'suspicious-login'
  | 'suspicious-login-high-risk'
  | 'email-change';

/**
 * Strictly typed template context — all variables that any template may use.
 * Fields are optional because each template uses a subset.
 * However, callers should provide ONLY what the template actually needs.
 *
 * Trade-off: a single union context vs per-template context objects.
 * Single union is simpler to pass through TemplateService.render() but means
 * some fields may be present without being consumed. Acceptable here since
 * TemplateService validates required fields at render time via Handlebars.
 */
export interface TemplateContext {
  readonly displayName?:        string;
  readonly otpCode?:            string;
  readonly totpCode?:           string;
  readonly expiresAt?:          string;
  readonly purpose?:            string;
  readonly magicLinkUrl?:       string;
  readonly resetUrl?:           string;
  readonly resetToken?:         string;
  readonly verifyUrl?:          string;
  readonly verifyToken?:        string;
  readonly deviceHint?:         string;
  readonly lockedUntil?:        string;
  readonly failedAttempts?:     number;
  readonly lockReason?:         string;
  readonly newEmail?:           string;
  readonly googleEmail?:        string;
  readonly enabledAt?:          string;
  readonly linkedAt?:           string;
  readonly unlockedBy?:         string;
  readonly authMethod?:         string;
  readonly attemptCount?:       number;
  // Suspicious session fields
  readonly ipAddress?:          string;
  readonly city?:               string;
  readonly region?:             string;
  readonly country?:            string;
  readonly os?:                 string;
  readonly osVersion?:          string;
  readonly browser?:            string;
  readonly browserVersion?:     string;
  readonly deviceType?:         string;
  readonly signedInAt?:         string;
  readonly riskLevel?:          string;
  readonly suspicionReasons?:   readonly string[];  // human-readable labels
  readonly confirmUrl?:         string;
  readonly revokeUrl?:          string;
  readonly secureUrl?:          string;
}

/** Result of TemplateService.render() — fully resolved email content. */
export interface TemplateRenderResult {
  readonly subject: string;
  readonly html:    string;
  readonly text:    string;
}

/** Email status enum — mirrors Prisma EmailStatus. */
export type EmailStatus = 'PENDING' | 'SENT' | 'FAILED' | 'SKIPPED';
