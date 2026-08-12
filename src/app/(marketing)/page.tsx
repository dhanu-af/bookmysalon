import Link from "next/link";
import { HeroSearch } from "./_home/hero-search";
import { getRightNowCards, getTestimonials, getTopBarbers, getTopSalons } from "./_home/homepage-data";
import { formatPriceCents } from "@/lib/format";
import { fraunces, outfit } from "@/lib/fonts";

const SALON_PHOTOS = [
  "https://images.unsplash.com/photo-1759134198561-e2041049419c?w=700&h=480&fit=crop&auto=format&q=80",
  "https://images.unsplash.com/photo-1746723378067-83a345ff3160?w=700&h=480&fit=crop&auto=format&q=80",
  "https://images.unsplash.com/photo-1635273051937-a0ddef9573b6?w=700&h=480&fit=crop&auto=format&q=80",
  "https://images.unsplash.com/photo-1747832663556-ae65718965ac?w=700&h=480&fit=crop&auto=format&q=80",
];

const BARBER_PHOTOS = [
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&h=500&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1589279715734-6631a314dfa2?w=500&h=500&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1587397845856-e6cf49176c70?w=500&h=500&fit=crop&auto=format",
];

const FALLBACK_TESTIMONIALS = [
  {
    quote: "I used to wait 40 minutes every Saturday. Now I just book before I leave home. Genuinely one of the best apps I've used.",
    name: "James R.",
    location: "Brisbane, QLD",
  },
  {
    quote: "Being able to choose my usual barber and see his actual available times is exactly what I needed. No more guessing.",
    name: "Michael T.",
    location: "Gold Coast, QLD",
  },
  {
    quote: "Found a great salon nearby and booked in under a minute. I haven't walked in without an appointment since.",
    name: "Sarah K.",
    location: "Brisbane, QLD",
  },
];

const PROCESS_STEPS = [
  { icon: "📍", title: "Find a salon", copy: "Search by suburb, service or availability. Discover salons and barbers near you instantly." },
  { icon: "💈", title: "Choose your barber", copy: "Browse barber profiles, specialties and ratings. Pick who you want or choose any available." },
  { icon: "🕐", title: "Pick your time", copy: "See live appointment slots. Choose a time that fits your day — morning, afternoon or evening." },
  { icon: "✓", title: "Book and go", copy: "Confirm instantly with no phone calls. Arrive at your time and walk straight in." },
];

const WHY_BOOK_ONLINE = [
  { icon: "🏠", title: "Book before you leave home", copy: "See real availability before you travel. No guessing, no wasted trips." },
  { icon: "✂️", title: "Choose who cuts your hair", copy: "Pick your preferred barber every single time. Build a relationship you trust." },
  { icon: "⏰", title: "Your appointment is held for you", copy: "No more turning up and waiting. Your time slot is confirmed and yours." },
  { icon: "🔄", title: "Easy to reschedule or cancel", copy: "Plans change. Manage everything from your phone with no awkward phone calls." },
];

const OWNER_CHECKLIST = [
  "Online bookings 24 / 7",
  "Live availability calendar",
  "Barber management",
  "Walk-in + online",
  "Customer records",
  "No upfront cost",
];

function SectionKicker({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-5 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#7C2D3E]">
      <span className="h-px w-4 bg-[#7C2D3E]" />
      {children}
    </p>
  );
}

function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <span aria-label={`${full} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < full ? "text-amber-400" : "text-stone-200"}>
          ★
        </span>
      ))}
    </span>
  );
}

export default async function HomePage() {
  const [topSalons, rightNowCards, topBarbers, reviews] = await Promise.all([
    getTopSalons(4),
    getRightNowCards(6),
    getTopBarbers(4),
    getTestimonials(3),
  ]);
  const testimonials = reviews.length > 0 ? reviews : FALLBACK_TESTIMONIALS;

  return (
    <div className={`${outfit.className} bg-[#FAF8F5]`}>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#FAF8F5]">
        <div className="absolute inset-0 lg:left-[50%]">
          <img
            alt="Barber crafting a haircut in a modern barbershop"
            className="h-full w-full object-cover object-top"
            src="https://images.unsplash.com/photo-1647140655214-e4a2d914971f?w=1200&h=1400&fit=crop&auto=format&q=85"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#FAF8F5] via-[#FAF8F5]/70 to-transparent lg:via-[#FAF8F5]/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#FAF8F5] via-[#FAF8F5]/10 to-transparent lg:hidden" />
        </div>
        <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="max-w-[600px]">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white/80 px-4 py-1.5 shadow-sm backdrop-blur-sm">
              <span className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className="text-xs text-amber-400">
                    ⭐
                  </span>
                ))}
              </span>
              <span className="text-[11px] font-semibold tracking-wide text-stone-600">Trusted by 10,000+ Australians</span>
            </div>
            <h1
              className={`${fraunces.className} mb-7 text-[44px] font-semibold leading-[0.95] tracking-[-0.03em] text-stone-900 sm:text-[64px] lg:text-[76px]`}
            >
              Skip the
              <br />
              <span className="italic text-[#7C2D3E]">Queue.</span>
              <br />
              Book Your
              <br />
              Salon.
            </h1>
            <p className="mb-10 max-w-[480px] text-lg font-light leading-relaxed text-stone-600 sm:text-xl">
              Find nearby salons, choose your barber and book a time that works for you — all in under a minute.
            </p>

            <HeroSearch />

            <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-3">
              <div className="flex items-center gap-2.5">
                <span className="text-base">💈</span>
                <span className="text-sm text-stone-600">
                  <strong className="font-bold text-stone-900">500+</strong> salons listed
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-base">📅</span>
                <span className="text-sm text-stone-600">
                  <strong className="font-bold text-stone-900">10,000+</strong> bookings made
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-base">🔓</span>
                <span className="text-sm text-stone-600">
                  <strong className="font-bold text-stone-900">24 / 7</strong> book anytime
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simple process */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mb-14 max-w-lg">
            <SectionKicker>Simple process</SectionKicker>
            <h2 className={`${fraunces.className} text-4xl font-semibold leading-tight tracking-tight text-stone-900 sm:text-5xl`}>
              Your next appointment is
              <br className="hidden sm:block" /> just a few taps away.
            </h2>
          </div>
          <div className="relative grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS_STEPS.map((step, i) => (
              <div key={step.title} className="group relative cursor-default rounded-2xl bg-[#FAF8F5] p-7 transition-all duration-300 hover:bg-[#7C2D3E]">
                <div className="mb-8 flex items-center justify-between">
                  <span className="font-light text-[52px] leading-none text-stone-200 transition-colors group-hover:text-white/20">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm transition-colors group-hover:bg-white/15">
                    {step.icon}
                  </div>
                </div>
                <h3 className={`${fraunces.className} mb-3 text-xl font-semibold text-stone-900 transition-colors group-hover:text-white`}>
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-stone-500 transition-colors group-hover:text-white/70">{step.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Salons near you */}
      {topSalons.length > 0 && (
        <section className="bg-[#FAF8F5] py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <SectionKicker>Local discovery</SectionKicker>
                <h2 className={`${fraunces.className} text-4xl font-semibold leading-tight tracking-tight text-stone-900 sm:text-5xl`}>
                  Salons near you
                </h2>
                <p className="mt-3 text-lg font-light text-stone-500">Find your next appointment nearby.</p>
              </div>
              <Link
                href="/search"
                className="hidden items-center gap-1.5 border-b border-[#7C2D3E]/30 pb-0.5 text-sm font-semibold text-[#7C2D3E] transition-colors hover:border-[#7C2D3E] sm:flex"
              >
                View all salons <span>→</span>
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {topSalons.map((salon, i) => (
                <Link
                  key={salon.id}
                  href={`/salons/${salon.slug}`}
                  className="group overflow-hidden rounded-2xl border border-stone-100 bg-white shadow-sm transition-all duration-300 hover:border-stone-200 hover:shadow-2xl hover:shadow-stone-200/70"
                >
                  <div className="relative h-[200px] overflow-hidden bg-stone-200">
                    <img
                      alt={`${salon.name} salon`}
                      className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      src={SALON_PHOTOS[i % SALON_PHOTOS.length]}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    {salon.badge && (
                      <div className="absolute top-3 left-3">
                        <span className="rounded-full bg-[#7C2D3E] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow">
                          {salon.badge}
                        </span>
                      </div>
                    )}
                    {salon.todaySlots[0] && (
                      <div className="absolute top-3 right-3">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                          Next: {salon.todaySlots[0]}
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className={`${fraunces.className} text-lg font-semibold leading-tight text-white drop-shadow-sm`}>{salon.name}</h3>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="mb-1 flex items-center gap-1.5">
                      <Stars rating={salon.avgRating} />
                      <span className="ml-1 text-sm font-bold text-stone-900">{salon.avgRating > 0 ? salon.avgRating.toFixed(1) : "New"}</span>
                      {salon.reviewCount > 0 && <span className="text-xs text-stone-400">({salon.reviewCount} reviews)</span>}
                    </div>
                    <p className="mb-5 flex items-center gap-1 text-xs text-stone-500">
                      <span>📍</span> {salon.suburb}
                      {salon.distanceKm != null && ` · ${salon.distanceKm.toFixed(1)} km`}
                    </p>
                    <div className="flex items-center justify-between border-t border-stone-100 pt-4">
                      <div>
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-stone-400">From</p>
                        <p className={`${fraunces.className} text-2xl font-bold text-stone-900`}>
                          {salon.fromPriceCents != null ? formatPriceCents(salon.fromPriceCents) : "—"}
                        </p>
                      </div>
                      <span className="rounded-xl bg-[#7C2D3E] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#7C2D3E]/20 transition-all duration-150 group-hover:bg-[#6B2535]">
                        View salon
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Right now */}
      {rightNowCards.length > 0 && (
        <section className="bg-white py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="mb-10">
              <SectionKicker>Right now</SectionKicker>
              <h2 className={`${fraunces.className} mb-3 text-4xl font-semibold leading-tight tracking-tight text-stone-900 sm:text-5xl`}>
                Need a haircut today?
              </h2>
              <p className="text-lg font-light text-stone-500">Salons with appointments available right now.</p>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none]">
              {rightNowCards.map((card, i) => (
                <Link
                  key={`${card.salonSlug}-${i}`}
                  href={`/salons/${card.salonSlug}/book`}
                  className="group w-[220px] shrink-0 rounded-2xl border border-stone-200 bg-[#FAF8F5] p-5 transition-all duration-200 hover:border-[#7C2D3E]/40 hover:bg-white hover:shadow-lg hover:shadow-stone-200/60"
                >
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                    Available
                  </span>
                  <h3 className={`${fraunces.className} mt-4 mb-1 text-[15px] font-semibold leading-tight text-stone-900`}>{card.salonName}</h3>
                  <p className="mb-1 text-xs text-stone-400">{card.barberName}</p>
                  <p className="mb-5 text-sm font-medium text-stone-600">{card.serviceName}</p>
                  <div className="flex items-end justify-between border-t border-stone-200 pt-4">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Today</p>
                      <p className={`${fraunces.className} text-xl font-bold text-stone-900`}>{card.time}</p>
                      <p className="mt-0.5 text-xs text-stone-400">{formatPriceCents(card.priceCents)}</p>
                    </div>
                    <span className="rounded-xl bg-[#7C2D3E] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#7C2D3E]/20 transition-all duration-150 group-hover:bg-[#6B2535]">
                      Book
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Barber profiles */}
      {topBarbers.length > 0 && (
        <section className="bg-[#FAF8F5] py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="mb-10">
              <SectionKicker>Barber profiles</SectionKicker>
              <h2 className={`${fraunces.className} text-4xl font-semibold leading-tight tracking-tight text-stone-900 sm:text-5xl`}>
                Find a barber you&apos;ll love.
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {topBarbers.map((barber, i) => (
                <div
                  key={barber.id}
                  className="group overflow-hidden rounded-2xl border border-stone-100 bg-white shadow-sm transition-all duration-300 hover:border-stone-200 hover:shadow-xl hover:shadow-stone-200/50"
                >
                  <div className="relative h-52 overflow-hidden bg-stone-200">
                    <img
                      alt={barber.name}
                      className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      src={barber.photoUrl || BARBER_PHOTOS[i % BARBER_PHOTOS.length]}
                    />
                    <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/50 to-transparent" />
                    {barber.reviewCount > 0 && (
                      <div className="absolute bottom-3 left-3">
                        <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-stone-800 backdrop-blur">
                          ⭐ {barber.avgRating.toFixed(1)} ({barber.reviewCount})
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className={`${fraunces.className} text-lg font-semibold text-stone-900`}>{barber.name}</h3>
                    {barber.title && <p className="mt-0.5 mb-1 text-xs font-semibold uppercase tracking-wide text-[#7C2D3E]">{barber.title}</p>}
                    <p className="mb-5 border-b border-stone-100 pb-4 text-xs text-stone-400">
                      {barber.salonName} · {barber.salonSuburb}
                    </p>
                    <span className="block w-full rounded-xl border-2 border-stone-300 py-3.5 text-center text-sm font-medium text-stone-700 transition-all duration-150 group-hover:border-stone-400 group-hover:text-stone-900">
                      View profile
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Why book online */}
      <section className="overflow-hidden bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid items-center gap-16 lg:grid-cols-2 xl:gap-24">
            <div className="relative order-2 flex justify-center lg:order-1">
              <div className="relative w-full max-w-sm sm:max-w-md">
                <div className="relative h-[440px] overflow-hidden rounded-3xl bg-stone-200 shadow-2xl shadow-stone-300/50 sm:h-[520px]">
                  <img
                    alt="Person arriving at a modern salon"
                    className="h-full w-full object-cover"
                    src="https://images.unsplash.com/photo-1567894340315-735d7c361db0?w=900&h=1100&fit=crop&auto=format&q=85"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />
                </div>
                <div className="absolute -top-5 -left-5 w-44 rounded-2xl border border-stone-100 bg-white p-4 shadow-xl sm:-left-10">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-stone-400">Average wait saved</p>
                  <p className={`${fraunces.className} text-4xl font-semibold text-stone-900`}>
                    40<span className="text-xl font-light text-stone-300"> min</span>
                  </p>
                  <p className="mt-1 text-[11px] font-semibold text-emerald-600">Per booking ↑</p>
                </div>
                <div className="absolute -bottom-5 -right-5 w-48 rounded-2xl border border-stone-100 bg-white p-4 shadow-xl sm:-right-8">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-stone-400">Your booking</p>
                  <div className="flex items-center gap-2.5">
                    <div className={`${fraunces.className} flex h-9 w-9 items-center justify-center rounded-full bg-[#7C2D3E]/10 text-sm font-bold text-[#7C2D3E]`}>
                      J
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-stone-900">John · Haircut</p>
                      <p className="text-xs text-stone-500">Today at 5:30 PM</p>
                    </div>
                  </div>
                  <div className="mt-2.5 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <p className="text-[11px] font-semibold text-emerald-600">Confirmed</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <SectionKicker>Why book online</SectionKicker>
              <h2 className={`${fraunces.className} mb-10 text-4xl font-semibold leading-tight tracking-tight text-stone-900 sm:text-5xl`}>
                No more waiting around.
              </h2>
              <div className="space-y-8">
                {WHY_BOOK_ONLINE.map((item) => (
                  <div key={item.title} className="group flex gap-5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-stone-200 bg-[#FAF8F5] text-xl transition-colors group-hover:border-[#7C2D3E]/20 group-hover:bg-[#7C2D3E]/5">
                      {item.icon}
                    </div>
                    <div className="pt-0.5">
                      <h3 className={`${fraunces.className} mb-1.5 font-semibold text-stone-900`}>{item.title}</h3>
                      <p className="text-sm leading-relaxed text-stone-500">{item.copy}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/search"
                  className="inline-flex items-center justify-center rounded-xl bg-[#7C2D3E] px-8 py-4 text-base font-semibold text-white shadow-md shadow-[#7C2D3E]/20 transition-all duration-150 hover:bg-[#6B2535] hover:shadow-lg hover:shadow-[#7C2D3E]/30 active:scale-[0.98]"
                >
                  Find a Salon Near Me
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center rounded-xl border-2 border-stone-300 px-8 py-4 text-base font-medium text-stone-700 transition-all duration-150 hover:border-stone-400 hover:text-stone-900 active:scale-[0.98]"
                >
                  See how it works
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For business owners */}
      <section className="bg-stone-950 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid items-center gap-14 lg:grid-cols-2 xl:gap-20">
            <div>
              <SectionKicker>For business owners</SectionKicker>
              <h2 className={`${fraunces.className} mb-5 text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl`}>
                Your salon.
                <br />
                Your schedule.
                <br />
                More bookings.
              </h2>
              <p className="mb-10 max-w-sm text-lg font-light leading-relaxed text-stone-400">
                Give customers an easier way to book while keeping full control of your salon calendar and team.
              </p>
              <div className="mb-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {OWNER_CHECKLIST.map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#7C2D3E]">
                      <span className="text-[10px] font-bold text-white">✓</span>
                    </div>
                    <span className="text-sm text-stone-300">{item}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/register/salon"
                  className="inline-flex items-center justify-center rounded-xl bg-[#7C2D3E] px-8 py-4 text-base font-semibold text-white shadow-md shadow-[#7C2D3E]/20 transition-all duration-150 hover:bg-[#6B2535] hover:shadow-lg hover:shadow-[#7C2D3E]/30 active:scale-[0.98]"
                >
                  List Your Salon
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center rounded-xl border border-stone-700 px-7 py-4 text-base font-medium text-stone-400 transition-colors hover:border-stone-500 hover:text-white"
                >
                  Learn more
                </a>
              </div>
              <p className="mt-4 text-sm text-stone-600">It&apos;s easy to get started. No credit card required.</p>
            </div>

            {/* Illustrative dashboard mockup — decorative, not a live view */}
            <div className="overflow-hidden rounded-2xl border border-stone-800 bg-stone-900 shadow-2xl">
              <div className="flex items-center gap-3 border-b border-stone-800 bg-stone-950 px-5 py-3">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500/60" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/60" />
                </div>
                <div className="flex flex-1 justify-center">
                  <span className="rounded-full border border-stone-800 bg-stone-900 px-4 py-1 text-[11px] font-medium text-stone-500">
                    BookMySalon Dashboard
                  </span>
                </div>
              </div>
              <div className="p-5">
                <div className="mb-5 flex gap-1 rounded-xl bg-stone-950 p-1">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => (
                    <span
                      key={day}
                      className={`flex-1 rounded-lg py-1.5 text-center text-xs font-semibold ${
                        i === 0 ? "bg-[#7C2D3E] text-white shadow-md" : "text-stone-500"
                      }`}
                    >
                      {day}
                    </span>
                  ))}
                </div>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h4 className={`${fraunces.className} text-sm font-semibold text-white`}>Today&apos;s bookings</h4>
                    <p className="mt-0.5 text-xs text-stone-500">Monday</p>
                  </div>
                  <span className="rounded-full bg-[#7C2D3E]/20 px-3 py-1 text-xs font-bold text-[#D4919F]">4 booked</span>
                </div>
                <div className="mb-5 space-y-2.5">
                  {[
                    { initial: "J", name: "John", service: "Haircut", time: "5:30 PM", status: "confirmed" },
                    { initial: "M", name: "Mike", service: "Beard Trim", time: "6:00 PM", status: "confirmed" },
                    { initial: "C", name: "Chris", service: "Fade", time: "6:30 PM", status: "pending" },
                    { initial: "A", name: "Alex", service: "Hot Shave", time: "7:00 PM", status: "confirmed" },
                  ].map((row) => (
                    <div key={row.name} className="flex items-center justify-between rounded-xl border border-stone-800/60 bg-stone-950/70 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`${fraunces.className} flex h-8 w-8 items-center justify-center rounded-full bg-[#7C2D3E]/20 text-xs font-bold text-[#7C2D3E]`}>
                          {row.initial}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{row.name}</p>
                          <p className="text-xs text-stone-500">{row.service}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-stone-200">{row.time}</p>
                        <span className={`text-[11px] font-semibold ${row.status === "confirmed" ? "text-emerald-400" : "text-amber-400"}`}>
                          {row.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl border border-stone-800/60 bg-stone-950/70 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs font-medium text-stone-400">Bookings this week</p>
                    <span className="text-xs font-semibold text-emerald-400">↑ 18% vs last week</span>
                  </div>
                  <div className="flex h-14 items-end gap-2">
                    {[45, 73, 55, 82, 100, 64, 36].map((h, i) => (
                      <div key={i} className="flex flex-1 flex-col justify-end">
                        <div className={`rounded-t-sm ${i === 0 ? "bg-[#7C2D3E]" : "bg-stone-700"}`} style={{ height: `${h}%` }} />
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 flex">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => (
                      <span key={day} className={`flex-1 text-center text-[10px] ${i === 0 ? "font-bold text-[#D4919F]" : "text-stone-600"}`}>
                        {day}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer reviews */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mb-14 text-center">
            <SectionKicker>Customer reviews</SectionKicker>
            <h2 className={`${fraunces.className} text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl`}>Loved by customers.</h2>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="relative rounded-2xl border border-stone-100 bg-[#FAF8F5] p-8 transition-all duration-200 hover:border-stone-200 hover:shadow-lg hover:shadow-stone-200/60"
              >
                <div className={`${fraunces.className} mb-4 select-none text-6xl leading-none text-[#7C2D3E]/15`}>&ldquo;</div>
                <div className="mb-5 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <span key={j} className="text-amber-400">
                      ★
                    </span>
                  ))}
                </div>
                <blockquote className={`${fraunces.className} mb-8 text-lg font-light italic leading-relaxed text-stone-800`}>
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <div className="flex items-center gap-3 border-t border-stone-200 pt-5">
                  <div className={`${fraunces.className} flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#7C2D3E] text-sm font-bold text-white`}>
                    {t.name
                      .split(" ")
                      .map((p) => p[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-stone-900">{t.name}</p>
                    {t.location && <p className="text-xs text-stone-400">{t.location}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden py-24 sm:py-36">
        <div className="absolute inset-0 bg-stone-900">
          <img
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover opacity-25"
            src="https://images.unsplash.com/photo-1621645582931-d1d3e6564943?w=1600&h=800&fit=crop&auto=format&q=80"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-stone-900/60 to-stone-950/90" />
        </div>
        <div className="relative mx-auto max-w-3xl px-5 text-center sm:px-8">
          <SectionKicker>Get started today</SectionKicker>
          <h2 className={`${fraunces.className} mb-6 text-5xl font-semibold leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl`}>
            Ready to skip
            <br className="hidden sm:block" /> the queue?
          </h2>
          <p className="mx-auto mb-12 max-w-lg text-lg font-light text-stone-400 sm:text-xl">
            Find a salon near you and book your next appointment today.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/search"
              className="inline-flex items-center justify-center rounded-xl bg-[#7C2D3E] px-8 py-4 text-base font-semibold text-white shadow-md shadow-[#7C2D3E]/20 transition-all duration-150 hover:bg-[#6B2535] hover:shadow-lg hover:shadow-[#7C2D3E]/30 active:scale-[0.98] sm:px-10 sm:py-5 sm:text-lg"
            >
              Find a Salon Near Me
            </Link>
            <Link
              href="/register/salon"
              className="inline-flex items-center justify-center rounded-xl border border-stone-700 px-8 py-4 text-base font-medium text-stone-400 transition-colors hover:border-stone-500 hover:text-white sm:py-5 sm:text-lg"
            >
              I&apos;m a Salon Owner
            </Link>
          </div>
          <p className="mt-6 text-sm text-stone-600">Free to use. No account required to search.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-900 bg-stone-950">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
          <div className="mb-14 grid grid-cols-2 gap-10 sm:grid-cols-4">
            <div className="col-span-2 sm:col-span-1">
              <div className="mb-4 flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#7C2D3E] shadow">
                  <span className={`${fraunces.className} text-base font-bold text-white`}>B</span>
                </span>
                <span className={`${fraunces.className} text-xl font-semibold tracking-tight text-white`}>BookMySalon</span>
              </div>
              <p className="max-w-[200px] text-sm leading-relaxed text-stone-500">Australia&apos;s salon and barber booking marketplace.</p>
            </div>
            <div>
              <h4 className="mb-5 text-sm font-semibold text-white">BookMySalon</h4>
              <ul className="space-y-3.5">
                <li>
                  <Link href="/search" className="text-sm text-stone-500 transition-colors hover:text-stone-300">
                    Find salons
                  </Link>
                </li>
                <li>
                  <a href="#how-it-works" className="text-sm text-stone-500 transition-colors hover:text-stone-300">
                    How it works
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-5 text-sm font-semibold text-white">For Salons</h4>
              <ul className="space-y-3.5">
                <li>
                  <Link href="/register/salon" className="text-sm text-stone-500 transition-colors hover:text-stone-300">
                    List your salon
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="text-sm text-stone-500 transition-colors hover:text-stone-300">
                    Salon login
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-5 text-sm font-semibold text-white">Company</h4>
              <ul className="space-y-3.5">
                <li>
                  <Link href="/account" className="text-sm text-stone-500 transition-colors hover:text-stone-300">
                    Your account
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col items-center justify-between gap-4 border-t border-stone-900 pt-8 sm:flex-row">
            <p className="text-sm text-stone-600">© {new Date().getFullYear()} BookMySalon. All rights reserved.</p>
            <p className="text-xs text-stone-700">Designed &amp; built in Brisbane, Australia 🇦🇺</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
