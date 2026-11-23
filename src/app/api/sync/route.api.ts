import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getDemoBundle } from "@/data/demo-catalog";
import { bundleToCsv, getSyncState, importSheet, reloadDemoData, runSync } from "@/lib/sheet-sync";
import type { SheetName, SyncStateInfo } from "@/lib/types";

export const dynamic = "force-dynamic";

function isSheet(value: string | null | undefined): value is SheetName {
  return value === "products" || value === "deals" || value === "reviews" || value === "settings";
}

/** GET /api/sync → status · GET /api/sync/template?sheet=products → CSV template */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sheet = searchParams.get("sheet");
  if (isSheet(sheet)) {
    const csv = bundleToCsv(getDemoBundle(), sheet);
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="jeet-telecom-${sheet}.csv"`,
      },
    });
  }
  return NextResponse.json({ ok: true, state: await getSyncState() });
}

/** POST /api/sync { action: "sync" | "seed" | "import", sheet?, csv? } */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { action?: string; sheet?: string; csv?: string } | null;
  const action = body?.action ?? "sync";
  let state: SyncStateInfo;
  try {
    if (action === "seed") {
      state = await reloadDemoData();
    } else if (action === "import") {
      if (!isSheet(body?.sheet)) return NextResponse.json({ ok: false, error: "Unknown sheet" }, { status: 400 });
      state = await importSheet(body.sheet, String(body.csv ?? ""));
    } else {
      state = await runSync();
    }
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 400 });
  }
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true, state });
}
