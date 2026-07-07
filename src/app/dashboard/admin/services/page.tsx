import { getActiveServices } from "@/features/booking/actions";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export default async function AdminServicesPage() {
  const services = await getActiveServices();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manajemen Layanan</h1>
        <p className="text-muted-foreground mt-1">Daftar layanan barbershop</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {services.map((s: any) => (
          <Card key={s.id}>
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-1">{s.name}</h3>
              <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{s.description || "-"}</p>
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium">{s.duration} menit</span>
                <span className="font-bold text-primary">{formatCurrency(s.price)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
