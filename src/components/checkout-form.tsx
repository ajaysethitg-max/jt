"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { Banknote, Check, CreditCard, Gift, Loader2, Lock, MapPin, Percent, ShoppingBag, Smartphone, Truck, User } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { makeOrderNumber, saveOrder } from "@/lib/local-orders";
import { STATIC_BUILD } from "@/lib/runtime";
import { cn, formatInr } from "@/lib/format";
import type { SiteSettings } from "@/lib/types";
import { SmartImage } from "./smart-image";

type Payment = { id: string; label: string; note: string; icon: typeof Banknote };

function Field({ label, error, hint, children, className }: { label: string; error?: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="text-xs font-bold uppercase tracking-wider text-ink-600">{label}</span>
      {children}
      {error ? <p className="mt-1 text-xs font-semibold text-bp-700">{error}</p> : hint ? <p className="mt-1 text-xs text-ink-400">{hint}</p> : null}
    </label>
  );
}

function Card({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-soft ring-1 ring-ink-100 sm:p-6">
      <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-ink-900">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-tq-50 text-tq-700">{icon}</span>
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function CheckoutForm({ settings }: { settings: SiteSettings }) {
  const router = useRouter();
  const { items, subtotal, savings, count, clear, hydrated } = useCart();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    line: "",
    landmark: "",
    city: "Dehradun",
    state: "Uttarakhand",
    pincode: "",
    notes: "",
  });
  const [delivery, setDelivery] = useState<"same-day" | "standard">("same-day");
  const [payment, setPayment] = useState("cod");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [placing, setPlacing] = useState(false);

  const sameDayOk = /^24[89]\d{3}$/.test(form.pincode);

  useEffect(() => {
    if (form.pincode.length !== 6) return;
    setDelivery(sameDayOk ? "same-day" : "standard");
  }, [form.pincode, sameDayOk]);

  const payments: Payment[] = [
    { id: "cod", label: "Cash on Delivery", note: "Pay in cash when your order arrives", icon: Banknote },
    { id: "upi", label: "UPI on delivery", note: "Scan the QR at your doorstep", icon: Smartphone },
    { id: "card", label: "Card on delivery", note: "Visa · Mastercard · RuPay", icon: CreditCard },
    ...settings.financePartners.map((p) => ({ id: `emi:${p}`, label: `0% EMI — ${p}`, note: "No cost EMI · bring PAN and Aadhaar", icon: Percent })),
  ];

  const set =
    (key: keyof typeof form) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 3) e.name = "Please enter your full name";
    if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\D/g, ""))) e.phone = "Enter a valid 10-digit mobile number";
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email or leave blank";
    if (form.line.trim().length < 8) e.line = "Enter your full address";
    if (!/^\d{6}$/.test(form.pincode)) e.pincode = "Enter a 6-digit pincode";
    if (!form.city.trim()) e.city = "City is required";
    if (!form.state.trim()) e.state = "State is required";
    if (delivery === "same-day" && !sameDayOk) e.delivery = "Same day delivery is only available for Dehradun pincodes (248xxx / 249xxx)";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError("");
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setPlacing(true);

    const paymentMethod = payments.find((p) => p.id === payment)?.label ?? payment;
    const snapshot = {
      customer: { name: form.name.trim(), phone: form.phone.replace(/\D/g, ""), email: form.email.trim() },
      address: {
        line: form.line.trim(),
        landmark: form.landmark.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode,
      },
      paymentMethod,
      deliveryOption: delivery,
      notes: form.notes.trim(),
    };

    if (STATIC_BUILD) {
      // GitHub Pages has no server: keep the order here and hand it to the
      // shop on WhatsApp from the confirmation page.
      saveOrder({
        channel: "local",
        order: {
          id: 0,
          orderNumber: makeOrderNumber(),
          ...snapshot,
          items,
          subtotal,
          discount: savings,
          delivery: 0,
          total: subtotal,
          status: "awaiting confirmation",
          createdAt: new Date().toISOString(),
        },
      });
      clear();
      router.push("/checkout/success");
      return;
    }

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...snapshot, items: items.map((i) => ({ sku: i.sku, qty: i.qty })) }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; orderNumber?: string; total?: number };
      if (!res.ok || !data.ok || !data.orderNumber) throw new Error(data.error ?? "Could not place your order");
      saveOrder({
        channel: "server",
        order: {
          id: 0,
          orderNumber: data.orderNumber,
          ...snapshot,
          items,
          subtotal,
          discount: savings,
          delivery: 0,
          total: data.total ?? subtotal,
          status: "confirmed",
          createdAt: new Date().toISOString(),
        },
      });
      clear();
      router.push("/checkout/success");
    } catch (err) {
      setServerError((err as Error).message);
      setPlacing(false);
    }
  };

  const inputCls = (err?: string) =>
    cn("mt-1.5 w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-ink-800 outline-none transition focus:border-tq-500", err ? "border-bp-500" : "border-ink-200");

  const steps = ["Cart", "Address & payment", "Confirmed"];

  return (
    <div className="bg-gradient-to-b from-tq-50/60 to-paper">
      <div className="container-x py-8 sm:py-12">
        <div className="mx-auto max-w-6xl">
          <ol className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider">
            {steps.map((s, i) => (
              <li key={s} className="flex items-center gap-2">
                <span className={cn("grid h-7 w-7 place-items-center rounded-full", i < 1 ? "bg-tq-500 text-white" : i === 1 ? "bg-ink-900 text-white" : "bg-ink-100 text-ink-400")}>{i < 1 ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}</span>
                <span className={cn(i === 1 ? "text-ink-900" : "text-ink-400")}>{s}</span>
                {i < steps.length - 1 && <span className="mx-1 h-px w-6 bg-ink-200" />}
              </li>
            ))}
          </ol>
          <h1 className="mt-6 text-center font-display text-4xl font-semibold tracking-tight text-ink-900 sm:text-5xl">Checkout</h1>
          <p className="mt-2 text-center text-sm text-ink-500">Best Mobile · Best Price · {settings.sameDayText}</p>

          {!hydrated ? (
            <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_22rem]">
              <div className="h-96 animate-pulse rounded-2xl bg-ink-100" />
              <div className="h-96 animate-pulse rounded-2xl bg-ink-100" />
            </div>
          ) : items.length === 0 ? (
            <div className="mt-10 flex flex-col items-center rounded-[2rem] bg-white py-20 text-center shadow-soft">
              <span className="grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-tq-100 to-bp-100">
                <ShoppingBag className="h-9 w-9 text-bp-500" />
              </span>
              <h2 className="mt-5 font-display text-2xl font-semibold text-ink-900">Your cart is empty</h2>
              <p className="mt-2 max-w-sm text-sm text-ink-500">Add a mobile or accessory first — every order comes with a free gift.</p>
              <Link href="/products" className="shine mt-6 rounded-full bg-tq-600 px-7 py-3 text-sm font-bold text-white hover:bg-tq-700">
                Browse products
              </Link>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="mt-10 grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-start">
              <div className="order-2 space-y-5 lg:order-1">
                <Card title="Contact details" icon={<User className="h-4 w-4" />}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Full name" error={errors.name}>
                      <input value={form.name} onChange={set("name")} placeholder="Rahul Sharma" autoComplete="name" className={inputCls(errors.name)} />
                    </Field>
                    <Field label="Mobile number" error={errors.phone} hint="We will WhatsApp the order updates here">
                      <input value={form.phone} onChange={set("phone")} inputMode="numeric" placeholder="98970 12345" autoComplete="tel" className={inputCls(errors.phone)} />
                    </Field>
                  </div>
                  <Field label="Email (optional)" error={errors.email} className="mt-4">
                    <input value={form.email} onChange={set("email")} type="email" placeholder="you@example.com" autoComplete="email" className={inputCls(errors.email)} />
                  </Field>
                </Card>

                <Card title="Delivery address" icon={<MapPin className="h-4 w-4" />}>
                  <Field label="Address" error={errors.line}>
                    <textarea value={form.line} onChange={set("line")} rows={2} placeholder="House / flat, street, area" autoComplete="street-address" className={cn(inputCls(errors.line), "resize-none")} />
                  </Field>
                  <Field label="Landmark (optional)" className="mt-4">
                    <input value={form.landmark} onChange={set("landmark")} placeholder="Near Clock Tower" className={inputCls()} />
                  </Field>
                  <div className="mt-4 grid gap-4 sm:grid-cols-3">
                    <Field label="City" error={errors.city}>
                      <input value={form.city} onChange={set("city")} className={inputCls(errors.city)} autoComplete="address-level2" />
                    </Field>
                    <Field label="State" error={errors.state}>
                      <input value={form.state} onChange={set("state")} className={inputCls(errors.state)} autoComplete="address-level1" />
                    </Field>
                    <Field label="Pincode" error={errors.pincode}>
                      <input value={form.pincode} onChange={(e) => setForm((f) => ({ ...f, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) }))} inputMode="numeric" placeholder="248001" className={inputCls(errors.pincode)} autoComplete="postal-code" />
                    </Field>
                  </div>
                </Card>

                <Card title="Delivery option" icon={<Truck className="h-4 w-4" />}>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      { id: "same-day" as const, title: settings.sameDayText, note: "Order before 6 PM · Free", ok: sameDayOk },
                      { id: "standard" as const, title: "Standard delivery", note: "2–4 days · Free", ok: true },
                    ].map((o) => (
                      <button
                        key={o.id}
                        type="button"
                        disabled={!o.ok}
                        onClick={() => setDelivery(o.id)}
                        className={cn(
                          "rounded-2xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-50",
                          delivery === o.id ? "border-bp-500 bg-bp-50 ring-2 ring-bp-200" : "border-ink-200 hover:border-tq-300",
                        )}
                        aria-pressed={delivery === o.id}
                      >
                        <p className="flex items-center gap-2 text-sm font-bold text-ink-900">
                          <Truck className={cn("h-4 w-4", o.id === "same-day" ? "text-bp-500" : "text-tq-600")} /> {o.title}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-ink-500">{o.ok ? o.note : "Enter a Dehradun pincode above to unlock"}</p>
                      </button>
                    ))}
                  </div>
                  {errors.delivery && <p className="mt-2 text-xs font-semibold text-bp-700">{errors.delivery}</p>}
                </Card>

                <Card title="Payment" icon={<CreditCard className="h-4 w-4" />}>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {payments.map((p) => (
                      <li key={p.id}>
                        <button
                          type="button"
                          onClick={() => setPayment(p.id)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition",
                            payment === p.id ? "border-tq-500 bg-tq-50" : "border-ink-200 hover:border-tq-300",
                          )}
                          aria-pressed={payment === p.id}
                        >
                          <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-lg", payment === p.id ? "bg-tq-500 text-white" : "bg-ink-50 text-ink-600")}>
                            <p.icon className="h-4 w-4" />
                          </span>
                          <span className="min-w-0">
                            <span className="block text-sm font-bold text-ink-900">{p.label}</span>
                            <span className="block truncate text-xs text-ink-500">{p.note}</span>
                          </span>
                          {payment === p.id && <Check className="ml-auto h-4 w-4 shrink-0 text-tq-600" strokeWidth={3} />}
                        </button>
                      </li>
                    ))}
                  </ul>
                </Card>

                <Card title="Order notes (optional)" icon={<ShoppingBag className="h-4 w-4" />}>
                  <textarea value={form.notes} onChange={set("notes")} rows={2} placeholder="Preferred delivery time, gift choice, anything we should know" className={cn(inputCls(), "resize-none")} />
                </Card>

                {serverError && <p className="rounded-xl bg-bp-50 px-4 py-3 text-sm font-semibold text-bp-700">{serverError}</p>}

                <button type="submit" disabled={placing} className="shine inline-flex w-full items-center justify-center gap-2 rounded-full bg-tq-600 py-4 text-base font-bold text-white shadow-tq transition hover:bg-tq-700 disabled:opacity-60">
                  {placing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Placing your order…
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" /> Place order · {formatInr(subtotal)}
                    </>
                  )}
                </button>
              </div>

              <aside className="order-1 lg:order-2 lg:sticky lg:top-40">
                <div className="rounded-2xl bg-white p-5 shadow-soft ring-1 ring-ink-100">
                  <h2 className="flex items-center justify-between font-display text-xl font-semibold text-ink-900">
                    Order summary <span className="text-sm font-semibold text-ink-500">{count} items</span>
                  </h2>
                  <ul className="mt-4 max-h-64 space-y-3 overflow-y-auto pr-1">
                    {items.map((i) => (
                      <li key={i.sku} className="flex gap-3">
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-ink-50">
                          <SmartImage src={i.image} alt={i.name} fill sizes="56px" className="object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-xs font-semibold text-ink-900">{i.name}</p>
                          <p className="text-xs text-ink-500">Qty {i.qty}</p>
                        </div>
                        <p className="tnum text-sm font-bold text-ink-900">{formatInr(i.price * i.qty)}</p>
                      </li>
                    ))}
                  </ul>
                  <dl className="mt-4 space-y-1.5 border-t border-ink-100 pt-4 text-sm">
                    <div className="flex justify-between text-ink-500">
                      <dt>MRP total</dt>
                      <dd className="tnum line-through">{formatInr(subtotal + savings)}</dd>
                    </div>
                    <div className="flex justify-between font-semibold text-bp-600">
                      <dt>You save</dt>
                      <dd className="tnum">− {formatInr(savings)}</dd>
                    </div>
                    <div className="flex justify-between text-ink-500">
                      <dt>Delivery</dt>
                      <dd className="font-bold text-tq-700">Free{delivery === "same-day" ? " · Same day" : ""}</dd>
                    </div>
                    <div className="flex justify-between border-t border-ink-100 pt-2 text-base font-bold text-ink-900">
                      <dt>Total</dt>
                      <dd className="tnum">{formatInr(subtotal)}</dd>
                    </div>
                  </dl>
                  <div className="mt-4 rounded-xl bg-bp-50 p-3 text-xs font-semibold text-bp-700">
                    <p className="flex items-center gap-1.5 font-bold">
                      <Gift className="h-4 w-4" /> Free gifts included
                    </p>
                    <p className="mt-1">{settings.freeGifts.join(" · ")}</p>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-ink-400">Genuine products with GST bill and brand warranty. 0% finance available at delivery with PAN and Aadhaar.</p>
                </div>
              </aside>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
