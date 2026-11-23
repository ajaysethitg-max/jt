"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, Gift, Loader2, MapPin, Phone, Send, Truck } from "lucide-react";
import { useCatalog } from "@/lib/catalog-context";
import { formatInr } from "@/lib/format";
import { getLastOrder, hasSentOrder, markOrderSent, orderWhatsAppUrl, type PlacedOrder } from "@/lib/local-orders";
import { SmartImage } from "./smart-image";

/**
 * Order confirmation. Works in both hosting modes: the checkout saves the
 * placed order in the browser just before navigating here, so the page can be
 * prerendered for GitHub Pages and still show the full summary.
 */
export function OrderSuccess() {
  const { settings } = useCatalog();
  const [placed, setPlaced] = useState<PlacedOrder | null | undefined>(undefined);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const last = getLastOrder();
    setPlaced(last);
    if (last) setSent(hasSentOrder(last.order.orderNumber));
  }, []);

  if (placed === undefined) {
    return (
      <div className="container-x py-20">
        <div className="mx-auto max-w-3xl rounded-[2rem] bg-white p-10 text-center shadow-lift ring-1 ring-ink-100">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-tq-600" />
          <p className="mt-4 font-display text-2xl font-semibold text-ink-900">Confirming your order…</p>
          <p className="mt-2 text-sm text-ink-500">Best Mobile · Best Price · {settings.sameDayText}</p>
        </div>
      </div>
    );
  }

  const order = placed?.order;
  if (!placed || !order) {
    return (
      <div className="container-x py-24 text-center">
        <h1 className="font-display text-3xl font-semibold text-ink-900">Order not found</h1>
        <p className="mt-3 text-sm text-ink-500">We could not find that order on this device. Call us and we will help you right away.</p>
        <Link href="/products" className="mt-6 inline-block rounded-full bg-tq-600 px-6 py-3 text-sm font-bold text-white hover:bg-tq-700">
          Continue shopping
        </Link>
      </div>
    );
  }

  const local = placed.channel === "local";
  const sameDay = order.deliveryOption === "same-day";
  const phone = order.customer.phone;
  const prettyPhone = `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`;

  return (
    <div className="bg-gradient-to-b from-tq-50/70 to-paper">
      <div className="container-x py-12 sm:py-16">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-[2rem] bg-white p-6 text-center shadow-lift ring-1 ring-ink-100 sm:p-10">
            <span
              className={`mx-auto grid h-20 w-20 animate-pop place-items-center rounded-full text-white ${
                local && !sent ? "bg-gradient-to-br from-bp-400 to-bp-600" : "bg-gradient-to-br from-tq-400 to-tq-600"
              }`}
            >
              {local && !sent ? <Send className="h-9 w-9" strokeWidth={2.25} /> : <CheckCircle2 className="h-10 w-10" strokeWidth={2.5} />}
            </span>
            <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
              {local ? (sent ? "Order sent — thank you!" : "Your order is ready — one last step") : `Order confirmed — thank you, ${order.customer.name.split(" ")[0]}!`}
            </h1>
            <p className="mt-3 text-sm text-ink-500 sm:text-base">
              Order{" "}
              <span className="rounded-md bg-ink-50 px-2 py-0.5 font-mono text-sm font-bold text-ink-900">{order.orderNumber}</span>
            </p>

            {local && (
              <div className={sent ? "mt-8 rounded-2xl bg-tq-50 p-5 text-left ring-1 ring-tq-100" : "mt-8 rounded-2xl bg-bp-50 p-5 text-left ring-2 ring-bp-200"}>
                <p className={`flex items-center gap-2 text-sm font-black uppercase tracking-wider ${sent ? "text-tq-700" : "text-bp-700"}`}>
                  <Send className="h-4 w-4" /> {sent ? "Sent to Jeet Telecom on WhatsApp" : "Send this order to Jeet Telecom"}
                </p>
                {!sent ? (
                  <>
                    <p className="mt-1 text-sm font-semibold text-ink-700">
                      Tap the button below — WhatsApp opens with your order and address already typed. Just press send and we will call you to confirm.
                    </p>
                    <a
                      href={orderWhatsAppUrl(order, settings.whatsapp)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        markOrderSent(order.orderNumber);
                        setSent(true);
                      }}
                      className="shine mt-4 inline-flex items-center gap-2 rounded-full bg-bp-500 px-7 py-3.5 text-base font-bold text-white shadow-pink hover:bg-bp-600"
                    >
                      <Send className="h-4 w-4" /> Send order on WhatsApp
                    </a>
                  </>
                ) : (
                  <p className="mt-1 text-sm font-semibold text-ink-700">We have your order on WhatsApp. Expect a confirmation call on {prettyPhone} shortly.</p>
                )}
              </div>
            )}

            {(!local || sent) && (
              <div className={sameDay ? "mt-6 rounded-2xl bg-bp-50 p-5 text-left ring-1 ring-bp-200" : "mt-6 rounded-2xl bg-tq-50 p-5 text-left ring-1 ring-tq-100"}>
                <p className={`flex items-center gap-2 text-sm font-black uppercase tracking-wider ${sameDay ? "text-bp-700" : "text-tq-700"}`}>
                  <Truck className="h-4 w-4" /> {sameDay ? "Same day delivery in Dehradun" : "Standard delivery"}
                </p>
                <p className="mt-1 text-sm font-semibold text-ink-700">
                  {sameDay
                    ? "Ordered before 6 PM — your order reaches your door today before 9 PM."
                    : "Your order will arrive in 2–4 business days. Shipping is free."}
                </p>
                <p className="mt-3 flex items-start gap-2 text-sm text-ink-600">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" />
                  {order.address.line}
                  {order.address.landmark ? `, ${order.address.landmark}` : ""}, {order.address.city}, {order.address.state} — {order.address.pincode}
                </p>
                <p className="mt-2 flex items-center gap-2 text-sm text-ink-600">
                  <Phone className="h-4 w-4 shrink-0 text-ink-400" /> Confirmation call on {prettyPhone} · Payment: <strong>{order.paymentMethod}</strong>
                </p>
                <p className="mt-2 flex items-start gap-2 text-sm text-ink-600">
                  <Gift className="mt-0.5 h-4 w-4 shrink-0 text-bp-500" /> Your free gift is packed with this order — choose from the gift counter if you visit the store.
                </p>
              </div>
            )}

            <div className="mt-8 text-left">
              <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-ink-500">Items in this order</h2>
              <ul className="mt-3 divide-y divide-ink-100 rounded-2xl ring-1 ring-ink-100">
                {order.items.map((i) => (
                  <li key={i.sku} className="flex items-center gap-3 p-3">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-ink-50">
                      <SmartImage src={i.image} alt={i.name} fill sizes="56px" className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink-900">{i.name}</p>
                      <p className="text-xs text-ink-500">Qty {i.qty}</p>
                    </div>
                    <p className="tnum text-sm font-bold text-ink-900">{formatInr(i.price * i.qty)}</p>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex items-center justify-between rounded-2xl bg-ink-900 px-5 py-4 text-white">
                <span className="text-sm font-semibold">Total payable on delivery</span>
                <span className="tnum text-xl font-bold">{formatInr(order.total)}</span>
              </div>
              {order.discount > 0 && <p className="mt-2 text-right text-xs font-semibold text-bp-700">You saved {formatInr(order.discount)} on MRP</p>}
            </div>

            {!local && (
              <a
                href={orderWhatsAppUrl(order, settings.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-full border border-ink-200 px-6 py-3 text-sm font-bold text-ink-800 hover:border-bp-400 hover:text-bp-700"
              >
                <Send className="h-4 w-4" /> Also send on WhatsApp
              </a>
            )}

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/products" className="shine rounded-full bg-tq-600 px-7 py-3 text-sm font-bold text-white hover:bg-tq-700">
                Continue shopping
              </Link>
              <a href="/" className="inline-flex items-center gap-2 rounded-full border border-ink-200 px-7 py-3 text-sm font-bold text-ink-800 hover:border-tq-400 hover:text-tq-700">
                Back to home <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
