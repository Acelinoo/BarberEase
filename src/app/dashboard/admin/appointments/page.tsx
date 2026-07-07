import { getAppointments } from "@/features/booking/actions";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AdminAppointmentsPage() {
  const appointments = await getAppointments();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Semua Booking</h1>
        <p className="text-muted-foreground mt-1">Daftar appointment dari seluruh customer</p>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground uppercase">
                <tr>
                  <th className="px-6 py-3 font-medium">Waktu</th>
                  <th className="px-6 py-3 font-medium">Customer</th>
                  <th className="px-6 py-3 font-medium">Staff</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y border-b">
                {appointments.map((a: any) => (
                  <tr key={a.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium">{format(new Date(a.date), "dd MMM yyyy")}</div>
                      <div className="text-muted-foreground">{a.startTime} - {a.endTime}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{a.customer?.name || a.walkInName || "Walk-In"}</div>
                      <div className="text-muted-foreground">{a.customer?.email || a.walkInPhone}</div>
                    </td>
                    <td className="px-6 py-4">{a.staff.name}</td>
                    <td className="px-6 py-4">
                      <Badge variant="outline">{a.status}</Badge>
                    </td>
                  </tr>
                ))}
                {appointments.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">Tidak ada appointment</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
