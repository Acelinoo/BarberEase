import { Suspense } from "react";
import { format } from "date-fns";
import { getAppointments } from "@/features/booking/actions";
import { getServerSession } from "@/lib/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

export default async function CustomerBookingsPage() {
  const session = await getServerSession();
  if (!session) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Riwayat Booking</h1>
        <p className="text-muted-foreground mt-1">
          Daftar seluruh booking Anda
        </p>
      </div>
      <Suspense fallback={<BookingsLoading />}>
        <BookingsList customerId={session.user.id} />
      </Suspense>
    </div>
  );
}

async function BookingsList({ customerId }: { customerId: string }) {
  const appointments = await getAppointments({ customerId });

  if (appointments.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          Anda belum memiliki booking.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {appointments.map((appointment: any) => {
        const totalAmount = appointment.appointmentServices.reduce(
          (sum: number, s: any) => sum + s.price,
          0
        );

        let statusVariant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info" = "default";
        
        switch (appointment.status) {
          case "PENDING":
            statusVariant = "warning";
            break;
          case "CONFIRMED":
            statusVariant = "info";
            break;
          case "IN_PROGRESS":
            statusVariant = "default";
            break;
          case "COMPLETED":
            statusVariant = "success";
            break;
          case "CANCELLED":
          case "NO_SHOW":
            statusVariant = "destructive";
            break;
        }

        return (
          <Card key={appointment.id} className="flex flex-col">
            <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">
                {format(new Date(appointment.date), "dd MMM yyyy")}
              </CardTitle>
              <Badge variant={statusVariant}>{appointment.status}</Badge>
            </CardHeader>
            <CardContent className="flex-1 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Waktu:</span>
                <span className="font-medium">
                  {appointment.startTime} - {appointment.endTime}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Staff:</span>
                <span className="font-medium">{appointment.staff.name}</span>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground block">Layanan:</span>
                <ul className="text-sm space-y-1 pl-4 list-disc">
                  {appointment.appointmentServices.map((as: any) => (
                    <li key={as.id}>{as.service.name}</li>
                  ))}
                </ul>
              </div>
              <div className="pt-3 border-t mt-auto flex justify-between items-center">
                <span className="text-sm font-medium">Total:</span>
                <span className="font-bold">{formatCurrency(totalAmount)}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function BookingsLoading() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-48 rounded-xl" />
      ))}
    </div>
  );
}
