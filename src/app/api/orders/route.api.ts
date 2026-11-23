import { NextResponse } from "next/server";
import { createOrder } from "@/lib/orders";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body: any = await req.json();
    const customer = body?.customer ?? {};
    const address = body?.address ?? {};
    const name = String(customer.name ?? "").trim();
    const phone = String(customer.phone ?? "").replace(/\D/g, "");
    const email = String(customer.email ?? "").trim();
    const line = String(address.line ?? "").trim();
    const landmark = String(address.landmark ?? "").trim();
    const city = String(address.city ?? "").trim() || "Dehradun";
    const stateName = String(address.state ?? "").trim() || "Uttarakhand";
    const pincode = String(address.pincode ?? "").trim();

    if (name.length < 3) throw new Error("Please enter your full name");
    if (!/^[6-9]\d{9}$/.test(phone)) throw new Error("Please enter a valid 10-digit mobile number");
    if (line.length < 8) throw new Error("Please enter your delivery address");
    if (!/^\d{6}$/.test(pincode)) throw new Error("Please enter a valid 6-digit pincode");

    const items: { sku: string; qty: number }[] = Array.isArray(body?.items) ? body.items : [];
    if (!items.length) throw new Error("Your cart is empty");
    const deliveryOption = body?.deliveryOption === "same-day" ? "same-day" : "standard";
    if (deliveryOption === "same-day" && !/^24[89]\d{3}$/.test(pincode)) {
      throw new Error("Same day delivery is only available for Dehradun pincodes");
    }

    const order = await createOrder({
      customer: { name, phone, email },
      address: { line, landmark, city, state: stateName, pincode },
      items,
      deliveryOption,
      paymentMethod: String(body?.paymentMethod ?? "Cash on Delivery"),
      notes: String(body?.notes ?? ""),
    });
    return NextResponse.json({ ok: true, orderNumber: order.orderNumber, total: order.total });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 400 });
  }
}
