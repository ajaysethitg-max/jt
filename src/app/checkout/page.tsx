import type { Metadata } from "next";
import { getSettingsSafe } from "@/lib/catalog";
import { CheckoutForm } from "@/components/checkout-form";


export const metadata: Metadata = {
  title: "Checkout",
  description: "Secure checkout with same day delivery in Dehradun, cash on delivery, UPI and 0% EMI.",
};

export default async function CheckoutPage() {
  const settings = await getSettingsSafe();
  return <CheckoutForm settings={settings} />;
}
