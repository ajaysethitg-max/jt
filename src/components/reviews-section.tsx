"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { CheckCircle2, Loader2, Star } from "lucide-react";
import { cn, formatDate } from "@/lib/format";
import { addLocalReview } from "@/lib/local-orders";
import { STATIC_BUILD } from "@/lib/runtime";
import type { Product, Review } from "@/lib/types";
import { RatingStars } from "./rating-stars";

export function ReviewsSection({
  product,
  reviews,
  onLocalReview,
}: {
  product: Product;
  reviews: Review[];
  onLocalReview?: (review: Review) => void;
}) {
  const router = useRouter();
  const [showAll, setShowAll] = useState(false);
  const [rating, setRating] = useState(5);
  const [author, setAuthor] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : product.rating;
  const bars = [5, 4, 3, 2, 1].map((n) => ({ n, count: reviews.filter((r) => r.rating === n).length }));
  const visible = showAll ? reviews : reviews.slice(0, 5);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    // Static hosting has no API: keep the review in this browser.
    if (STATIC_BUILD) {
      const review: Review = {
        id: Date.now(),
        author: author.trim(),
        rating,
        title: title.trim(),
        body: body.trim(),
        verified: false,
        createdAt: new Date().toISOString(),
      };
      addLocalReview(product.sku, review);
      onLocalReview?.(review);
      setDone(true);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, author: author.trim(), rating, title: title.trim(), body: body.trim() }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error ?? "Could not submit your review");
      setDone(true);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="reviews" className="mt-16 scroll-mt-40">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-bp-600">Customer reviews</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">What Dehradun says</h2>
        </div>
        <a href="#write-review" className="text-sm font-bold text-tq-700 underline-offset-4 hover:underline">
          Write a review
        </a>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[20rem_1fr]">
        <div className="lg:sticky lg:top-40 lg:self-start">
          <div className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-ink-100">
            <div className="flex items-end gap-3">
              <span className="tnum font-display text-6xl font-semibold leading-none text-ink-900">{avg.toFixed(1)}</span>
              <div className="pb-1">
                <RatingStars rating={avg} size={16} />
                <p className="mt-1 text-xs font-semibold text-ink-500">
                  Based on {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
                </p>
              </div>
            </div>
            <ul className="mt-5 space-y-2">
              {bars.map(({ n, count }) => (
                <li key={n} className="flex items-center gap-3 text-xs font-semibold text-ink-600">
                  <span className="tnum w-8">{n} ★</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink-100">
                    <div
                      className="h-full rounded-full bg-bp-500 transition-all"
                      style={{ width: `${reviews.length ? (count / reviews.length) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="tnum w-6 text-right text-ink-400">{count}</span>
                </li>
              ))}
            </ul>
          </div>

          <form id="write-review" onSubmit={submit} className="mt-5 rounded-2xl bg-white p-6 shadow-soft ring-1 ring-ink-100">
            <h3 className="font-display text-xl font-semibold text-ink-900">Write a review</h3>
            {done ? (
              <div className="mt-4 flex items-start gap-3 rounded-xl bg-tq-50 p-4 text-sm font-semibold text-tq-800">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" /> Thank you! Your review has been published.
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-ink-500">Your rating</p>
                  <div className="mt-1 flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} star${n > 1 ? "s" : ""}`} className="p-0.5">
                        <Star
                          size={22}
                          strokeWidth={0}
                          className={cn("transition", n <= rating ? "fill-bp-500 text-bp-500" : "fill-ink-200 text-ink-200 hover:fill-bp-300")}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  required
                  minLength={2}
                  maxLength={60}
                  placeholder="Your name"
                  className="w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm outline-none focus:border-tq-500"
                />
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  minLength={3}
                  maxLength={100}
                  placeholder="Review title"
                  className="w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm outline-none focus:border-tq-500"
                />
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  required
                  minLength={10}
                  maxLength={600}
                  rows={3}
                  placeholder="What did you like about it?"
                  className="w-full resize-none rounded-xl border border-ink-200 px-4 py-2.5 text-sm outline-none focus:border-tq-500"
                />
                {error && <p className="text-xs font-semibold text-bp-700">{error}</p>}
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink-900 py-2.5 text-sm font-bold text-white hover:bg-tq-700 disabled:opacity-60"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />} Submit review
                </button>
              </div>
            )}
          </form>
        </div>

        <div>
          {reviews.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-ink-200 bg-white p-10 text-center">
              <p className="font-display text-xl font-semibold text-ink-900">No reviews yet</p>
              <p className="mt-2 text-sm text-ink-500">Be the first in Dehradun to review this product.</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {visible.map((r) => (
                <li key={`${r.id}-${r.createdAt}`} className="rounded-2xl bg-white p-5 shadow-soft ring-1 ring-ink-100">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-tq-400 to-tq-600 text-sm font-bold text-white">
                        {r.author.slice(0, 1)}
                      </span>
                      <div>
                        <p className="text-sm font-bold text-ink-900">{r.author}</p>
                        <p className="text-xs font-semibold text-tq-700">{r.verified ? "Verified purchase" : "Customer"}</p>
                      </div>
                    </div>
                    <span className="text-xs text-ink-400">{formatDate(r.createdAt)}</span>
                  </div>
                  <div className="mt-3">
                    <RatingStars rating={r.rating} size={13} />
                  </div>
                  <p className="mt-2 font-semibold text-ink-900">{r.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-600">{r.body}</p>
                </li>
              ))}
            </ul>
          )}
          {reviews.length > 5 && (
            <button
              type="button"
              onClick={() => setShowAll((s) => !s)}
              className="mt-4 w-full rounded-full border border-ink-200 bg-white py-2.5 text-sm font-bold text-ink-800 hover:border-tq-400"
            >
              {showAll ? "Show fewer reviews" : `Show all ${reviews.length} reviews`}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
