"use client";
import { useEffect, useState } from "react";
import { useCatalog } from "@/lib/catalog-context";
import Link from "next/link";
import { CreditCard, Gift, MapPin, Percent, Phone, ShieldCheck, Truck } from "lucide-react";
import { InstagramIcon } from "./icons";
import { inlineTagline } from "@/lib/format";
import { mapsLink } from "@/lib/seo";
import type { SiteSettings } from "@/lib/types";
import { SmartImage } from "./smart-image";

export function Footer() {
  const { settings } = useCatalog();
  const [year, setYear] = useState(2026);
  useEffect(() => setYear(new Date().getFullYear()), []);
  const mapsUrl = mapsLink(settings);
  const waUrl = `https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`;

  return (
    <footer className="mt-20 border-t border-ink-100 bg-ink-900 text-ink-200">
      <div className="container-x grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <div className="flex items-center gap-3">
            {settings.logoUrl ? (
              <SmartImage src={settings.logoUrl} alt={settings.siteName} width={44} height={44} className="h-11 w-11 rounded-xl object-cover" />
            ) : (
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-tq-500 font-display text-xl font-bold text-white">{settings.siteName.charAt(0)}</div>
            )}
            <div>
              <p className="font-display text-2xl font-semibold text-white">{settings.siteName}</p>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-tq-300">{settings.tagline}</p>
            </div>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-300">{settings.headline}. Genuine phones, accessories and wearables with GST bill, brand warranty and the best deal of the city.</p>
          <a
            href={settings.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-bp-500 to-bp-700 px-4 py-2 text-sm font-bold text-white transition hover:opacity-90"
          >
            <InstagramIcon className="h-4 w-4" /> Follow {settings.instagramHandle}
          </a>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-tq-300">Shop</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {[
              ["All products", "/products"],
              ["Mobiles", "/products?c=mobiles"],
              ["Audio", "/products?c=audio"],
              ["Wearables", "/products?c=wearables"],
              ["Accessories", "/products?c=accessories"],
              ["Deals of the day", "/products?deals=1"],
            ].map(([label, href]) => (
              <li key={href}>
                <Link href={href} className="text-ink-200 transition hover:text-tq-300">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-tq-300">Why Jeet Telecom</p>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex gap-2.5">
              <Truck className="mt-0.5 h-4 w-4 shrink-0 text-bp-400" /> {settings.sameDayText}
            </li>
            <li className="flex gap-2.5">
              <Percent className="mt-0.5 h-4 w-4 shrink-0 text-bp-400" /> 0% finance on {settings.financePartners.join(", ")}
            </li>
            <li className="flex gap-2.5">
              <Gift className="mt-0.5 h-4 w-4 shrink-0 text-bp-400" /> Free gifts with every purchase
            </li>
            <li className="flex gap-2.5">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-bp-400" /> 100% genuine with brand warranty
            </li>
            <li className="flex gap-2.5">
              <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-bp-400" /> Cash on delivery, UPI and EMI
            </li>
          </ul>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-tq-300">Brands we deal in</p>
          <p className="mt-2 text-sm text-ink-200">{settings.brands.join(" · ")}</p>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-tq-300">Visit the store</p>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-tq-400" /> {settings.address}
            </li>
            <li className="flex gap-2.5">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-tq-400" />
              <a href={`tel:${settings.phone.replace(/\s+/g, "")}`} className="hover:text-tq-300">
                {settings.phone}
              </a>
            </li>
            <li className="text-ink-300">{settings.hours}</li>
          </ul>
          <div className="mt-5 flex flex-wrap gap-2">
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-ink-700 px-4 py-2 text-xs font-bold text-white hover:border-tq-500"
            >
              Get directions
            </a>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-ink-700 px-4 py-2 text-xs font-bold text-white hover:border-tq-500"
            >
              WhatsApp us
            </a>
            <Link href="/admin/sync" className="rounded-full px-4 py-2 text-xs font-bold text-ink-400 hover:text-white">
              Store admin
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-ink-800">
        <div className="container-x flex flex-col gap-2 py-5 text-xs text-ink-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} {settings.siteName}, Dehradun. All rights reserved.</p>
          <p className="font-semibold text-tq-300">{inlineTagline(settings.tagline)}</p>
        </div>
      </div>
    </footer>
  );
}
