import { SiteHeader } from "@/components/customer/site-header";
import { outfit } from "@/lib/fonts";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${outfit.className} flex min-h-screen flex-col bg-[#FAF8F5]`}>
      <SiteHeader />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
    </div>
  );
}
