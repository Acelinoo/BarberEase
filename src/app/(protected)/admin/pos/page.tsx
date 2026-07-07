import { getActiveServices, getAvailableStaff } from "@/features/booking/actions";
import { POSForm } from "@/features/pos/components/pos-form";
import { prisma } from "@/lib/prisma";

export default async function POSPage() {
  const [services, staff, todayAppointments] = await Promise.all([
    getActiveServices(),
    getAvailableStaff(),
    prisma.appointment.findMany({
      where: {
        date: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
        status: { in: ["PENDING", "CONFIRMED", "IN_PROGRESS"] },
        deletedAt: null,
      },
      include: {
        customer: { select: { name: true } },
        staff: { select: { name: true } },
        appointmentServices: true,
      },
      orderBy: { startTime: "asc" }
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Point of Sale (POS)</h1>
        <p className="text-muted-foreground mt-1">
          Kasir dan manajemen transaksi
        </p>
      </div>
      <POSForm services={services} staff={staff} appointments={todayAppointments} />
    </div>
  );
}
