import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "./login-form";
import { fraunces } from "@/lib/fonts";

export default function LoginPage() {
  return (
    <div className="rounded-2xl border border-stone-100 bg-white p-6 shadow-xl shadow-stone-300/40 sm:p-8">
      <h1 className={`${fraunces.className} text-2xl font-semibold text-stone-900`}>Welcome back</h1>
      <p className="mt-1 mb-6 text-sm text-stone-500">Sign in to manage your bookings</p>
      <div className="space-y-4">
        <Suspense>
          <LoginForm />
        </Suspense>
        <p className="text-center text-sm text-stone-500">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-[#7C2D3E] underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
