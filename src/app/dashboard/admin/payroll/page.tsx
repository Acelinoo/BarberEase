import { getPayrolls } from "@/features/payroll/actions";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export default async function AdminPayrollPage() {
  const payrolls = await getPayrolls();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payroll (Penggajian)</h1>
        <p className="text-muted-foreground mt-1">Laporan penggajian staff</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground uppercase">
                <tr>
                  <th className="px-6 py-3 font-medium">Periode</th>
                  <th className="px-6 py-3 font-medium">Staff</th>
                  <th className="px-6 py-3 font-medium">Trx (Bulan ini)</th>
                  <th className="px-6 py-3 font-medium">Total Komisi</th>
                  <th className="px-6 py-3 font-medium">Gaji Pokok</th>
                  <th className="px-6 py-3 font-medium font-bold text-right">Net Pay</th>
                </tr>
              </thead>
              <tbody className="divide-y border-b">
                {payrolls.map((p: any) => (
                  <tr key={p.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4 whitespace-nowrap">{format(new Date(p.periodStart), "MMM yyyy")}</td>
                    <td className="px-6 py-4 font-medium">{p.staff.name}</td>
                    <td className="px-6 py-4">{p.transactionCount}</td>
                    <td className="px-6 py-4 text-emerald-600">{formatCurrency(p.totalCommission)}</td>
                    <td className="px-6 py-4">{formatCurrency(p.baseSalary)}</td>
                    <td className="px-6 py-4 text-right font-bold text-primary">{formatCurrency(p.netPay)}</td>
                  </tr>
                ))}
                {payrolls.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">Data payroll kosong</td>
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
