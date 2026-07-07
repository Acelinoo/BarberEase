import { Suspense } from "react";
import { Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";

export default async function StaffDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Staff Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Kelola jadwal dan transaksi Anda
        </p>
      </div>
      <Suspense fallback={<StatsLoading />}>
        <StaffStats />
      </Suspense>
    </div>
  );
}

async function StaffStats() {
  const session = await getServerSession();
  if (!session) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [todayAppointments, completedToday] = await Promise.all([
    prisma.appointment.count({
      where: {
        staffId: session.user.id,
        date: { gte: today, lt: tomorrow },
        deletedAt: null,
        status: { notIn: ["CANCELLED"] },
      },
    }),
    prisma.transaction.count({
      where: {
        staffId: session.user.id,
        createdAt: { gte: today, lt: tomorrow },
        status: "COMPLETED",
        deletedAt: null,
      },
    }),
  ]);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Jadwal Hari Ini
          </CardTitle>
          <div className="rounded-lg p-2 bg-blue-500/10">
            <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{todayAppointments}</div>
          <p className="text-xs text-muted-foreground mt-1">Appointment aktif</p>
        </CardContent>
      </Card>
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Transaksi Selesai
          </CardTitle>
          <div className="rounded-lg p-2 bg-emerald-500/10">
            <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completedToday}</div>
          <p className="text-xs text-muted-foreground mt-1">Hari ini</p>
        </CardContent>
      </Card>
    </div>
  );
}

function StatsLoading() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {Array.from({ length: 2 }).map((_, i) => (
        <Skeleton key={i} className="h-32 rounded-xl" />
      ))}
    </div>
  );
}
