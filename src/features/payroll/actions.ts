"use server";

import type { PrismaClient } from "@/generated/prisma/client";

// This function is triggered by a transaction or run on a schedule
export async function triggerPayrollCalculation(staffId: string, tx: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">) {
  const now = new Date();
  
  // Define period (e.g., current month)
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  // Find existing payroll for this period
  let payroll = await tx.payroll.findFirst({
    where: {
      staffId,
      periodStart: { lte: periodStart },
      periodEnd: { gte: periodEnd },
    },
  });

  // Calculate new totals from transactions in this period
  const transactions = await tx.transaction.findMany({
    where: {
      staffId,
      status: "COMPLETED",
      deletedAt: null,
      createdAt: {
        gte: periodStart,
        lte: periodEnd,
      },
    },
  });

  const totalCommission = transactions.reduce((sum: number, t: { commissionAmount: number }) => sum + t.commissionAmount, 0);
  const transactionCount = transactions.length;

  const staff = await tx.user.findUnique({
    where: { id: staffId },
    select: { salaryHistories: { orderBy: { effectiveDate: "desc" }, take: 1 } },
  });

  const baseSalary = staff?.salaryHistories?.[0]?.baseSalary || 0;
  
  // We assume no deductions/bonuses for automatic trigger, these can be edited later
  const netPay = baseSalary + totalCommission;

  if (payroll) {
    // Update existing
    await tx.payroll.update({
      where: { id: payroll.id },
      data: {
        totalCommission,
        transactionCount,
        baseSalary,
        netPay,
      },
    });
  } else {
    // Create new
    await tx.payroll.create({
      data: {
        staffId,
        periodStart,
        periodEnd,
        baseSalary,
        totalCommission,
        transactionCount,
        netPay,
      },
    });
  }
}

export async function getPayrolls() {
  const { prisma } = await import("@/lib/prisma");
  return prisma.payroll.findMany({
    include: {
      staff: { select: { name: true, role: true } }
    },
    orderBy: { periodStart: 'desc' }
  });
}
