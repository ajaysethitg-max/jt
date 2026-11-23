import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;
const staticBuild = process.env.NEXT_PUBLIC_STATIC_BUILD === "true";

if (!databaseUrl && !staticBuild) {
  // Kept non-fatal so `next build` never needs a database; queries fail with
  // a clear message (see below) until DATABASE_URL is configured.
  console.warn("[db] DATABASE_URL is not set — database features are disabled until it is configured.");
}

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

function unavailable(): never {
  throw new Error(
    "Database is not available in static (GitHub Pages) mode. Set DATABASE_URL and use server mode to store data.",
  );
}

let pool: Pool;
let db: ReturnType<typeof drizzle>;

if (databaseUrl) {
  pool =
    globalForDb.__arenaNextJsPostgresqlPool ??
    new Pool({
      connectionString: databaseUrl,
    });

  if (process.env.NODE_ENV !== "production") {
    globalForDb.__arenaNextJsPostgresqlPool = pool;
  }

  db = drizzle(pool);
} else {
  // Static export: there is no database. Any accidental use fails loudly
  // instead of breaking the build on import.
  pool = new Proxy({}, { get: unavailable }) as unknown as Pool;
  db = new Proxy({}, { get: (_target, prop) => (prop === "then" ? undefined : unavailable()) }) as unknown as ReturnType<
    typeof drizzle
  >;
}

export { pool, db };
