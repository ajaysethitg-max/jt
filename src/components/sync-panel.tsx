"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertTriangle, CheckCircle2, Download, ExternalLink, FileSpreadsheet, Loader2, RefreshCw, Upload } from "lucide-react";
import { cn, formatDate } from "@/lib/format";
import { SHEET_DOCS, SETTING_KEYS_DOC } from "@/lib/sheet-docs";
import type { SheetName, SyncStateInfo } from "@/lib/types";

export function SyncPanel({
  state,
  sheetConfigured,
  sheetId,
  tabs,
}: {
  state: SyncStateInfo;
  sheetConfigured: boolean;
  sheetId: string;
  tabs: Record<SheetName, string>;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<{ tone: "ok" | "err"; text: string } | null>(null);
  const [sheet, setSheet] = useState<SheetName>("products");
  const [csv, setCsv] = useState("");
  const [showSettings, setShowSettings] = useState(false);

  const act = async (label: string, body: Record<string, unknown>) => {
    setBusy(label);
    setMessage(null);
    try {
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; state?: SyncStateInfo };
      if (!res.ok || !data.ok) throw new Error(data.error ?? "The request failed");
      setMessage({ tone: "ok", text: data.state?.message ?? "Done" });
      if (body.action === "import") setCsv("");
      router.refresh();
    } catch (e) {
      setMessage({ tone: "err", text: (e as Error).message });
    } finally {
      setBusy(null);
    }
  };

  const sheets: SheetName[] = ["products", "deals", "reviews", "settings"];

  return (
    <div className="container-x py-10">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-bp-600">Store admin</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-ink-900">Google Sheet catalogue</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-500">
          Products, prices, the logo and the Deal of the Day all live in one Google Sheet. Edit the sheet, click <strong>Sync now</strong>, and the storefront updates — no code needed.
        </p>

        {message && (
          <div
            className={cn(
              "mt-6 flex items-start gap-3 rounded-2xl p-4 text-sm font-semibold",
              message.tone === "ok" ? "bg-tq-50 text-tq-800" : "bg-bp-50 text-bp-700",
            )}
          >
            {message.tone === "ok" ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" /> : <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />}
            {message.text}
          </div>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          {/* Connection */}
          <section className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-ink-100">
            <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-ink-900">
              <FileSpreadsheet className="h-5 w-5 text-tq-600" /> Connection
            </h2>
            <div className="mt-4 flex items-center gap-3">
              <span className={cn("h-3 w-3 rounded-full", sheetConfigured ? "bg-tq-500" : "bg-bp-500")} />
              <p className="text-sm font-bold text-ink-900">{sheetConfigured ? "Google Sheet connected" : "Running on the built-in demo catalogue"}</p>
            </div>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-ink-500">GOOGLE_SHEET_ID</dt>
                <dd className="truncate font-mono text-xs font-bold text-ink-800">{sheetConfigured ? sheetId : "not set"}</dd>
              </div>
              {sheets.map((s) => (
                <div key={s} className="flex justify-between gap-4">
                  <dt className="text-ink-500">Tab · {s}</dt>
                  <dd className="font-semibold text-ink-800">{tabs[s]}</dd>
                </div>
              ))}
            </dl>
            {sheetConfigured && (
              <a href={`https://docs.google.com/spreadsheets/d/${sheetId}`} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-tq-700 hover:underline">
                Open the Google Sheet <ExternalLink className="h-4 w-4" />
              </a>
            )}
            <ol className="mt-5 list-decimal space-y-1.5 pl-5 text-sm text-ink-600">
              <li>Download the four template CSVs below and import them into a new Google Sheet (one tab per file, keep the tab names).</li>
              <li>
                Share the sheet as <strong>“Anyone with the link · Viewer”</strong>.
              </li>
              <li>
                Add <code className="rounded bg-ink-50 px-1.5 py-0.5 text-xs font-bold">GOOGLE_SHEET_ID</code> to <code className="rounded bg-ink-50 px-1.5 py-0.5 text-xs font-bold">.env</code> (the long ID in the sheet URL) and restart, then sync.
              </li>
            </ol>
          </section>

          {/* Sync status */}
          <section className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-ink-100">
            <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-ink-900">
              <RefreshCw className="h-5 w-5 text-tq-600" /> Sync status
            </h2>
            <div className="mt-4 flex items-center gap-2">
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider",
                  state.status === "success" ? "bg-tq-50 text-tq-700" : state.status === "error" ? "bg-bp-50 text-bp-700" : "bg-ink-100 text-ink-500",
                )}
              >
                {state.status === "success" ? "Up to date" : state.status === "error" ? "Needs attention" : "Idle"}
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-400">source · {state.source}</span>
            </div>
            <p className="mt-3 text-sm font-semibold text-ink-800">{state.message}</p>
            <p className="mt-1 text-xs text-ink-500">{state.lastSyncAt ? `Last run ${formatDate(state.lastSyncAt)} · ${new Date(state.lastSyncAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })} IST` : "Never synced"}</p>
            {state.counts && (
              <div className="tnum mt-4 grid grid-cols-4 gap-2 text-center">
                {[
                  ["Products", state.counts.products],
                  ["Deals", state.counts.deals],
                  ["Reviews", state.counts.reviews],
                  ["Settings", state.counts.settings],
                ].map(([l, v]) => (
                  <div key={l} className="rounded-xl bg-ink-50 py-2">
                    <p className="text-lg font-bold text-ink-900">{v}</p>
                    <p className="text-[11px] font-semibold text-ink-500">{l}</p>
                  </div>
                ))}
              </div>
            )}
            {state.errors.length > 0 && (
              <ul className="mt-4 space-y-1 rounded-xl bg-bp-50 p-3 text-xs font-semibold text-bp-700">
                {state.errors.map((e, i) => (
                  <li key={i}>• {e}</li>
                ))}
              </ul>
            )}
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                disabled={!sheetConfigured || busy !== null}
                onClick={() => act("sync", { action: "sync" })}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-tq-600 px-4 py-3 text-sm font-bold text-white hover:bg-tq-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {busy === "sync" ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Sync from Google Sheet
              </button>
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => act("seed", { action: "seed" })}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-ink-200 px-4 py-3 text-sm font-bold text-ink-800 hover:border-tq-400 disabled:opacity-40"
              >
                {busy === "seed" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Reload demo catalogue
              </button>
            </div>
          </section>
        </div>

        {/* Templates + import */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-ink-100">
            <h2 className="font-display text-xl font-semibold text-ink-900">Templates</h2>
            <p className="mt-1 text-sm text-ink-500">Download, import into your Google Sheet, edit, sync.</p>
            <ul className="mt-4 space-y-2">
              {sheets.map((s) => (
                <li key={s}>
                  <a
                    href={`/api/sync/template?sheet=${s}`}
                    className="flex items-center justify-between rounded-xl border border-ink-200 px-4 py-3 text-sm font-bold text-ink-800 transition hover:border-tq-400 hover:text-tq-700"
                  >
                    {SHEET_DOCS[s].title} <Download className="h-4 w-4" />
                  </a>
                </li>
              ))}
            </ul>
          </section>
          <section className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-ink-100">
            <h2 className="font-display text-xl font-semibold text-ink-900">Quick import (paste CSV)</h2>
            <p className="mt-1 text-sm text-ink-500">Paste rows copied from any spreadsheet — same pipeline as the Google Sheet.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {sheets.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSheet(s)}
                  className={cn("rounded-full border px-3 py-1.5 text-xs font-bold", sheet === s ? "border-tq-500 bg-tq-500 text-white" : "border-ink-200 text-ink-600 hover:border-tq-300")}
                >
                  {SHEET_DOCS[s].title}
                </button>
              ))}
            </div>
            <textarea
              value={csv}
              onChange={(e) => setCsv(e.target.value)}
              rows={5}
              placeholder={`Paste ${SHEET_DOCS[sheet].title} CSV here, header row first…`}
              className="mt-3 w-full rounded-xl border border-ink-200 p-3 font-mono text-xs outline-none focus:border-tq-500"
            />
            <button
              type="button"
              disabled={busy !== null || !csv.trim()}
              onClick={() => act("import", { action: "import", sheet, csv })}
              className="mt-3 inline-flex items-center gap-2 rounded-full bg-ink-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-tq-700 disabled:opacity-40"
            >
              {busy === "import" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Import {SHEET_DOCS[sheet].title}
            </button>
          </section>
        </div>

        {/* Column reference */}
        <section className="mt-6 rounded-2xl bg-white p-6 shadow-soft ring-1 ring-ink-100">
          <div className="flex flex-wrap gap-2">
            {sheets.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setSheet(s);
                  setShowSettings(false);
                }}
                className={cn("rounded-full border px-4 py-2 text-sm font-bold", sheet === s && !showSettings ? "border-ink-900 bg-ink-900 text-white" : "border-ink-200 text-ink-600 hover:border-tq-300")}
              >
                {SHEET_DOCS[s].title}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setShowSettings(true)}
              className={cn("rounded-full border px-4 py-2 text-sm font-bold", showSettings ? "border-ink-900 bg-ink-900 text-white" : "border-ink-200 text-ink-600 hover:border-tq-300")}
            >
              Settings keys
            </button>
          </div>
          <p className="mt-4 text-sm text-ink-500">{SHEET_DOCS[sheet].description}</p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-ink-100 text-xs font-bold uppercase tracking-wider text-ink-500">
                  <th className="py-2 pr-4">Column</th>
                  <th className="py-2 pr-4">Required</th>
                  <th className="py-2">What to enter</th>
                </tr>
              </thead>
              <tbody>
                {(showSettings ? SETTING_KEYS_DOC.map((k) => ({ name: k.key, required: true, desc: k.desc })) : SHEET_DOCS[sheet].columns).map((c) => (
                  <tr key={c.name} className="border-b border-ink-50 last:border-0">
                    <td className="py-2.5 pr-4 font-mono text-xs font-bold text-tq-800">{c.name}</td>
                    <td className="py-2.5 pr-4 text-xs font-semibold text-ink-500">{c.required ? "Yes" : "Optional"}</td>
                    <td className="py-2.5 text-ink-600">{c.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
