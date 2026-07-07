import { redirect } from "next/navigation";
import { requireRole } from "@/lib/session";

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await requireRole(["STAFF", "ADMIN"]);
  } catch {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
