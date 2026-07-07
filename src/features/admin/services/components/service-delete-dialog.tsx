"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteService } from "@/features/admin/services/actions";

interface ServiceDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: { id: string; name: string } | null;
}

export function ServiceDeleteDialog({
  open,
  onOpenChange,
  service,
}: ServiceDeleteDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleDelete() {
    if (!service) return;
    
    setIsLoading(true);
    try {
      const result = await deleteService(service.id);
      
      if (result.success) {
        toast.success("Layanan berhasil dihapus");
        onOpenChange(false);
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Terjadi kesalahan saat menghapus layanan");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Layanan</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus layanan{" "}
            <span className="font-semibold text-foreground">
              {service?.name}
            </span>
            ? Layanan ini akan dihapus dari daftar dan tidak dapat dipilih lagi
            oleh pelanggan, namun riwayat transaksi lama akan tetap dipertahankan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
