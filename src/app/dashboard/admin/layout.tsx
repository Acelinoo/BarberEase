import { redirect } from "next/navigation";
import { requireRole } from "@/lib/session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await requireRole(["ADMIN"]);
  } catch {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
