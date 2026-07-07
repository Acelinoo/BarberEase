"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { toast } from "sonner";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { appointmentSchema, type AppointmentInput } from "@/lib/validations";
import { createAppointment, getAvailableSlots } from "@/features/booking/actions";
import { Checkbox } from "@/components/ui/checkbox";

type Service = { id: string; name: string; price: number; duration: number };
type Staff = { id: string; name: string };

export function BookingForm({
  services,
  staff,
}: {
  services: Service[];
  staff: Staff[];
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [slots, setSlots] = useState<{ time: string; available: boolean }[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  
  const form = useForm<AppointmentInput>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      date: format(new Date(), "yyyy-MM-dd"),
      startTime: "",
      staffId: "",
      serviceIds: [],
      notes: "",
      customerType: "BOOKING",
    },
  });

  const selectedDate = useWatch({ control: form.control, name: "date" });
  const selectedStaffId = useWatch({ control: form.control, name: "staffId" });
  const selectedServiceIds = useWatch({ control: form.control, name: "serviceIds" });
  const selectedStartTime = useWatch({ control: form.control, name: "startTime" });

  async function fetchSlots(date: string, staffId: string) {
    if (!date || !staffId) return;
    setIsLoadingSlots(true);
    try {
      const data = await getAvailableSlots(date, staffId);
      setSlots(data);
    } catch (error) {
      toast.error("Gagal memuat slot waktu");
    } finally {
      setIsLoadingSlots(false);
    }
  }

  // Handle staff or date change
  const handleStaffChange = (val: string) => {
    form.setValue("staffId", val);
    form.setValue("startTime", "");
    fetchSlots(selectedDate, val);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    form.setValue("date", val);
    form.setValue("startTime", "");
    fetchSlots(val, selectedStaffId);
  };

  const toggleService = (id: string) => {
    const current = new Set(selectedServiceIds);
    if (current.has(id)) {
      current.delete(id);
    } else {
      current.add(id);
    }
    form.setValue("serviceIds", Array.from(current), { shouldValidate: true });
  };

  async function onSubmit(data: AppointmentInput) {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("date", data.date);
      formData.append("startTime", data.startTime);
      formData.append("staffId", data.staffId);
      formData.append("serviceIds", JSON.stringify(data.serviceIds));
      if (data.notes) formData.append("notes", data.notes);
      formData.append("customerType", data.customerType);

      const result = await createAppointment(formData);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Booking berhasil dibuat!");
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Terjadi kesalahan saat booking");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="max-w-2xl mx-auto border-border/50 shadow-xl backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Buat Booking Baru</CardTitle>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Layanan</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((service) => (
                <div key={service.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-accent cursor-pointer" onClick={() => toggleService(service.id)}>
                  <Checkbox 
                    id={`service-${service.id}`}
                    checked={selectedServiceIds.includes(service.id)}
                    onCheckedChange={() => toggleService(service.id)}
                  />
                  <div className="space-y-1 leading-none flex-1">
                    <Label htmlFor={`service-${service.id}`} className="font-medium cursor-pointer">
                      {service.name}
                    </Label>
                    <p className="text-sm text-muted-foreground">{service.duration} menit - Rp {service.price.toLocaleString("id-ID")}</p>
                  </div>
                </div>
              ))}
            </div>
            {form.formState.errors.serviceIds && (
              <p className="text-sm text-destructive">
                {form.formState.errors.serviceIds.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="date">Tanggal</Label>
              <div className="relative">
                <Input
                  id="date"
                  type="date"
                  min={format(new Date(), "yyyy-MM-dd")}
                  {...form.register("date")}
                  onChange={handleDateChange}
                  disabled={isLoading}
                />
              </div>
              {form.formState.errors.date && (
                <p className="text-sm text-destructive">{form.formState.errors.date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="staffId">Staff (Barber)</Label>
              <Select onValueChange={handleStaffChange} value={selectedStaffId} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Staff" />
                </SelectTrigger>
                <SelectContent>
                  {staff.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.staffId && (
                <p className="text-sm text-destructive">{form.formState.errors.staffId.message}</p>
              )}
            </div>
          </div>

          {selectedStaffId && selectedDate && (
            <div className="space-y-2">
              <Label>Waktu</Label>
              {isLoadingSlots ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Memuat slot...
                </div>
              ) : slots.length > 0 ? (
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                  {slots.map((slot) => {
                    const isSelected = selectedStartTime === slot.time;
                    return (
                      <Button
                        key={slot.time}
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        disabled={!slot.available || isLoading}
                        onClick={() => form.setValue("startTime", slot.time)}
                        className="w-full px-0"
                      >
                        {slot.time}
                      </Button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Tidak ada slot tersedia</p>
              )}
              {form.formState.errors.startTime && (
                <p className="text-sm text-destructive">{form.formState.errors.startTime.message}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Catatan Tambahan (Opsional)</Label>
            <Textarea
              id="notes"
              placeholder="Beritahu kami jika ada permintaan khusus"
              {...form.register("notes")}
              disabled={isLoading}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading || !selectedStaffId || !selectedStartTime || selectedServiceIds.length === 0}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Konfirmasi Booking
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
