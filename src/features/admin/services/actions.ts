"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { serviceSchema, type ServiceInput } from "@/lib/validations";

export async function getAdminServices(params: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  const { search = "", status = "ALL", page = 1, limit = 10 } = params;
  
  const where: any = {
    deletedAt: null,
  };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  if (status === "ACTIVE") {
    where.isActive = true;
  } else if (status === "INACTIVE") {
    where.isActive = false;
  }

  const [services, totalCount, stats] = await Promise.all([
    prisma.service.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.service.count({ where }),
    prisma.service.aggregate({
      where: { deletedAt: null },
      _count: { id: true },
      _avg: { price: true },
    }),
  ]);

  const activeCount = await prisma.service.count({
    where: { deletedAt: null, isActive: true },
  });

  return {
    data: services,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    stats: {
      total: stats._count.id,
      active: activeCount,
      inactive: stats._count.id - activeCount,
      averagePrice: stats._avg.price || 0,
    },
  };
}

export async function createService(data: ServiceInput) {
  try {
    const validated = serviceSchema.parse(data);
    
    const service = await prisma.service.create({
      data: validated,
    });

    revalidatePath("/admin/services");
    return { success: true, data: service };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create service" };
  }
}

export async function updateService(id: string, data: ServiceInput) {
  try {
    const validated = serviceSchema.parse(data);
    
    const service = await prisma.service.update({
      where: { id },
      data: validated,
    });

    revalidatePath("/admin/services");
    return { success: true, data: service };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update service" };
  }
}

export async function toggleServiceStatus(id: string, isActive: boolean) {
  try {
    await prisma.service.update({
      where: { id },
      data: { isActive },
    });

    revalidatePath("/admin/services");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Failed to toggle status" };
  }
}

export async function deleteService(id: string) {
  try {
    await prisma.service.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });

    revalidatePath("/admin/services");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Failed to delete service" };
  }
}
