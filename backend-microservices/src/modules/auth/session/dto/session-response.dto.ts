/**
 * @file auth/session/dto/session-response.dto.ts
 *
 * Response DTOs for the session list/confirm/revoke endpoints.
 * Fingerprint is EXCLUDED from all responses (security — it could aid spoofing).
 */

export class DeviceSessionResponseDto {
  readonly id:                 string;
  readonly sessionId:          string;
  readonly ipAddress:          string;
  readonly city:               string | null;
  readonly region:             string | null;
  readonly country:            string;
  readonly deviceType:         string;
  readonly os:                 string;
  readonly osVersion:          string;
  readonly browser:            string;
  readonly browserVersion:     string;
  readonly isTrusted:          boolean;
  readonly riskLevel:          string;
  readonly suspicionReasons:   readonly string[];
  readonly isCurrentlyActive:  boolean;
  readonly createdAt:          string;
}

export class SessionActionResponseDto {
  readonly success:   boolean;
  readonly sessionId: string;
  readonly message:   string;
}
