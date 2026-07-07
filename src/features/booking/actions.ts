"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/session";
import { logActivity } from "@/lib/activity-log";
import { generateTimeSlots } from "@/lib/utils";
import { BUSINESS_HOURS } from "@/lib/constants";
import { appointmentSchema, rescheduleSchema } from "@/lib/validations";
import { revalidatePath, revalidateTag } from "next/cache";
import { unstable_cache } from "next/cache";

export async function getAvailableSlots(date: string, staffId: string, durationMinutes: number = 30) {
  const selectedDate = new Date(date);
  selectedDate.setHours(0, 0, 0, 0);
  const nextDay = new Date(selectedDate);
  nextDay.setDate(nextDay.getDate() + 1);

  const existingAppointments = await prisma.appointment.findMany({
    where: {
      staffId,
      date: { gte: selectedDate, lt: nextDay },
      status: { notIn: ["CANCELLED", "NO_SHOW"] },
      deletedAt: null,
    },
    select: { startTime: true, endTime: true },
  });

  const allSlots = generateTimeSlots(
    BUSINESS_HOURS.start,
    BUSINESS_HOURS.end,
    BUSINESS_HOURS.intervalMinutes
  );

  // Map existing appointments to minute intervals
  const existingIntervals = existingAppointments.map((a) => {
    const [startH, startM] = a.startTime.split(":").map(Number);
    const [endH, endM] = a.endTime.split(":").map(Number);
    return {
      start: startH * 60 + startM,
      end: endH * 60 + endM,
    };
  });

  const closingTimeMinutes = BUSINESS_HOURS.end * 60;

  return allSlots.map((slot) => {
    const [slotH, slotM] = slot.split(":").map(Number);
    const slotStart = slotH * 60 + slotM;
    const slotEnd = slotStart + durationMinutes;

    // Check if slot goes past closing time
    if (slotEnd > closingTimeMinutes) {
      return { time: slot, available: false };
    }

    // Check if slot overlaps with any existing appointment
    const hasOverlap = existingIntervals.some(
      (appt) => slotStart < appt.end && slotEnd > appt.start
    );

    return {
      time: slot,
      available: !hasOverlap,
    };
  });
}

export const getAvailableStaff = unstable_cache(
  async () => {
    return prisma.user.findMany({
      where: {
        role: "STAFF",
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        image: true,
      },
      orderBy: { name: "asc" },
    });
  },
  ["available-staff"],
  { revalidate: 60, tags: ["staff"] }
);

export const getActiveServices = unstable_cache(
  async () => {
    return prisma.service.findMany({
      where: {
        isActive: true,
        deletedAt: null,
      },
      orderBy: { name: "asc" },
    });
  },
  ["active-services"],
  { revalidate: 60, tags: ["services"] }
);

export async function createAppointment(formData: FormData) {
  const session = await requireAuth();

  const raw = {
    date: formData.get("date") as string,
    startTime: formData.get("startTime") as string,
    staffId: formData.get("staffId") as string,
    serviceIds: JSON.parse(formData.get("serviceIds") as string) as string[],
    notes: (formData.get("notes") as string) || undefined,
    customerType: (formData.get("customerType") as string) || "BOOKING",
    walkInName: (formData.get("walkInName") as string) || undefined,
    walkInPhone: (formData.get("walkInPhone") as string) || undefined,
  };

  const parsed = appointmentSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Data tidak valid: " + JSON.stringify(parsed.error.format()) };
  }

  const data = parsed.data;

  const selectedDate = new Date(data.date);
  selectedDate.setHours(0, 0, 0, 0);
  const nextDay = new Date(selectedDate);
  nextDay.setDate(nextDay.getDate() + 1);

  const conflicting = await prisma.appointment.findFirst({
    where: {
      staffId: data.staffId,
      date: { gte: selectedDate, lt: nextDay },
      startTime: data.startTime,
      status: { notIn: ["CANCELLED", "NO_SHOW"] },
      deletedAt: null,
    },
  });

  if (conflicting) {
    return { error: "Slot waktu ini sudah dipesan. Silakan pilih waktu lain." };
  }

  const services = await prisma.service.findMany({
    where: { id: { in: data.serviceIds }, deletedAt: null },
  });

  if (services.length !== data.serviceIds.length) {
    return { error: "Beberapa layanan tidak ditemukan" };
  }

  const totalDuration = services.reduce((sum, s) => sum + s.duration, 0);
  const [startH, startM] = data.startTime.split(":").map(Number);
  const endMinutes = startH * 60 + startM + totalDuration;
  const endTime = `${Math.floor(endMinutes / 60)
    .toString()
    .padStart(2, "0")}:${(endMinutes % 60).toString().padStart(2, "0")}`;

  const appointment = await prisma.appointment.create({
    data: {
      date: selectedDate,
      startTime: data.startTime,
      endTime,
      status: "PENDING",
      customerType: data.customerType === "WALK_IN" ? "WALK_IN" : "BOOKING",
      walkInName: data.walkInName,
      walkInPhone: data.walkInPhone,
      notes: data.notes,
      customerId:
        data.customerType === "WALK_IN" ? null : session.user.id,
      staffId: data.staffId,
      appointmentServices: {
        create: services.map((s) => ({
          serviceId: s.id,
          price: s.price,
        })),
      },
    },
  });

  await logActivity({
    action: "CREATE",
    entity: "Appointment",
    entityId: appointment.id,
    description: `Appointment baru dibuat untuk ${data.startTime} pada ${data.date}`,
    userId: session.user.id,
  });

  revalidatePath("/dashboard");
  return { success: true, appointmentId: appointment.id };
}

export async function cancelAppointment(appointmentId: string) {
  const session = await requireAuth();

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
  });

  if (!appointment) {
    return { error: "Appointment tidak ditemukan" };
  }

  if (appointment.status === "CANCELLED") {
    return { error: "Appointment sudah dibatalkan" };
  }

  if (appointment.status === "COMPLETED") {
    return { error: "Appointment yang sudah selesai tidak bisa dibatalkan" };
  }

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: "CANCELLED" },
  });

  await logActivity({
    action: "CANCEL",
    entity: "Appointment",
    entityId: appointmentId,
    description: "Appointment dibatalkan",
    userId: session.user.id,
  });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function rescheduleAppointment(formData: FormData) {
  const session = await requireAuth();

  const raw = {
    appointmentId: formData.get("appointmentId") as string,
    date: formData.get("date") as string,
    startTime: formData.get("startTime") as string,
    staffId: formData.get("staffId") as string,
  };

  const parsed = rescheduleSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Data tidak valid" };
  }

  const data = parsed.data;

  const appointment = await prisma.appointment.findUnique({
    where: { id: data.appointmentId },
    include: { appointmentServices: { include: { service: true } } },
  });

  if (!appointment) {
    return { error: "Appointment tidak ditemukan" };
  }

  if (["CANCELLED", "COMPLETED", "IN_PROGRESS"].includes(appointment.status)) {
    return { error: "Appointment ini tidak bisa di-reschedule" };
  }

  const selectedDate = new Date(data.date);
  selectedDate.setHours(0, 0, 0, 0);
  const nextDay = new Date(selectedDate);
  nextDay.setDate(nextDay.getDate() + 1);

  const conflicting = await prisma.appointment.findFirst({
    where: {
      staffId: data.staffId,
      date: { gte: selectedDate, lt: nextDay },
      startTime: data.startTime,
      status: { notIn: ["CANCELLED", "NO_SHOW"] },
      deletedAt: null,
      id: { not: data.appointmentId },
    },
  });

  if (conflicting) {
    return { error: "Slot waktu ini sudah dipesan" };
  }

  const totalDuration = appointment.appointmentServices.reduce(
    (sum, as_) => sum + as_.service.duration,
    0
  );
  const [startH, startM] = data.startTime.split(":").map(Number);
  const endMinutes = startH * 60 + startM + totalDuration;
  const endTime = `${Math.floor(endMinutes / 60)
    .toString()
    .padStart(2, "0")}:${(endMinutes % 60).toString().padStart(2, "0")}`;

  await prisma.appointment.update({
    where: { id: data.appointmentId },
    data: {
      date: selectedDate,
      startTime: data.startTime,
      endTime,
      staffId: data.staffId,
      status: "PENDING",
    },
  });

  await logActivity({
    action: "RESCHEDULE",
    entity: "Appointment",
    entityId: data.appointmentId,
    description: `Appointment di-reschedule ke ${data.startTime} pada ${data.date}`,
    userId: session.user.id,
  });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function getAppointments(filters?: {
  staffId?: string;
  customerId?: string;
  status?: string;
  date?: string;
}) {
  const where: Record<string, unknown> = { deletedAt: null };

  if (filters?.staffId) where.staffId = filters.staffId;
  if (filters?.customerId) where.customerId = filters.customerId;
  if (filters?.status) where.status = filters.status;
  if (filters?.date) {
    const d = new Date(filters.date);
    d.setHours(0, 0, 0, 0);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    where.date = { gte: d, lt: next };
  }

  return prisma.appointment.findMany({
    where,
    include: {
      staff: { select: { id: true, name: true } },
      customer: { select: { id: true, name: true, email: true } },
      appointmentServices: {
        include: { service: { select: { id: true, name: true, price: true } } },
      },
    },
    orderBy: [{ date: "desc" }, { startTime: "asc" }],
  });
}

export async function updateAppointmentStatus(
  appointmentId: string,
  status: string
) {
  const session = await requireRole(["ADMIN", "STAFF"]);

  const validStatuses = [
    "PENDING",
    "CONFIRMED",
    "IN_PROGRESS",
    "COMPLETED",
    "CANCELLED",
    "NO_SHOW",
  ];
  if (!validStatuses.includes(status)) {
    return { error: "Status tidak valid" };
  }

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: status as "PENDING" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "NO_SHOW" },
  });

  await logActivity({
    action: "UPDATE_STATUS",
    entity: "Appointment",
    entityId: appointmentId,
    description: `Status appointment diubah ke ${status}`,
    userId: session.user.id,
  });

  revalidatePath("/dashboard");
  return { success: true };
}
