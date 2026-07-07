export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "BarberEase";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const BUSINESS_HOURS = {
  start: 9,
  end: 21,
  intervalMinutes: 30,
} as const;

export const ROLES = {
  ADMIN: "ADMIN",
  STAFF: "STAFF",
  CUSTOMER: "CUSTOMER",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const APPOINTMENT_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  NO_SHOW: "NO_SHOW",
} as const;

export type AppointmentStatus =
  (typeof APPOINTMENT_STATUS)[keyof typeof APPOINTMENT_STATUS];

export const PAYMENT_METHOD = {
  CASH: "CASH",
  BANK_TRANSFER: "BANK_TRANSFER",
  E_WALLET: "E_WALLET",
} as const;

export type PaymentMethod =
  (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD];

export const TRANSACTION_STATUS = {
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
  REFUNDED: "REFUNDED",
  CANCELLED: "CANCELLED",
} as const;

export type TransactionStatus =
  (typeof TRANSACTION_STATUS)[keyof typeof TRANSACTION_STATUS];

export const CUSTOMER_TYPE = {
  WALK_IN: "WALK_IN",
  BOOKING: "BOOKING",
} as const;

export type CustomerType =
  (typeof CUSTOMER_TYPE)[keyof typeof CUSTOMER_TYPE];
