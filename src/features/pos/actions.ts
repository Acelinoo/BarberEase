"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/session";
import { logActivity } from "@/lib/activity-log";
import { generateReceiptNumber } from "@/lib/utils";
import { transactionSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { triggerPayrollCalculation } from "@/features/payroll/actions";

export async function createTransaction(formData: FormData) {
  const session = await requireRole(["ADMIN", "STAFF"]);

  const raw = {
    staffId: formData.get("staffId") as string,
    serviceIds: JSON.parse(formData.get("serviceIds") as string) as string[],
    paymentMethod: formData.get("paymentMethod") as "CASH" | "BANK_TRANSFER" | "E_WALLET",
    customerType: formData.get("customerType") as "WALK_IN" | "BOOKING",
    walkInName: formData.get("walkInName") as string | undefined,
    walkInPhone: formData.get("walkInPhone") as string | undefined,
    appointmentId: formData.get("appointmentId") as string | undefined,
    notes: formData.get("notes") as string | undefined,
  };

  const parsed = transactionSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Data transaksi tidak valid" };
  }
  const data = parsed.data;

  // Validate appointment if booking checkout
  let appointment = null;
  if (data.customerType === "BOOKING" && data.appointmentId) {
    appointment = await prisma.appointment.findUnique({
      where: { id: data.appointmentId },
      include: { customer: true },
    });
    if (!appointment) return { error: "Appointment tidak ditemukan" };
    if (appointment.status === "COMPLETED") return { error: "Appointment sudah selesai" };
  }

  // Get services
  const services = await prisma.service.findMany({
    where: { id: { in: data.serviceIds } },
  });

  if (services.length !== data.serviceIds.length) {
    return { error: "Beberapa layanan tidak ditemukan" };
  }

  const totalAmount = services.reduce((sum, s) => sum + s.price, 0);

  // Get staff commission rate
  const staff = await prisma.user.findUnique({ where: { id: data.staffId } });
  if (!staff) return { error: "Staff tidak ditemukan" };
  
  const commissionRate = staff.commissionRate || 0;
  const commissionAmount = (totalAmount * commissionRate) / 100;

  // Determine Customer ID
  let customerId = undefined;
  if (data.customerType === "BOOKING" && appointment?.customerId) {
    customerId = appointment.customerId;
  }

  // Use transaction to ensure consistency
  const transactionResult = await prisma.$transaction(async (tx) => {
    // Create transaction
    const transaction = await tx.transaction.create({
      data: {
        receiptNumber: generateReceiptNumber(),
        totalAmount,
        paymentMethod: data.paymentMethod,
        status: "COMPLETED", // Auto complete
        customerType: data.customerType,
        walkInName: data.walkInName,
        walkInPhone: data.walkInPhone,
        notes: data.notes,
        paidAt: new Date(),
        commissionRate,
        commissionAmount,
        staffId: data.staffId,
        customerId: customerId,
        appointmentId: data.appointmentId,
        transactionItems: {
          create: services.map((s) => ({
            serviceId: s.id,
            serviceName: s.name,
            price: s.price,
            quantity: 1,
          })),
        },
      },
    });

    // Update appointment status if booking
    if (data.appointmentId) {
      await tx.appointment.update({
        where: { id: data.appointmentId },
        data: { status: "COMPLETED" },
      });
    }

    // Trigger payroll (or prepare data for it)
    await triggerPayrollCalculation(data.staffId, tx);

    return transaction;
  });

  await logActivity({
    action: "CREATE_TRANSACTION",
    entity: "Transaction",
    entityId: transactionResult.id,
    description: `Transaksi ${transactionResult.receiptNumber} selesai`,
    userId: session.user.id,
  });

  revalidatePath("/dashboard");
  return { success: true, transactionId: transactionResult.id };
}

export async function getTransactions(filters?: {
  staffId?: string;
  status?: string;
  date?: string;
}) {
  const where: Record<string, unknown> = { deletedAt: null };

  if (filters?.staffId) where.staffId = filters.staffId;
  if (filters?.status) where.status = filters.status;
  if (filters?.date) {
    const d = new Date(filters.date);
    d.setHours(0, 0, 0, 0);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    where.createdAt = { gte: d, lt: next };
  }

  return prisma.transaction.findMany({
    where,
    include: {
      staff: { select: { id: true, name: true } },
      customer: { select: { id: true, name: true } },
      transactionItems: true,
      appointment: { select: { date: true, startTime: true } }
    },
    orderBy: { createdAt: "desc" },
  });
}
