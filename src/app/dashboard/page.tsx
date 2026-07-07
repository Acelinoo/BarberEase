import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";

export default async function DashboardRedirect() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  const role = (session.user as Record<string, unknown>).role as string;

  switch (role) {
    case "ADMIN":
      redirect("/dashboard/admin");
      break;
    case "STAFF":
      redirect("/dashboard/staff");
      break;
    case "CUSTOMER":
      redirect("/dashboard/customer");
      break;
    default:
      redirect("/login");
  }
}
