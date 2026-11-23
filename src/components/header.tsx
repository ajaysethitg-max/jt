"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { MapPin, Menu, Phone, Search, ShoppingBag, X, Zap } from "lucide-react";
import { InstagramIcon } from "./icons";
import { useCart } from "@/lib/cart-context";
import { useCatalog } from "@/lib/catalog-context";
import { cn } from "@/lib/format";
import type { SiteSettings } from "@/lib/types";
import { CartoonStrip } from "./cartoon-strip";
import { BrandWordmark, LogoMark } from "./logo";
import { SmartImage } from "./smart-image";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/products?c=mobiles", label: "Mobiles" },
  { href: "/products?c=accessories", label: "Accessories" },
  { href: "/products?deals=1", label: "Deals" },
  { href: "/#gifts", label: "Free Gifts" },
  { href: "/#visit", label: "Visit Us" },
];

export function Header() {
  const { settings } = useCatalog();
  const { count, openCart } = useCart();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [announce, setAnnounce] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const messages = settings.announcements.length ? settings.announcements : ["Welcome to Jeet Telecom"];

  useEffect(() => {
    const id = setInterval(() => setAnnounce((a) => (a + 1) % messages.length), 4200);
    return () => clearInterval(id);
  }, [messages.length]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  const submitSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/products?q=${encodeURIComponent(q)}` : "/products");
    setSearchOpen(false);
    setQuery("");
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href.startsWith("/products")) return pathname === "/products";
    return false;
  };

  return (
    <header className="sticky top-0 z-40">
      {/* Announcement bar */}
      <div className="relative overflow-hidden bg-tq-700 text-white">
        <div className="container-x flex h-9 items-center justify-center gap-2 text-[12px] font-semibold sm:text-[13px]">
          <Zap className="h-3.5 w-3.5 shrink-0 text-bp-300" fill="currentColor" />
          <span key={announce} className="animate-fade-up truncate text-center">
            {messages[announce] ?? messages[0]}
          </span>
        </div>
      </div>

      {/* Main bar */}
      <div className="border-b border-ink-100 bg-white/90 backdrop-blur-md">
        <div className="container-x flex h-16 items-center gap-3 md:h-[78px] md:gap-6">
          <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label={`${settings.siteName} — home`}>
            {settings.logoUrl ? (
              <SmartImage src={settings.logoUrl} alt={settings.siteName} width={40} height={40} className="h-10 w-10 rounded-xl object-cover" />
            ) : (
              <LogoMark className="h-10 w-10" />
            )}
            <BrandWordmark siteName={settings.siteName} sub="Best Mobile · Best Price" />
          </Link>

          {/* Cartoon marquee across the full bar */}
          <div className="hidden flex-1 self-stretch lg:block">
            <CartoonStrip size={46} className="h-full" />
          </div>

          <nav className="hidden items-center gap-0.5 md:flex" aria-label="Main navigation">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-3 py-2 text-sm font-semibold text-ink-600 transition hover:bg-tq-50 hover:text-tq-700",
                  isActive(item.href) && "bg-tq-50 text-tq-700",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1 md:ml-0">
            <form
              onSubmit={submitSearch}
              className="hidden items-center overflow-hidden rounded-full border border-ink-200 bg-ink-50 transition-colors focus-within:border-tq-400 xl:flex"
              role="search"
            >
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search phones, brands, accessories"
                className="w-48 bg-transparent px-4 py-2 text-sm text-ink-800 outline-none placeholder:text-ink-400"
                aria-label="Search products"
              />
              <button type="submit" className="grid h-9 w-9 shrink-0 place-items-center text-ink-500 hover:text-tq-700" aria-label="Search">
                <Search className="h-4 w-4" />
              </button>
            </form>
            <button
              type="button"
              onClick={() => setSearchOpen((s) => !s)}
              className="grid h-10 w-10 place-items-center rounded-full text-ink-700 hover:bg-tq-50 xl:hidden"
              aria-label="Search"
              aria-expanded={searchOpen}
            >
              <Search className="h-5 w-5" />
            </button>
            <a
              href={`tel:${settings.phone.replace(/\s+/g, "")}`}
              className="hidden h-10 items-center gap-2 rounded-full px-3 text-sm font-bold text-tq-700 hover:bg-tq-50 lg:flex"
              aria-label="Call the store"
            >
              <Phone className="h-4 w-4" /> {settings.phone}
            </a>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                openCart();
              }}
              className="relative grid h-11 w-11 place-items-center rounded-full bg-ink-900 text-white shadow-soft transition hover:bg-tq-600"
              aria-label={`Open cart, ${count} ${count === 1 ? "item" : "items"}`}
            >
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && (
                <span
                  key={count}
                  className="tnum absolute -right-1 -top-1 grid h-5 min-w-5 animate-pop place-items-center rounded-full bg-bp-500 px-1 text-[11px] font-bold text-white"
                >
                  {count}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="grid h-10 w-10 place-items-center rounded-full text-ink-700 hover:bg-tq-50 md:hidden"
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        {searchOpen && (
          <div className="container-x pb-3 xl:hidden">
            <form onSubmit={submitSearch} className="flex items-center overflow-hidden rounded-full border border-ink-200 bg-ink-50" role="search">
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search phones, brands, accessories"
                className="w-full bg-transparent px-4 py-2.5 text-sm text-ink-800 outline-none placeholder:text-ink-400"
                aria-label="Search products"
              />
              <button type="submit" className="grid h-10 w-10 shrink-0 place-items-center text-ink-500 hover:text-tq-700" aria-label="Search">
                <Search className="h-4 w-4" />
              </button>
            </form>
          </div>
        )}

        {/* Mobile cartoon marquee */}
        <div className="border-t border-dashed border-tq-100 bg-gradient-to-r from-tq-50 via-white to-bp-50 lg:hidden">
          <div className="flex h-14 items-center">
            <CartoonStrip size={32} className="w-full" />
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="max-h-[70vh] overflow-y-auto border-t border-ink-100 bg-white md:hidden">
            <nav className="container-x flex flex-col gap-1 py-3" aria-label="Mobile navigation">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "rounded-xl px-4 py-3 text-base font-semibold text-ink-800 hover:bg-tq-50 hover:text-tq-700",
                    isActive(item.href) && "bg-tq-50 text-tq-700",
                  )}
                >
                  {item.label}
                </Link>
              ))}
              <a
                href={`tel:${settings.phone.replace(/\s+/g, "")}`}
                className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-tq-600 px-4 py-3 text-base font-bold text-white"
              >
                <Phone className="h-4 w-4" /> Call {settings.phone}
              </a>
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl border border-ink-200 px-4 py-3 text-base font-bold text-ink-800"
              >
                <InstagramIcon className="h-4 w-4 text-bp-600" /> {settings.instagramHandle}
              </a>
              <div className="mt-2 flex items-center gap-2 rounded-xl bg-bp-50 px-4 py-3 text-sm font-semibold text-bp-700">
                <MapPin className="h-4 w-4 shrink-0" /> {settings.sameDayText}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
