/**
 * Typed event payloads for domain events.
 * Migrated from packages/shared/src/events/index.ts.
 */

export interface AuthEventPayload {
  userId: string;
  email?: string;
  ip?: string;
  device?: string;
  sessionId?: string;
  provider?: string;
  reason?: string;
  timestamp: string;
}

export interface UserEventPayload {
  userId: string;
  email?: string;
  deletionStatus?: string;
  timestamp: string;
}

export interface ProductEventPayload {
  productId: string;
  variantId?: string;
  quantity?: number;
  orderId?: string;
  timestamp: string;
}

export interface OrderEventPayload {
  orderId: string;
  userId: string;
  status?: string;
  totalAmount?: number;
  timestamp: string;
}

export interface PaymentEventPayload {
  paymentId: string;
  orderId: string;
  userId: string;
  amount: number;
  status: string;
  timestamp: string;
}

export interface CommunicationEventPayload {
  to: string;
  subject?: string;
  template?: string;
  variables?: Record<string, string>;
  timestamp: string;
}
