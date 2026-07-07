import { BookingForm } from "@/features/booking/components/booking-form";
import { getActiveServices, getAvailableStaff } from "@/features/booking/actions";

export default async function CustomerBookPage() {
  const [services, staff] = await Promise.all([
    getActiveServices(),
    getAvailableStaff(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Booking Layanan</h1>
        <p className="text-muted-foreground mt-1">
          Pilih layanan, staff, dan waktu yang sesuai untuk Anda.
        </p>
      </div>
      <BookingForm services={services} staff={staff} />
    </div>
  );
}
