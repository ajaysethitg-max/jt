import type { Metadata } from "next";
import { STATIC_BUILD } from "@/lib/runtime";
import { getSheetId, getSyncState, SHEET_TABS } from "@/lib/sheet-sync";
import type { SyncStateInfo } from "@/lib/types";
import { StaticAdmin } from "@/components/static-admin";
import { SyncPanel } from "@/components/sync-panel";

export const metadata: Metadata = {
  title: "Store admin — Google Sheet catalogue",
  robots: { index: false, follow: false },
};

export default async function AdminSyncPage() {
  // Static hosting has no server or database — show the in-browser manager.
  if (STATIC_BUILD) return <StaticAdmin />;

  let state: SyncStateInfo = {
    source: "demo",
    status: "idle",
    message: "Database is not ready yet — run the migrations first.",
    lastSyncAt: null,
    counts: null,
    errors: [],
  };
  try {
    state = await getSyncState();
  } catch {
    // keep the default message
  }
  return <SyncPanel state={state} sheetConfigured={getSheetId().length > 0} sheetId={getSheetId()} tabs={SHEET_TABS} />;
}
