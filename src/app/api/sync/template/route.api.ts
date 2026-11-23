import { getDemoBundle } from "@/data/demo-catalog";
import { bundleToCsv } from "@/lib/sheet-sync";
import type { SheetName } from "@/lib/types";

export const dynamic = "force-dynamic";

function isSheet(value: string | null): value is SheetName {
  return value === "products" || value === "deals" || value === "reviews" || value === "settings";
}

/** GET /api/sync/template?sheet=products → CSV template matching the Google Sheet tabs. */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sheet = searchParams.get("sheet");
  if (!isSheet(sheet)) {
    return new Response("Unknown sheet. Use ?sheet=products|deals|reviews|settings", { status: 400 });
  }
  const csv = bundleToCsv(getDemoBundle(), sheet);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="jeet-telecom-${sheet}.csv"`,
    },
  });
}
