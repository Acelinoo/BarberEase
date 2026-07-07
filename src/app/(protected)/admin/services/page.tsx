import { getAdminServices } from "@/features/admin/services/actions";
import { ServicesClient } from "@/features/admin/services/components/services-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manajemen Layanan | BarberEase Admin",
  description: "Kelola daftar layanan barbershop",
};

export default async function AdminServicesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const search = typeof searchParams.search === "string" ? searchParams.search : undefined;
  const status = typeof searchParams.status === "string" ? searchParams.status : undefined;
  const page = typeof searchParams.page === "string" ? Number(searchParams.page) : 1;

  const { data, stats, totalPages } = await getAdminServices({
    search,
    status,
    page,
    limit: 10,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manajemen Layanan</h1>
        <p className="text-muted-foreground mt-1">
          Kelola daftar layanan barbershop, harga, dan durasi.
        </p>
      </div>

      <ServicesClient
        initialServices={data}
        stats={stats}
        totalPages={totalPages}
      />
    </div>
  );
}
