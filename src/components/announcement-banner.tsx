import { SHOW_ANNOUNCEMENT_BANNER } from "@/lib/site-config";

export function AnnouncementBanner() {
  if (!SHOW_ANNOUNCEMENT_BANNER) return null;

  return (
    <div className="border-b border-stone-200 bg-stone-100 px-4 py-2 text-center text-xs leading-relaxed text-stone-600 sm:text-sm">
      <span className="font-semibold tracking-wide text-[#7C2D3E]">
        WEBSITE UPDATE
      </span>
      <span className="mx-1.5 hidden sm:inline">&middot;</span>
      <span className="block sm:inline">
        We&rsquo;re currently updating our website and digital services. Some
        information and features may change as we complete these updates.
        Thank you for your patience as we continue to improve your
        experience.
      </span>
    </div>
  );
}
