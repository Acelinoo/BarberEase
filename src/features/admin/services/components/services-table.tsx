"use client";

import { useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { MoreHorizontal, Edit, Trash, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { toggleServiceStatus } from "@/features/admin/services/actions";

interface ServicesTableProps {
  services: any[];
  onEdit: (service: any) => void;
  onDelete: (service: any) => void;
}

export function ServicesTable({ services, onEdit, onDelete }: ServicesTableProps) {
  const [togglingId, setTogglingId] = useState<string | null>(null);

  async function handleToggleStatus(serviceId: string, currentStatus: boolean) {
    setTogglingId(serviceId);
    try {
      const result = await toggleServiceStatus(serviceId, !currentStatus);
      if (result.success) {
        toast.success(
          `Layanan berhasil di${!currentStatus ? "aktifkan" : "nonaktifkan"}`
        );
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Terjadi kesalahan saat mengubah status layanan");
    } finally {
      setTogglingId(null);
    }
  }

  if (services.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 border rounded-lg bg-card text-card-foreground">
        <div className="text-muted-foreground mb-4">Belum ada layanan yang ditambahkan</div>
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama Layanan</TableHead>
            <TableHead>Harga</TableHead>
            <TableHead>Durasi</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden md:table-cell">Dibuat Pada</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.map((service) => (
            <TableRow key={service.id}>
              <TableCell className="font-medium">
                {service.name}
                {service.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1 max-w-[200px]">
                    {service.description}
                  </p>
                )}
              </TableCell>
              <TableCell>{formatCurrency(service.price)}</TableCell>
              <TableCell>{service.duration} menit</TableCell>
              <TableCell>
                <Badge
                  variant={service.isActive ? "default" : "secondary"}
                  className={
                    service.isActive
                      ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                      : "bg-rose-500/10 text-rose-500 hover:bg-rose-500/20"
                  }
                >
                  {service.isActive ? "Aktif" : "Tidak Aktif"}
                </Badge>
              </TableCell>
              <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                {format(new Date(service.createdAt), "dd MMM yyyy", { locale: id })}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Buka menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => onEdit(service)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleToggleStatus(service.id, service.isActive)}
                      disabled={togglingId === service.id}
                    >
                      {service.isActive ? (
                        <>
                          <ToggleLeft className="mr-2 h-4 w-4" />
                          Nonaktifkan
                        </>
                      ) : (
                        <>
                          <ToggleRight className="mr-2 h-4 w-4" />
                          Aktifkan
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(service)}
                      className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Hapus
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
