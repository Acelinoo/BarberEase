import { Suspense } from "react";
import { AdminStats } from "@/features/admin/components/admin-stats";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Kelola barbershop Anda dari sini
        </p>
      </div>
      <Suspense fallback={<StatsLoading />}>
        <AdminStats />
      </Suspense>
    </div>
  );
}

function StatsLoading() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-32 rounded-xl" />
      ))}
    </div>
  );
}
