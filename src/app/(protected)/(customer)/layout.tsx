import { redirect } from "next/navigation";
import { requireRole } from "@/lib/session";

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await requireRole(["CUSTOMER"]);
  } catch {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
