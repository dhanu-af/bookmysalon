import Link from "next/link";
import { RegisterSalonForm } from "./register-salon-form";
import { fraunces, outfit } from "@/lib/fonts";

export default function RegisterSalonPage() {
  return (
    <div className={`${outfit.className} min-h-screen bg-[#FAF8F5] px-4 py-12`}>
      <div className="mx-auto max-w-lg">
        <Link href="/" className="mb-8 flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-[10px] bg-[#7C2D3E] shadow-md shadow-[#7C2D3E]/30">
            <span className={`${fraunces.className} text-base font-bold leading-none text-white`}>B</span>
          </span>
          <span className={`${fraunces.className} text-xl font-semibold tracking-tight text-stone-900`}>BookMySalon</span>
        </Link>
        <div className="rounded-2xl border border-stone-100 bg-white p-6 shadow-xl shadow-stone-300/40 sm:p-8">
          <h1 className={`${fraunces.className} mb-1 text-2xl font-semibold text-stone-900`}>List your salon on BookMySalon</h1>
          <p className="mb-6 text-sm text-stone-500">
            Your salon will be reviewed by our team before it appears in customer search — usually within 24 hours.
          </p>
          <RegisterSalonForm />
        </div>
      </div>
    </div>
  );
}
