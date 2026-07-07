import { getTransactions } from "@/features/pos/actions";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { getServerSession } from "@/lib/session";

export default async function StaffTransactionsPage() {
  const session = await getServerSession();
  const transactions = await getTransactions({ staffId: session?.user.id });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Riwayat Transaksi Saya</h1>
        <p className="text-muted-foreground mt-1">Semua transaksi yang sudah diselesaikan oleh Anda</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground uppercase">
                <tr>
                  <th className="px-6 py-3 font-medium">Tanggal</th>
                  <th className="px-6 py-3 font-medium">Receipt</th>
                  <th className="px-6 py-3 font-medium">Customer</th>
                  <th className="px-6 py-3 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y border-b">
                {transactions.map((t: any) => (
                  <tr key={t.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4 whitespace-nowrap">{format(new Date(t.createdAt), "dd MMM yyyy HH:mm")}</td>
                    <td className="px-6 py-4">{t.receiptNumber}</td>
                    <td className="px-6 py-4">{t.customer?.name || t.walkInName || "Walk-In"}</td>
                    <td className="px-6 py-4 text-right font-bold text-primary">{formatCurrency(t.totalAmount)}</td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">Tidak ada transaksi</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
