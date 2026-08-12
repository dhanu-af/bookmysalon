import Link from "next/link";
import { fraunces, outfit } from "@/lib/fonts";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${outfit.className} flex min-h-screen flex-col items-center justify-center bg-[#FAF8F5] px-4 py-12`}>
      <Link href="/" className="mb-8 flex items-center gap-2.5">
        <span className="flex size-8 items-center justify-center rounded-[10px] bg-[#7C2D3E] shadow-md shadow-[#7C2D3E]/30">
          <span className={`${fraunces.className} text-base font-bold leading-none text-white`}>B</span>
        </span>
        <span className={`${fraunces.className} text-xl font-semibold tracking-tight text-stone-900`}>BookMySalon</span>
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
