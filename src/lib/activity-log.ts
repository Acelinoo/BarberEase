import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

type LogActivityParams = {
  action: string;
  entity: string;
  entityId?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  userId?: string;
  ipAddress?: string;
};

export async function logActivity(params: LogActivityParams) {
  await prisma.activityLog.create({
    data: {
      action: params.action,
      entity: params.entity,
      entityId: params.entityId,
      description: params.description,
      metadata: params.metadata as Prisma.InputJsonValue,
      userId: params.userId,
      ipAddress: params.ipAddress,
    },
  });
}
