// src/shared/events/app.events.ts
// Central registry of ALL event names used across the application.
// Import this enum in any module that emits or listens to events.

export enum AppEvent {
  // ── Orders ──────────────────────────────────────────────
  ORDER_CREATED      = "order.created",
  ORDER_UPDATED      = "order.updated",
  ORDER_CANCELLED    = "order.cancelled",

  // ── Payments ────────────────────────────────────────────
  PAYMENT_COMPLETED  = "payment.completed",
  PAYMENT_FAILED     = "payment.failed",

  // ── AI / NIM ────────────────────────────────────────────
  AI_COMPLETION_REQUESTED = "ai.completion.requested",
  AI_COMPLETION_DONE      = "ai.completion.done",
  AI_COMPLETION_ERROR     = "ai.completion.error",

  // ── Users ────────────────────────────────────────────────
  // Aligned with the existing AUTH_EVENTS.USER_REGISTERED in the app
  USER_REGISTERED    = "auth.user.registered",
}
