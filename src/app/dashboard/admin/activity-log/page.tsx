import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function ActivityLogPage() {
  const logs = await prisma.activityLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Activity Log</h1>
        <p className="text-muted-foreground mt-1">Sistem pencatatan aktivitas</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Log Terakhir</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground uppercase">
                <tr>
                  <th className="px-6 py-3 font-medium">Waktu</th>
                  <th className="px-6 py-3 font-medium">Aksi</th>
                  <th className="px-6 py-3 font-medium">Entitas</th>
                  <th className="px-6 py-3 font-medium">Detail</th>
                  <th className="px-6 py-3 font-medium">User ID</th>
                </tr>
              </thead>
              <tbody className="divide-y border-b">
                {logs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                      {format(new Date(log.createdAt), "dd MMM yyyy HH:mm")}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      <Badge variant="outline">{log.action}</Badge>
                    </td>
                    <td className="px-6 py-4">{log.entity}</td>
                    <td className="px-6 py-4 max-w-xs truncate" title={log.details || "-"}>
                      {log.details || "-"}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{log.userId}</td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Tidak ada log aktivitas</td>
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
