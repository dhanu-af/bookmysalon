import Link from "next/link";
import { RegisterForm } from "./register-form";
import { fraunces } from "@/lib/fonts";

export default function RegisterPage() {
  return (
    <div className="rounded-2xl border border-stone-100 bg-white p-6 shadow-xl shadow-stone-300/40 sm:p-8">
      <h1 className={`${fraunces.className} text-2xl font-semibold text-stone-900`}>Create your account</h1>
      <p className="mt-1 mb-6 text-sm text-stone-500">Book faster next time and manage your appointments</p>
      <div className="space-y-4">
        <RegisterForm />
        <p className="text-center text-sm text-stone-500">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-[#7C2D3E] underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
