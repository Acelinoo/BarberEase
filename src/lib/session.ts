import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function getServerSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}

export async function requireAuth() {
  const session = await getServerSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function requireRole(roles: string[]) {
  const session = await requireAuth();
  const userRole = (session.user as Record<string, unknown>).role as string;
  if (!roles.includes(userRole)) {
    throw new Error("Forbidden");
  }
  return session;
}
