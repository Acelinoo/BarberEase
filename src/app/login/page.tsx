import type { Metadata } from "next";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = {
  title: "Login | BarberEase",
  description: "Masuk ke akun BarberEase Anda",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-secondary/30 to-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            BarberEase
          </h1>
          <p className="mt-2 text-muted-foreground">
            Masuk ke akun Anda untuk melanjutkan
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
