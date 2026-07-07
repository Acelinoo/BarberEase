import { z } from "zod/v4";

export const loginSchema = z.object({
  email: z.email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  phone: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const serviceSchema = z.object({
  name: z.string().min(1, "Nama layanan wajib diisi"),
  description: z.string().optional(),
  price: z.number().min(0, "Harga tidak boleh negatif"),
  duration: z.number().min(15, "Durasi minimal 15 menit"),
  isActive: z.boolean(),
});

export type ServiceInput = z.infer<typeof serviceSchema>;

export const appointmentSchema = z.object({
  date: z.string().min(1, "Tanggal wajib dipilih"),
  startTime: z.string().min(1, "Waktu mulai wajib dipilih"),
  staffId: z.string().min(1, "Staff wajib dipilih"),
  serviceIds: z.array(z.string()).min(1, "Minimal pilih 1 layanan"),
  notes: z.string().optional(),
  customerType: z.enum(["WALK_IN", "BOOKING"]),
  walkInName: z.string().optional(),
  walkInPhone: z.string().optional(),
});

export type AppointmentInput = z.infer<typeof appointmentSchema>;

export const rescheduleSchema = z.object({
  appointmentId: z.string().min(1),
  date: z.string().min(1, "Tanggal wajib dipilih"),
  startTime: z.string().min(1, "Waktu mulai wajib dipilih"),
  staffId: z.string().min(1, "Staff wajib dipilih"),
});

export type RescheduleInput = z.infer<typeof rescheduleSchema>;

export const transactionSchema = z.object({
  staffId: z.string().min(1, "Staff wajib dipilih"),
  serviceIds: z.array(z.string()).min(1, "Minimal pilih 1 layanan"),
  paymentMethod: z.enum(["CASH", "BANK_TRANSFER", "E_WALLET"]),
  customerType: z.enum(["WALK_IN", "BOOKING"]),
  walkInName: z.string().optional(),
  walkInPhone: z.string().optional(),
  appointmentId: z.string().optional(),
  notes: z.string().optional(),
});

export type TransactionInput = z.infer<typeof transactionSchema>;
