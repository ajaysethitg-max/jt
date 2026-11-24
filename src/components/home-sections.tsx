import type { ReactNode } from "react";
import { SmartImage } from "./smart-image";
import Link from "next/link";
import { ArrowRight, Check, ChevronRight, CreditCard, Gift, MapPin, Percent, Phone, ShieldCheck, Star, Timer, Truck, Wallet, Zap } from "lucide-react";
import { InstagramIcon } from "./icons";
import type { SiteSettings, Product, Testimonial } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/types";
import { cn, discountPct, effectivePrice, formatInr, splitTagline } from "@/lib/format";
import { AddToCartButton } from "./add-to-cart-button";
import { Countdown } from "./countdown";
import { HeroDeals } from "./hero-deals";
import { mapsLink } from "@/lib/seo";
import { ProductCard } from "./product-card";
import { RatingStars } from "./rating-stars";
import { Reveal } from "./reveal";

/* ------------------------------ Shared ------------------------------ */

export function SectionHeading({
  eyebrow,
  title,
  sub,
  align = "center",
  dark = false,
}: {
  eyebrow?: string;
  title: ReactNode;
  sub?: string;
  align?: "left" | "center";
  dark?: boolean;
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" ? "mx-auto text-center" : "text-left")}>
      {eyebrow && (
        <p className={cn("flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em]", dark ? "justify-center text-bp-300" : align === "center" ? "justify-center text-bp-600" : "text-bp-600")}>
          <span className={cn("h-1.5 w-1.5 rounded-full", dark ? "bg-bp-300" : "bg-bp-500")} />
          {eyebrow}
        </p>
      )}
      <h2 className={cn("mt-3 text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl lg:text-5xl", dark ? "text-white" : "text-ink-900")}>{title}</h2>
      {sub && <p className={cn("mt-4 text-base leading-relaxed sm:text-lg", dark ? "text-tq-100/80" : "text-ink-500")}>{sub}</p>}
    </div>
  );
}

/* ------------------------------- Hero ------------------------------- */

export function Hero({ settings, deals = [] }: { settings: SiteSettings; deals?: Product[] }) {
  const tag = splitTagline(settings.tagline);
  const tagFirst = tag[0] ?? "";
  const tagRest = tag.slice(1).join(" ");
  return (
    <section className="noise relative overflow-hidden bg-gradient-to-br from-tq-50 via-white to-bp-50">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-tq-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-bp-200/60 blur-3xl" />
      <div className="container-x relative grid items-center gap-10 py-12 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:py-20">
        <div className="animate-fade-up">
          <p className="inline-flex items-center gap-2 rounded-full border border-tq-200 bg-white/80 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-tq-700 shadow-soft">
            <MapPin className="h-3.5 w-3.5" /> {settings.headline}
          </p>
          <h1 className="mt-6 text-[2.75rem] font-semibold leading-[1.02] tracking-tight text-ink-900 sm:text-6xl lg:text-7xl">
            {tagFirst}
            {tagRest && (
              <>
                <br />
                <span className="italic text-bp-600">{tagRest}</span>
              </>
            )}
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-600 sm:text-lg">
            Genuine phones and accessories from {settings.brands.join(", ")} — with 0% finance, free gifts with every purchase and the best deal of the city, every single day.
          </p>

          <div className="mt-7 inline-flex flex-wrap items-center gap-3 rounded-2xl bg-white px-5 py-3.5 shadow-soft ring-2 ring-bp-300 animate-pulse-ring">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-bp-500 text-white">
              <Truck className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-black uppercase tracking-[0.12em] text-bp-700">{settings.sameDayText}</p>
              <p className="text-xs font-semibold text-ink-500">Order before 6 PM · Rajpur Road to Sahastradhara</p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/products?c=mobiles" className="shine inline-flex items-center gap-2 rounded-full bg-tq-600 px-7 py-3.5 text-sm font-bold text-white shadow-tq transition hover:-translate-y-0.5 hover:bg-tq-700">
              Shop mobiles <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/products?deals=1" className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white px-7 py-3.5 text-sm font-bold text-ink-800 transition hover:border-bp-400 hover:text-bp-700">
              <Timer className="h-4 w-4 text-bp-500" /> Today&apos;s deals
            </Link>
          </div>

          <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-ink-200/70 pt-6">
            {[
              ["10+", "brands in store"],
              ["0%", "finance available"],
              ["Free", "gifts every purchase"],
            ].map(([v, l]) => (
              <div key={l}>
                <dt className="font-display text-2xl font-semibold text-ink-900 sm:text-3xl">{v}</dt>
                <dd className="mt-1 text-xs font-semibold uppercase tracking-wider text-ink-500">{l}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          {deals.length > 0 ? (
            <HeroDeals deals={deals} />
          ) : (
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-white shadow-lift ring-1 ring-ink-100">
              <SmartImage src={settings.heroImage || "/images/hero.jpg"} alt="Pink smartphone, earbuds and smartwatch from Jeet Telecom" fill sizes="(max-width: 1024px) 90vw, 45vw" className="object-cover" priority />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------- Trust strip ---------------------------- */

export function TrustStrip({ settings }: { settings: SiteSettings }) {
  const items = [
    { icon: Truck, title: settings.sameDayText, text: "Order before 6 PM, delivered to your doorstep today" },
    { icon: Percent, title: "0% finance available", text: settings.financePartners.join(" · ") },
    { icon: Gift, title: "Free gifts with every purchase", text: settings.freeGifts.join(" · ") },
    { icon: ShieldCheck, title: "100% genuine products", text: "Brand warranty and GST bill on every box" },
  ];
  return (
    <section className="border-y border-ink-100 bg-white">
      <div className="container-x grid grid-cols-1 divide-y divide-ink-100 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
        {items.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex items-start gap-4 px-2 py-6 lg:px-6">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-tq-50 text-tq-700 ring-1 ring-tq-100">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-bold text-ink-900">{title}</p>
              <p className="mt-1 text-xs leading-relaxed text-ink-500">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* --------------------------- Deal of the day --------------------------- */

export function DealOfDay({ deals }: { deals: Product[] }) {
  const [hero, ...rest] = deals;
  if (!hero || !hero.deal) return null;
  const price = hero.deal.dealPrice;
  const off = discountPct(hero.mrp, price);
  return (
    <section id="deal" className="relative overflow-hidden bg-tq-900 py-16 sm:py-20">
      <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-tq-600/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-20 h-80 w-80 rounded-full bg-bp-500/20 blur-3xl" />
      <div className="container-x relative">
        <Reveal>
          <SectionHeading
            dark
            eyebrow="Deals of the day"
            title={<>Best deal of the city — <span className="italic text-bp-300">before the clock runs out</span></>}
            sub="Prices cut for today only. When the timer hits zero, the deal is gone."
          />
        </Reveal>

        <Reveal delay={100} className="mt-12">
          <div className="grid overflow-hidden rounded-[2rem] bg-white shadow-lift lg:grid-cols-[1.1fr_1fr]">
            <Link href={`/products/${hero.slug}`} className="group relative min-h-[320px] overflow-hidden bg-bp-50 lg:min-h-[460px]">
              <SmartImage
                src={hero.images[0] ?? "/images/hero.jpg"}
                alt={hero.name}
                fill
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <span className="absolute left-5 top-5 inline-flex items-center gap-1.5 rounded-full bg-bp-500 px-3.5 py-1.5 text-xs font-black uppercase tracking-wider text-white shadow-pink">
                <Zap className="h-3.5 w-3.5" fill="currentColor" /> {hero.deal.label ?? "Deal of the day"}
              </span>
              <span className="absolute right-5 top-5 rounded-full bg-ink-900 px-3.5 py-1.5 text-xs font-black text-white tnum">{off}% OFF</span>
            </Link>

            <div className="flex flex-col justify-between gap-8 p-6 sm:p-10">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-tq-700">{hero.brand}</p>
                <Link href={`/products/${hero.slug}`}>
                  <h3 className="mt-2 text-2xl font-semibold leading-tight text-ink-900 sm:text-3xl">{hero.name}</h3>
                </Link>
                <div className="mt-3 flex items-center gap-3">
                  <RatingStars rating={hero.rating} count={hero.reviewCount} showValue />
                </div>
                <div className="mt-6 flex flex-wrap items-end gap-x-4 gap-y-1">
                  <span className="tnum text-4xl font-bold text-ink-900">{formatInr(price)}</span>
                  <span className="tnum text-xl text-ink-400 line-through">{formatInr(hero.mrp)}</span>
                  <span className="rounded-lg bg-bp-100 px-2 py-1 text-xs font-black text-bp-700">You save {formatInr(hero.mrp - price)}</span>
                </div>
              </div>

              <div>
                <Countdown endsAt={hero.deal.endsAt} size="lg" label="Deal ends in" />
                <div className="mt-6 flex flex-wrap gap-3">
                  <AddToCartButton product={hero} label="Grab this deal" variant="pink" size="lg" />
                  <Link href={`/products/${hero.slug}`} className="inline-flex items-center gap-2 rounded-full border border-ink-200 px-6 py-4 text-base font-bold text-ink-800 hover:border-tq-400 hover:text-tq-700">
                    View details <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
                <p className="mt-4 flex items-center gap-2 text-xs font-semibold text-ink-500">
                  <Gift className="h-4 w-4 text-bp-500" /> Free gift included · 0% EMI available · {hero.stock} left in stock
                </p>
              </div>
            </div>
          </div>
        </Reveal>

        {rest.length > 0 && (
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
            {rest.slice(0, 4).map((p, i) => (
              <Reveal key={p.sku} delay={i * 80}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ----------------------------- Collections ----------------------------- */

const COLLECTIONS = [
  { key: "mobiles", title: "Mobiles", image: "/images/collections/mobiles.jpg", blurb: "Flagships to budget 5G" },
  { key: "audio", title: "Audio", image: "/images/collections/audio.jpg", blurb: "Earbuds, headphones, speakers" },
  { key: "wearables", title: "Wearables", image: "/images/collections/wearables.jpg", blurb: "Smartwatches & bands" },
  { key: "accessories", title: "Accessories", image: "/images/collections/accessories.jpg", blurb: "Chargers, cases, power banks" },
] as const;

export function Collections({ counts, images = {} }: { counts: Record<string, number>; images?: Record<string, string> }) {
  return (
    <section className="py-16 sm:py-20">
      <div className="container-x">
        <Reveal>
          <SectionHeading eyebrow="Featured collections" title="Everything your phone needs" sub="Hand-picked mobiles, audio, wearables and accessories — all under one roof in Dehradun." />
        </Reveal>
        <div className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
          {COLLECTIONS.map((c, i) => (
            <Reveal key={c.key} delay={i * 90}>
              <Link
                href={`/products?c=${c.key}`}
                className="group relative block aspect-[3/4] overflow-hidden rounded-[1.75rem] bg-ink-100 shadow-soft transition hover:shadow-lift"
              >
                <SmartImage src={images[c.key] || c.image} alt={`${c.title} collection`} fill sizes="(max-width: 1024px) 50vw, 25vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/75 via-ink-950/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-bp-200">
                    {counts[c.key] ?? 0} products
                  </p>
                  <h3 className="mt-1 font-display text-2xl font-semibold text-white sm:text-3xl">{c.title}</h3>
                  <p className="mt-1 text-sm text-white/80">{c.blurb}</p>
                  <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white backdrop-blur">
                    Shop now <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------- Brand marquee ---------------------------- */

export function BrandMarquee({ brands, logos = [] }: { brands: string[]; logos?: string[] }) {
  const list = brands.length ? brands : ["Apple", "Samsung"];
  return (
    <section className="border-y border-ink-100 bg-white py-8">
      <div className="container-x">
        <p className="text-center text-xs font-bold uppercase tracking-[0.22em] text-ink-500">Authorised dealer for</p>
        <div className="marquee-mask mt-5 overflow-hidden">
          <div className="marquee-track flex w-max animate-marquee-slow items-center">
            {[0, 1].map((copy) =>
              list.map((b, i) => (
                <span key={`${copy}-${b}`} className="flex items-center pr-10">
                  {brands.length && logos[i] ? (
                    <SmartImage src={logos[i]} alt={b} width={160} height={48} className="h-9 w-auto max-w-[9rem] object-contain opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0 sm:h-11" />
                  ) : (
                    <span className="font-display text-2xl font-semibold text-ink-400 transition hover:text-tq-700 sm:text-3xl">{b}</span>
                  )}
                  <span className="ml-10 h-1.5 w-1.5 rounded-full bg-bp-400" />
                </span>
              )),
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------- Featured ------------------------------- */

export function FeaturedProducts({ products, title = "Featured picks", eyebrow = "Hand-picked for you" }: { products: Product[]; title?: string; eyebrow?: string }) {
  if (!products.length) return null;
  return (
    <section className="py-16 sm:py-20">
      <div className="container-x">
        <Reveal>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading align="left" eyebrow={eyebrow} title={title} />
            <Link href="/products" className="inline-flex items-center gap-1.5 text-sm font-bold text-tq-700 hover:text-tq-900">
              View all products <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
          {products.map((p, i) => (
            <Reveal key={p.sku} delay={(i % 4) * 70}>
              <ProductCard product={p} priority={i < 2} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ Free gifts ------------------------------ */

const GIFT_META: Record<string, { image: string; note: string }> = {
  trolley: { image: "/images/gifts/trolley.jpg", note: "VIP cabin-size trolley bag" },
  watch: { image: "/images/products/watch-1.jpg", note: "Noise smartwatch with calling" },
  headphone: { image: "/images/products/hp-1.jpg", note: "boAt wireless headphones" },
};

export function FreeGifts({ gifts, images = [] }: { gifts: string[]; images?: string[] }) {
  const list = (gifts.length ? gifts : ["Trolley Bag", "Noise Smartwatch", "boAt Headphones"]).slice(0, 3);
  const pick = (name: string) =>
    /trolley|bag/i.test(name) ? GIFT_META.trolley : /watch|noise/i.test(name) ? GIFT_META.watch : GIFT_META.headphone;
  return (
    <section id="gifts" className="noise relative overflow-hidden bg-bp-50 py-16 sm:py-20">
      <div className="pointer-events-none absolute -left-20 top-1/3 h-72 w-72 rounded-full bg-bp-200/60 blur-3xl" />
      <div className="container-x relative">
        <Reveal>
          <SectionHeading eyebrow="Free gifts with every purchase" title={<>Buy anything. <span className="italic text-bp-600">Leave with a gift.</span></>} sub="Every mobile, smartwatch or accessory you buy comes with a free gift — choose yours at the billing counter." />
        </Reveal>
        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          {list.map((g, i) => {
            const meta = pick(g);
            return (
              <Reveal key={g} delay={i * 90}>
                <div className="group relative overflow-hidden rounded-[1.75rem] bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-pink">
                  <div className="relative aspect-[4/3] overflow-hidden bg-ink-50">
                    <SmartImage src={images[i] || meta.image} alt={g} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                    <span className="absolute left-4 top-4 rounded-full bg-bp-500 px-3 py-1 text-xs font-black uppercase tracking-wider text-white shadow-pink">Free</span>
                  </div>
                  <div className="p-5">
                    <p className="flex items-center gap-2 font-display text-xl font-semibold text-ink-900">
                      <Gift className="h-5 w-5 text-bp-500" /> {g}
                    </p>
                    <p className="mt-1 text-sm text-ink-500">{meta.note} · on every purchase</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
        <p className="mt-8 text-center text-sm font-semibold text-ink-500">
          Gift options rotate every month — this month: {list.join(", ")}.
        </p>
      </div>
    </section>
  );
}

/* ------------------------------- Finance ------------------------------- */

export function Finance({ partners, logos = [] }: { partners: string[]; logos?: string[] }) {
  const list = partners.length ? partners : ["Bajaj Finserv", "IDFC FIRST Bank", "Home Credit"];
  const colors = ["from-tq-500 to-tq-700", "from-bp-400 to-bp-600", "from-ink-700 to-ink-900"];
  return (
    <section className="py-16 sm:py-20">
      <div className="container-x grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
        <Reveal>
          <SectionHeading
            align="left"
            eyebrow="No cost EMI"
            title={<>0% finance available on <span className="italic text-tq-600">{list.length > 1 ? `${list.slice(0, -1).join(", ")} & ${list[list.length - 1]}` : list[0]}</span></>}
            sub="Take home the phone you want today and pay in easy monthly instalments with zero interest. Minimal documents, instant approval at the counter."
          />
          <ul className="mt-8 space-y-3">
            {[
              "No cost EMI on 3, 6, 9 and 12 month tenures",
              "Bring only your PAN card and Aadhaar",
              "Approved in about 10 minutes at the store",
            ].map((t) => (
              <li key={t} className="flex items-center gap-3 text-sm font-semibold text-ink-700">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-tq-100 text-tq-700">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={120}>
          <div className="rounded-[2rem] bg-ink-900 p-6 text-white shadow-lift sm:p-8">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-tq-300">
              <Wallet className="h-4 w-4" /> Finance partners
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {list.map((p, i) => (
                <div key={p} className="flex items-center gap-3 rounded-2xl bg-white/5 p-3 ring-1 ring-white/10 sm:flex-col sm:items-start">
                  {partners.length && logos[i] ? (
                    <span className="relative block h-11 w-20 shrink-0 overflow-hidden rounded-xl bg-white p-1.5 sm:h-12 sm:w-28">
                      <SmartImage src={logos[i]} alt={p} width={112} height={40} className="h-full w-full object-contain" />
                    </span>
                  ) : (
                    <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-sm font-black", colors[i % colors.length])}>{p.slice(0, 1)}</span>
                  )}
                  <p className="text-sm font-bold leading-tight">{p}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-2xl bg-white p-5 text-ink-900">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink-500">Example — a ₹60,000 phone at 0% interest</p>
              <div className="tnum mt-3 grid grid-cols-4 gap-2 text-center">
                {[
                  ["3 months", "₹20,000/mo"],
                  ["6 months", "₹10,000/mo"],
                  ["9 months", "₹6,667/mo"],
                  ["12 months", "₹5,000/mo"],
                ].map(([t, v]) => (
                  <div key={t} className="rounded-xl bg-tq-50 px-1 py-3">
                    <p className="text-[11px] font-semibold text-ink-500">{t}</p>
                    <p className="mt-1 text-xs font-black text-tq-800 sm:text-sm">{v}</p>
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-4 flex items-start gap-2 text-xs text-ink-300">
              <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-bp-400" />
              Also accept cash on delivery, UPI and cards. EMI subject to partner approval.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ----------------------------- Testimonials ----------------------------- */

export function Testimonials({ reviews }: { reviews: Testimonial[] }) {
  if (!reviews.length) return null;
  return (
    <section className="bg-tq-50 py-16 sm:py-20">
      <div className="container-x">
        <Reveal>
          <SectionHeading eyebrow="Dehradun loves us" title="Real reviews from real customers" sub="Every review below is from a verified purchase at Jeet Telecom." />
        </Reveal>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r, i) => (
            <Reveal key={r.id} delay={(i % 3) * 80}>
              <figure className="flex h-full flex-col rounded-2xl bg-white p-6 shadow-soft">
                <RatingStars rating={r.rating} size={14} />
                <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-ink-700">“{r.body}”</blockquote>
                <figcaption className="mt-5 flex items-center gap-3 border-t border-ink-100 pt-4">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-tq-400 to-tq-600 text-sm font-bold text-white">{r.author.slice(0, 1)}</span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-ink-900">{r.author}</p>
                    <p className="truncate text-xs text-ink-500">
                      {r.verified ? "Verified purchase" : "Customer"} · {r.productName}
                    </p>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ Store visit ------------------------------ */

export function StoreVisit({ settings }: { settings: SiteSettings }) {
  const mapsUrl = mapsLink(settings);
  return (
    <section id="visit" className="py-16 sm:py-20">
      <div className="container-x grid gap-10 lg:grid-cols-2 lg:items-center">
        <Reveal>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] shadow-lift">
            <SmartImage src={settings.storeImage || "/images/store.jpg"} alt="Jeet Telecom store interior in Dehradun" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
            <div className="absolute bottom-5 left-5 rounded-2xl bg-white/90 px-4 py-3 shadow-soft backdrop-blur">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-bp-600">Since {settings.establishedYear}</p>
              <p className="font-display text-lg font-semibold text-ink-900">{settings.headline}</p>
            </div>
          </div>
        </Reveal>
        <Reveal delay={100}>
          <SectionHeading align="left" eyebrow="Visit us" title={settings.headline} sub="Walk in for the best mobile at the best price, compare phones side by side and walk out with 0% finance, a free gift and a same-day delivery slot if you prefer home delivery." />
          <ul className="mt-8 space-y-4 text-sm">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-tq-600" />
              <div>
                <p className="font-bold text-ink-900">Store address</p>
                <p className="text-ink-600">{settings.address}</p>
              </div>
            </li>
            <li className="flex gap-3">
              <Phone className="mt-0.5 h-5 w-5 shrink-0 text-tq-600" />
              <div>
                <p className="font-bold text-ink-900">Call or WhatsApp</p>
                <a href={`tel:${settings.phone.replace(/\s+/g, "")}`} className="text-ink-600 hover:text-tq-700">{settings.phone}</a>
              </div>
            </li>
            <li className="flex gap-3">
              <Star className="mt-0.5 h-5 w-5 shrink-0 text-bp-500" />
              <div>
                <p className="font-bold text-ink-900">Timings</p>
                <p className="text-ink-600">{settings.hours}</p>
              </div>
            </li>
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="shine inline-flex items-center gap-2 rounded-full bg-tq-600 px-6 py-3 text-sm font-bold text-white hover:bg-tq-700">
              Get directions <ArrowRight className="h-4 w-4" />
            </a>
            <a href={`tel:${settings.phone.replace(/\s+/g, "")}`} className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white px-6 py-3 text-sm font-bold text-ink-800 hover:border-tq-400 hover:text-tq-700">
              <Phone className="h-4 w-4" /> Call the store
            </a>
          </div>
          <div className="mt-8">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-bp-600">
              <Truck className="h-4 w-4" /> {settings.sameDayText} — coverage
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {settings.deliveryAreas.map((a) => (
                <span key={a} className="rounded-full bg-bp-50 px-3 py-1 text-xs font-semibold text-bp-700 ring-1 ring-bp-200">{a}</span>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------ Instagram ------------------------------ */

export function InstagramStrip({ images, settings }: { images: string[]; settings: SiteSettings }) {
  const tiles = images.slice(0, 6);
  return (
    <section className="bg-ink-900 py-16 text-white">
      <div className="container-x">
        <Reveal>
          <div className="flex flex-col items-center gap-6 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-bp-400 to-bp-600">
              <InstagramIcon className="h-7 w-7" />
            </span>
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">
              Follow <span className="italic text-bp-300">{settings.instagramHandle}</span>
            </h2>
            <p className="max-w-xl text-ink-300">New arrivals, flash deals and customer giveaways every week — DM us on Instagram for today&apos;s best price.</p>
            <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="shine inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-bp-500 to-bp-700 px-7 py-3 text-sm font-bold text-white">
              <InstagramIcon className="h-4 w-4" /> Follow on Instagram
            </a>
          </div>
        </Reveal>
        <div className="mt-12 grid grid-cols-3 gap-2 sm:gap-4">
          {tiles.map((src, i) => (
            <a key={i} href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="group relative aspect-square overflow-hidden rounded-2xl bg-ink-800">
              <SmartImage src={src} alt={`Jeet Telecom on Instagram ${i + 1}`} fill sizes="(max-width: 640px) 33vw, 16vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 grid place-items-center bg-bp-600/0 transition group-hover:bg-ink-900/50">
                <InstagramIcon className="h-6 w-6 scale-50 text-white opacity-0 transition group-hover:scale-100 group-hover:opacity-100" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export const CATEGORY_COUNTS_HELPER = CATEGORY_LABELS;
