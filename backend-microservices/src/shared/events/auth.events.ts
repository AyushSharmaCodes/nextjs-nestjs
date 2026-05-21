export const AuthEvents = {
  USER_REGISTERED: 'auth.user.registered',
  USER_LOGGED_IN: 'auth.user.logged_in',
  SUSPICIOUS_LOGIN: 'auth.suspicious_login',
  MFA_REQUESTED: 'auth.mfa.requested',
  PASSWORD_RESET_REQUESTED: 'auth.password_reset.requested',
  PASSWORD_RESET_COMPLETED: 'auth.password_reset.completed',
  MAGIC_LINK_REQUESTED: 'auth.magic_link.requested',
  OTP_REQUESTED: 'auth.otp.requested',
  OTP_VERIFIED: 'auth.otp.verified',
  OTP_FAILED: 'auth.otp.failed',
  EMAIL_VERIFICATION_REQUESTED: 'auth.email_verification.requested',
  EMAIL_VERIFIED: 'auth.email.verified',
} as const;
