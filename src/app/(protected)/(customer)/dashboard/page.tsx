import { Suspense } from "react";
import { Calendar, ClipboardList } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";

export default async function CustomerDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Customer Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Kelola booking Anda
        </p>
      </div>
      <Suspense fallback={<StatsLoading />}>
        <CustomerStats />
      </Suspense>
    </div>
  );
}

async function CustomerStats() {
  const session = await getServerSession();
  if (!session) return null;

  const [upcomingBookings, totalBookings] = await Promise.all([
    prisma.appointment.count({
      where: {
        customerId: session.user.id,
        date: { gte: new Date() },
        deletedAt: null,
        status: { in: ["PENDING", "CONFIRMED"] },
      },
    }),
    prisma.appointment.count({
      where: {
        customerId: session.user.id,
        deletedAt: null,
      },
    }),
  ]);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Upcoming Bookings
          </CardTitle>
          <div className="rounded-lg p-2 bg-blue-500/10">
            <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{upcomingBookings}</div>
          <p className="text-xs text-muted-foreground mt-1">Jadwal mendatang</p>
        </CardContent>
      </Card>
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Bookings
          </CardTitle>
          <div className="rounded-lg p-2 bg-violet-500/10">
            <ClipboardList className="h-4 w-4 text-violet-600 dark:text-violet-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalBookings}</div>
          <p className="text-xs text-muted-foreground mt-1">Total booking Anda</p>
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
