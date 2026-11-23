"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, Download, ExternalLink, FileSpreadsheet, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { useCatalog } from "@/lib/catalog-context";
import { SHEET_DOCS, SETTING_KEYS_DOC } from "@/lib/sheet-docs";
import type { SheetName } from "@/lib/types";

/** Catalogue manager for static hosting (GitHub Pages), where there is no server. */
export function StaticAdmin() {
  const { origin, products, refresh, clearCache } = useCatalog();
  const [busy, setBusy] = useState<null | "refresh" | "clear">(null);
  const [message, setMessage] = useState<{ tone: "ok" | "err"; text: string } | null>(null);
  const [tab, setTab] = useState<SheetName | "keys">("products");

  const sheetId = (process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID || "").trim();
  const apiKey = (process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY || "").trim();
  const csvBase = (process.env.NEXT_PUBLIC_CATALOG_CSV_BASE_URL || "").trim().replace(/\/+$/, "");
  const dealCount = products.filter((p) => p.deal).length;

  const run = async (kind: "refresh" | "clear") => {
    setBusy(kind);
    setMessage(null);
    if (kind === "clear") clearCache();
    const ok = await refresh();
    setMessage(
      ok
        ? { tone: "ok", text: "Catalogue refreshed from your source." }
        : { tone: "err", text: "Could not reach the catalogue source — showing the last saved copy." },
    );
    setBusy(null);
  };

  const tabs: (SheetName | "keys")[] = ["products", "deals", "reviews", "settings", "keys"];

  return (
    <div className="container-x py-10">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-bp-600">Store admin</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-ink-900">Live catalogue</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-500">
          This site is hosted statically, so products, prices, the logo and the Deal of the Day are read straight from your Google Sheet in every
          visitor&apos;s browser — no server or redeploy needed.
        </p>

        {message && (
          <div
            className={`mt-6 flex items-start gap-3 rounded-2xl p-4 text-sm font-semibold ${
              message.tone === "ok" ? "bg-tq-50 text-tq-800" : "bg-bp-50 text-bp-700"
            }`}
          >
            {message.tone === "ok" ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" /> : <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />}
            {message.text}
          </div>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-ink-100">
            <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-ink-900">
              <FileSpreadsheet className="h-5 w-5 text-tq-600" /> Source
            </h2>
            <div className="mt-4 flex items-center gap-3">
              <span className={`h-3 w-3 rounded-full ${sheetId || csvBase ? "bg-tq-500" : "bg-bp-500"}`} />
              <p className="text-sm font-bold text-ink-900">
                {sheetId ? "Google Sheet connected" : csvBase ? "CSV files connected" : "Demo catalogue — no live source yet"}
              </p>
            </div>
            {sheetId && (
              <div className="mt-3 space-y-2 text-sm">
                <a
                  href={`https://docs.google.com/spreadsheets/d/${sheetId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-bold text-tq-700 hover:underline"
                >
                  Open your Google Sheet <ExternalLink className="h-4 w-4" />
                </a>
                <p className="text-xs text-ink-500">
                  Reading through {apiKey ? "the Google Sheets API (API key configured)" : "the public CSV export — keep the sheet shared as “Anyone with the link · Viewer”"}.
                </p>
                {!apiKey && (
                  <p className="rounded-xl bg-bp-50 p-3 text-xs font-semibold text-bp-700">
                    Tip: add the <code>NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY</code> secret in GitHub for faster, more reliable updates.
                  </p>
                )}
              </div>
            )}
            {!sheetId && csvBase && (
              <a href={`${csvBase}/products.csv`} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-tq-700 hover:underline">
                View products.csv <ExternalLink className="h-4 w-4" />
              </a>
            )}
            <dl className="mt-5 grid grid-cols-3 gap-2 text-center">
              {[
                ["Products", products.length],
                ["Live deals", dealCount],
                ["Status", origin === "live" ? "Live" : origin === "demo" ? "Demo" : "Built-in"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-ink-50 py-3">
                  <dd className="tnum text-lg font-bold text-ink-900">{value}</dd>
                  <dt className="text-[11px] font-semibold text-ink-500">{label}</dt>
                </div>
              ))}
            </dl>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => run("refresh")}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-tq-600 px-4 py-3 text-sm font-bold text-white hover:bg-tq-700 disabled:opacity-50"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Refresh catalogue
              </button>
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => run("clear")}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-ink-200 px-4 py-3 text-sm font-bold text-ink-800 hover:border-tq-400 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" /> Clear saved copy
              </button>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-ink-100">
            <h2 className="font-display text-xl font-semibold text-ink-900">Connect your Google Sheet</h2>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-ink-600">
              <li>
                Download the templates below (they also live in the <code>catalog/</code> folder of your repository) and import them into a new Google Sheet — one tab each, named <strong>Products</strong>, <strong>Deals</strong>, <strong>Reviews</strong>, <strong>Settings</strong>.
              </li>
              <li>
                In the sheet: <strong>Share → Anyone with the link → Viewer</strong>.
              </li>
              <li>
                On GitHub: <strong>Settings → Secrets and variables → Actions → Variables</strong> → add <code>NEXT_PUBLIC_GOOGLE_SHEET_ID</code> with the ID from the sheet URL.
              </li>
              <li>
                Re-run the <strong>Deploy to GitHub Pages</strong> workflow, then press <em>Refresh catalogue</em>.
              </li>
            </ol>
            {csvBase && (
              <div className="mt-5">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink-500">Templates</p>
                <ul className="mt-2 space-y-2">
                  {(Object.keys(SHEET_DOCS) as SheetName[]).map((s) => (
                    <li key={s}>
                      <a
                        href={`${csvBase}/${s}.csv`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between rounded-xl border border-ink-200 px-4 py-2.5 text-sm font-bold text-ink-800 hover:border-tq-400 hover:text-tq-700"
                      >
                        {SHEET_DOCS[s].title} <Download className="h-4 w-4" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </div>

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-soft ring-1 ring-ink-100">
          <div className="flex flex-wrap gap-2">
            {tabs.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`rounded-full border px-4 py-2 text-sm font-bold ${
                  tab === t ? "border-ink-900 bg-ink-900 text-white" : "border-ink-200 text-ink-600 hover:border-tq-300"
                }`}
              >
                {t === "keys" ? "Settings keys" : SHEET_DOCS[t].title}
              </button>
            ))}
          </div>
          <p className="mt-4 text-sm text-ink-500">{tab === "keys" ? "Rows for the Settings tab — use | to separate list items." : SHEET_DOCS[tab].description}</p>
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
                {(tab === "keys" ? SETTING_KEYS_DOC.map((k) => ({ name: k.key, required: true, desc: k.desc })) : SHEET_DOCS[tab].columns).map((c) => (
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
