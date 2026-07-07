"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { serviceSchema, type ServiceInput } from "@/lib/validations";
import { createService, updateService } from "@/features/admin/services/actions";

interface ServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service?: any;
}

export function ServiceDialog({ open, onOpenChange, service }: ServiceDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!service;

  const form = useForm<ServiceInput>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      duration: 30,
      isActive: true,
    },
  });

  useEffect(() => {
    if (service) {
      form.reset({
        name: service.name,
        description: service.description || "",
        price: service.price,
        duration: service.duration,
        isActive: service.isActive,
      });
    } else {
      form.reset({
        name: "",
        description: "",
        price: 0,
        duration: 30,
        isActive: true,
      });
    }
  }, [service, form, open]);

  async function onSubmit(data: ServiceInput) {
    setIsLoading(true);
    try {
      const result = isEditing
        ? await updateService(service.id, data)
        : await createService(data);

      if (result.success) {
        toast.success(`Layanan berhasil ${isEditing ? "diperbarui" : "dibuat"}`);
        onOpenChange(false);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error(`Terjadi kesalahan saat ${isEditing ? "memperbarui" : "membuat"} layanan`);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Layanan" : "Tambah Layanan"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Layanan</Label>
            <Input
              id="name"
              placeholder="Potong Rambut Basic"
              {...form.register("name")}
              disabled={isLoading}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi (Opsional)</Label>
            <Textarea
              id="description"
              placeholder="Deskripsi singkat tentang layanan..."
              {...form.register("description")}
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Harga (Rp)</Label>
              <Input
                id="price"
                type="number"
                min={0}
                {...form.register("price", { valueAsNumber: true })}
                disabled={isLoading}
              />
              {form.formState.errors.price && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.price.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Durasi (Menit)</Label>
              <Input
                id="duration"
                type="number"
                min={15}
                step={15}
                {...form.register("duration", { valueAsNumber: true })}
                disabled={isLoading}
              />
              {form.formState.errors.duration && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.duration.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="isActive"
              checked={form.watch("isActive")}
              onCheckedChange={(checked) => form.setValue("isActive", checked === true)}
              disabled={isLoading}
            />
            <Label htmlFor="isActive" className="cursor-pointer">
              Layanan Aktif
            </Label>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Simpan Perubahan" : "Simpan Layanan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
