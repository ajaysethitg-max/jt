import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { products, reviews } from "@/db/schema";
import { refreshProductRatings } from "@/lib/sheet-sync";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body: any = await req.json();
    const productId = Number(body?.productId);
    const author = String(body?.author ?? "").trim();
    const rating = Math.round(Number(body?.rating));
    const title = String(body?.title ?? "").trim();
    const text = String(body?.body ?? "").trim();

    if (!Number.isInteger(productId)) throw new Error("Invalid product");
    if (author.length < 2) throw new Error("Please enter your name");
    if (rating < 1 || rating > 5) throw new Error("Rating must be between 1 and 5");
    if (title.length < 3) throw new Error("Please add a short title");
    if (text.length < 10) throw new Error("Please write a few words about the product");

    const rows = await db.select({ id: products.id, sku: products.sku }).from(products).where(eq(products.id, productId)).limit(1);
    if (!rows[0]) throw new Error("Product not found");

    const inserted = await db
      .insert(reviews)
      .values({ productId, sku: rows[0].sku, author, rating, title, body: text, verified: false, source: "store" })
      .returning();
    await refreshProductRatings();
    return NextResponse.json({ ok: true, review: inserted[0] });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 400 });
  }
}
