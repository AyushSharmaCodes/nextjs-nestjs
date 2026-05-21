export class UserRegisteredEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly firstName: string,
  ) {}
}

export class UserLoggedInEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly ipAddress?: string,
  ) {}
}

export class SuspiciousLoginEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly ipAddress?: string,
    public readonly reason?: string,
  ) {}
}

export class MfaRequestedEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
  ) {}
}

export class PasswordResetRequestedEvent {
  constructor(
    public readonly email: string,
    public readonly url: string,
  ) {}
}

export class PasswordResetCompletedEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
  ) {}
}

export class MagicLinkRequestedEvent {
  constructor(
    public readonly email: string,
    public readonly url: string,
  ) {}
}

export class OtpRequestedEvent {
  constructor(
    public readonly email: string,
    public readonly otp: string,
  ) {}
}

export class OtpVerifiedEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
  ) {}
}

export class OtpFailedEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
  ) {}
}

export class EmailVerificationRequestedEvent {
  constructor(
    public readonly email: string,
    public readonly otp: string,
  ) {}
}

export class EmailVerifiedEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
  ) {}
}
