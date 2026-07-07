import {
  Calendar,
  DollarSign,
  Users,
  Scissors,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

export async function AdminStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [
    todayAppointments,
    totalStaff,
    totalServices,
    todayRevenue,
  ] = await Promise.all([
    prisma.appointment.count({
      where: {
        date: { gte: today, lt: tomorrow },
        deletedAt: null,
        status: { notIn: ["CANCELLED"] },
      },
    }),
    prisma.user.count({
      where: { role: "STAFF", deletedAt: null },
    }),
    prisma.service.count({
      where: { isActive: true, deletedAt: null },
    }),
    prisma.transaction.aggregate({
      where: {
        createdAt: { gte: today, lt: tomorrow },
        status: "COMPLETED",
        deletedAt: null,
      },
      _sum: { totalAmount: true },
    }),
  ]);

  const stats = [
    {
      title: "Appointment Hari Ini",
      value: todayAppointments.toString(),
      icon: Calendar,
      description: "Jadwal hari ini",
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      title: "Total Staff",
      value: totalStaff.toString(),
      icon: Users,
      description: "Staff aktif",
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Layanan Aktif",
      value: totalServices.toString(),
      icon: Scissors,
      description: "Layanan tersedia",
      color: "text-violet-600 dark:text-violet-400",
      bg: "bg-violet-500/10",
    },
    {
      title: "Revenue Hari Ini",
      value: formatCurrency(todayRevenue._sum.totalAmount ?? 0),
      icon: DollarSign,
      description: "Pendapatan hari ini",
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card
          key={stat.title}
          className="overflow-hidden transition-all duration-200 hover:shadow-md"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`rounded-lg p-2 ${stat.bg}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
