"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Plus, Minus, Search, ShoppingCart, User, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { transactionSchema, type TransactionInput } from "@/lib/validations";
import { createTransaction } from "@/features/pos/actions";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";

type Service = { id: string; name: string; price: number };
type Staff = { id: string; name: string };

type AppointmentItem = {
  id: string;
  startTime: string;
  staffId: string;
  walkInName: string | null;
  customer: { name: string } | null;
  staff: { name: string } | null;
  appointmentServices: { serviceId: string }[];
};

export function POSForm({ services, staff, appointments }: { services: Service[]; staff: Staff[]; appointments: AppointmentItem[] }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<Service[]>([]);
  const [checkoutMode, setCheckoutMode] = useState<"WALK_IN" | "BOOKING">("WALK_IN");
  
  const form = useForm<TransactionInput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      staffId: "",
      serviceIds: [],
      paymentMethod: "CASH",
      customerType: "WALK_IN",
      walkInName: "",
      walkInPhone: "",
      appointmentId: "",
      notes: "",
    },
  });

  const selectedAppointmentId = useWatch({ control: form.control, name: "appointmentId" });
  const selectedStaffId = useWatch({ control: form.control, name: "staffId" });
  const selectedPaymentMethod = useWatch({ control: form.control, name: "paymentMethod" });
  const filteredServices = services.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalAmount = cart.reduce((sum, item) => sum + item.price, 0);

  const toggleService = (service: Service) => {
    let newCart = [...cart];
    const existsIndex = newCart.findIndex(i => i.id === service.id);
    if (existsIndex >= 0) {
      newCart.splice(existsIndex, 1);
    } else {
      newCart.push(service);
    }
    setCart(newCart);
    form.setValue("serviceIds", newCart.map(s => s.id), { shouldValidate: true });
  };

  const handleAppointmentSelect = (appId: string) => {
    form.setValue("appointmentId", appId);
    const app = appointments.find(a => a.id === appId);
    if (app) {
      form.setValue("staffId", app.staffId);
      // Auto fill cart based on appointment services
      const appServices = app.appointmentServices.map((as_: { serviceId: string }) => services.find(s => s.id === as_.serviceId)).filter(Boolean) as Service[];
      setCart(appServices);
      form.setValue("serviceIds", appServices.map(s => s.id), { shouldValidate: true });
    }
  };

  async function onSubmit(data: TransactionInput) {
    if (cart.length === 0) {
      toast.error("Keranjang kosong!");
      return;
    }
    
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("staffId", data.staffId);
      formData.append("serviceIds", JSON.stringify(cart.map(c => c.id)));
      formData.append("paymentMethod", data.paymentMethod);
      formData.append("customerType", checkoutMode);
      if (data.walkInName && checkoutMode === "WALK_IN") formData.append("walkInName", data.walkInName);
      if (data.walkInPhone && checkoutMode === "WALK_IN") formData.append("walkInPhone", data.walkInPhone);
      if (data.appointmentId && checkoutMode === "BOOKING") formData.append("appointmentId", data.appointmentId);
      if (data.notes) formData.append("notes", data.notes);

      const result = await createTransaction(formData);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Transaksi berhasil! Receipt dibuat.");
      // Reset form
      setCart([]);
      form.reset();
      router.refresh();
    } catch {
      toast.error("Terjadi kesalahan saat transaksi");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Left: Services & Selection */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex gap-4">
          <Button 
            variant={checkoutMode === "WALK_IN" ? "default" : "outline"}
            onClick={() => { setCheckoutMode("WALK_IN"); form.setValue("customerType", "WALK_IN"); }}
            className="flex-1"
          >
            Walk-in Customer
          </Button>
          <Button 
            variant={checkoutMode === "BOOKING" ? "default" : "outline"}
            onClick={() => { setCheckoutMode("BOOKING"); form.setValue("customerType", "BOOKING"); }}
            className="flex-1"
          >
            Booking Checkout
          </Button>
        </div>

        {checkoutMode === "BOOKING" && (
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-lg">Pilih Booking</CardTitle>
            </CardHeader>
            <CardContent>
              <Select onValueChange={handleAppointmentSelect} value={selectedAppointmentId} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Appointment (Hari ini)" />
                </SelectTrigger>
                <SelectContent>
                  {appointments.length === 0 && <SelectItem value="none" disabled>Tidak ada booking hari ini</SelectItem>}
                  {appointments.map((app) => (
                    <SelectItem key={app.id} value={app.id}>
                      {app.startTime} - {app.customer?.name || app.walkInName} (Staff: {app.staff?.name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}

        <Card className="flex-1 border-border/50 flex flex-col min-h-[500px]">
          <CardHeader className="py-4 border-b">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Daftar Layanan</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari layanan..."
                  className="pl-9 h-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 relative">
            <ScrollArea className="h-[400px] p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {filteredServices.map(service => {
                  const isSelected = cart.some(item => item.id === service.id);
                  return (
                    <div 
                      key={service.id}
                      onClick={() => toggleService(service)}
                      className={`relative overflow-hidden rounded-xl border p-4 cursor-pointer transition-all hover:border-primary/50 ${
                        isSelected ? 'border-primary bg-primary/5 shadow-sm' : 'bg-card'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
                      )}
                      <h4 className="font-medium text-sm line-clamp-1">{service.name}</h4>
                      <p className="text-primary font-bold mt-2">{formatCurrency(service.price)}</p>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Right: Cart & Checkout */}
      <div className="lg:col-span-1">
        <form onSubmit={form.handleSubmit(onSubmit)} className="sticky top-6">
          <Card className="shadow-lg border-primary/20">
            <CardHeader className="bg-primary/5 border-b pb-4">
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Detail Transaksi
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[250px]">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6 text-center">
                    <Receipt className="h-10 w-10 mb-2 opacity-20" />
                    <p className="text-sm">Pilih layanan untuk memulai transaksi</p>
                  </div>
                ) : (
                  <div className="p-4 space-y-3">
                    {cart.map((item, index) => (
                      <div key={`${item.id}-${index}`} className="flex justify-between items-center text-sm group">
                        <span className="font-medium">{item.name}</span>
                        <div className="flex items-center gap-3">
                          <span>{formatCurrency(item.price)}</span>
                          <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-destructive opacity-0 group-hover:opacity-100" onClick={() => toggleService(item)}>
                            <Minus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
              
              <div className="p-4 border-t space-y-4 bg-muted/30">
                <div className="flex justify-between items-center font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(totalAmount)}</span>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Staff / Barber</Label>
                    <Select onValueChange={(val) => form.setValue("staffId", val)} value={selectedStaffId} disabled={isLoading}>
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Pilih Staff" />
                      </SelectTrigger>
                      <SelectContent>
                        {staff.map((s) => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.staffId && <p className="text-xs text-destructive">{form.formState.errors.staffId.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Metode Pembayaran</Label>
                    <Select onValueChange={(val: "CASH" | "BANK_TRANSFER" | "E_WALLET") => form.setValue("paymentMethod", val)} value={selectedPaymentMethod} disabled={isLoading}>
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Metode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CASH">Tunai (Cash)</SelectItem>
                        <SelectItem value="BANK_TRANSFER">Transfer Bank</SelectItem>
                        <SelectItem value="E_WALLET">E-Wallet (QRIS)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {checkoutMode === "WALK_IN" && (
                    <div className="space-y-2 pt-2 border-t">
                      <Label className="text-xs text-muted-foreground">Info Pelanggan (Opsional)</Label>
                      <Input placeholder="Nama Pelanggan" className="h-8 text-sm" {...form.register("walkInName")} disabled={isLoading} />
                      <Input placeholder="No. HP" className="h-8 text-sm" {...form.register("walkInPhone")} disabled={isLoading} />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-4 bg-muted/50 border-t">
              <Button type="submit" className="w-full font-bold" size="lg" disabled={isLoading || cart.length === 0 || !selectedStaffId}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Bayar Sekarang
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  );
}
