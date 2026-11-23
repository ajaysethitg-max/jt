export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.NEXT_PHASE === "phase-production-build") return;
  const { ensureDatabaseReady } = await import("@/lib/bootstrap");
  try {
    await ensureDatabaseReady();
    console.log("[jeet-telecom] database ready");
  } catch (e) {
    console.error("[jeet-telecom] database bootstrap failed:", e);
  }
}
