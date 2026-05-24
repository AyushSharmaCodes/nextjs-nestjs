/**
 * Centralized domain event name registry.
 * All inter-module async communication uses these constants.
 */
export const DomainEvents = {
  AUTH: {
    USER_REGISTERED: 'auth.user.registered',
    USER_LOGGED_IN: 'auth.user.logged_in',
    USER_LOGGED_OUT: 'auth.user.logged_out',
    PASSWORD_CHANGED: 'auth.user.password_changed',
    EMAIL_VERIFIED: 'auth.user.email_verified',
    SESSION_COMPROMISED: 'auth.session.compromised',
  },
  USER: {
    PROFILE_UPDATED: 'user.profile.updated',
    DELETION_SCHEDULED: 'user.account.deletion_scheduled',
    ACCOUNT_DELETED: 'user.account.deleted',
  },
  PRODUCT: {
    CREATED: 'product.created',
    UPDATED: 'product.updated',
    DELETED: 'product.deleted',
    STOCK_RESERVED: 'product.stock.reserved',
    STOCK_RELEASED: 'product.stock.released',
  },
  ORDER: {
    CREATED: 'order.created',
    UPDATED: 'order.updated',
    COMPLETED: 'order.completed',
    CANCELLED: 'order.cancelled',
    RETURN_REQUESTED: 'order.return_requested',
  },
  PAYMENT: {
    INITIATED: 'payment.initiated',
    COMPLETED: 'payment.completed',
    FAILED: 'payment.failed',
    REFUND_PROCESSED: 'payment.refund.processed',
  },
  COMMUNICATION: {
    EMAIL_QUEUED: 'communication.email.queued',
    NOTIFICATION_SENT: 'communication.notification.sent',
  },
  CSC: {
    SYNC_TRIGGERED: 'csc.sync.triggered',
  },
} as const;
