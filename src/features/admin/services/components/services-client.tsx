"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ServicesStats } from "./services-stats";
import { ServicesTable } from "./services-table";
import { ServiceDialog } from "./service-dialog";
import { ServiceDeleteDialog } from "./service-delete-dialog";
import { useDebounce } from "use-debounce";
import { useEffect } from "react";

interface ServicesClientProps {
  initialServices: any[];
  stats: {
    total: number;
    active: number;
    inactive: number;
    averagePrice: number;
  };
  totalPages: number;
}

export function ServicesClient({
  initialServices,
  stats,
  totalPages,
}: ServicesClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [deletingService, setDeletingService] = useState<any>(null);

  // Search & Filter State
  const initialSearch = searchParams.get("search") || "";
  const initialStatus = searchParams.get("status") || "ALL";
  const initialPage = Number(searchParams.get("page")) || 1;

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [debouncedSearch] = useDebounce(searchQuery, 500);
  const [statusFilter, setStatusFilter] = useState(initialStatus);

  // Sync state to URL when filters change
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (debouncedSearch) {
      params.set("search", debouncedSearch);
      params.set("page", "1"); // Reset page on new search
    } else {
      params.delete("search");
    }

    if (statusFilter !== "ALL") {
      params.set("status", statusFilter);
      params.set("page", "1"); // Reset page on filter change
    } else {
      params.delete("status");
    }

    // Only push if params actually changed
    if (params.toString() !== searchParams.toString()) {
      router.push(`${pathname}?${params.toString()}`);
    }
  }, [debouncedSearch, statusFilter, pathname, router, searchParams]);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <ServicesStats stats={stats} />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1 w-full flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari layanan..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Status Layanan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Status</SelectItem>
              <SelectItem value="ACTIVE">Aktif</SelectItem>
              <SelectItem value="INACTIVE">Tidak Aktif</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Tambah Layanan
        </Button>
      </div>

      <ServicesTable
        services={initialServices}
        onEdit={(service) => setEditingService(service)}
        onDelete={(service) => setDeletingService(service)}
      />

      {totalPages > 1 && (
        <div className="flex justify-center space-x-2 pt-4">
          <Button
            variant="outline"
            disabled={initialPage <= 1}
            onClick={() => handlePageChange(initialPage - 1)}
          >
            Sebelumnya
          </Button>
          <span className="flex items-center justify-center px-4 text-sm font-medium">
            Halaman {initialPage} dari {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={initialPage >= totalPages}
            onClick={() => handlePageChange(initialPage + 1)}
          >
            Selanjutnya
          </Button>
        </div>
      )}

      <ServiceDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />

      {editingService && (
        <ServiceDialog
          open={!!editingService}
          onOpenChange={(open) => !open && setEditingService(null)}
          service={editingService}
        />
      )}

      {deletingService && (
        <ServiceDeleteDialog
          open={!!deletingService}
          onOpenChange={(open) => !open && setDeletingService(null)}
          service={deletingService}
        />
      )}
    </div>
  );
}
