import path from "node:path";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "@/db";
import { ensureSeeded, refreshDemoDeals } from "./sheet-sync";

/** Runs migrations and seeds the demo catalog when the server boots. */
export async function ensureDatabaseReady(): Promise<void> {
  await migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });
  await ensureSeeded();
  await refreshDemoDeals();
}
