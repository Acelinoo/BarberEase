import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default async function AdminStaffPage() {
  const staff = await prisma.user.findMany({ where: { role: "STAFF" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manajemen Staff</h1>
        <p className="text-muted-foreground mt-1">Daftar staff (barber)</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {staff.map((s: any) => (
          <Card key={s.id}>
            <CardContent className="p-6 flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback>{s.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-bold">{s.name}</h3>
                <p className="text-sm text-muted-foreground">{s.email}</p>
                <p className="text-xs text-primary mt-1">Komisi: {s.commissionRate}%</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
