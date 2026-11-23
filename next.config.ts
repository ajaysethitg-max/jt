import type { NextConfig } from "next";

/**
 * Two hosting modes from one code base:
 *  - Server mode (default): full stack — Postgres, API routes, server rendering.
 *  - Static mode (NEXT_PUBLIC_STATIC_BUILD=true): `next build` emits `out/`,
 *    ready for GitHub Pages. API route handlers (route.api.ts) are excluded.
 */
const isStaticExport = process.env.NEXT_PUBLIC_STATIC_BUILD === "true";
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/+$/, "");

const remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
  { protocol: "https", hostname: "images.pexels.com" },
  { protocol: "https", hostname: "images.unsplash.com" },
  { protocol: "https", hostname: "lh3.googleusercontent.com" },
  { protocol: "https", hostname: "drive.google.com" },
  { protocol: "https", hostname: "cdn.pixabay.com" },
  { protocol: "https", hostname: "upload.wikimedia.org" },
];

const nextConfig: NextConfig = {
  output: isStaticExport ? "export" : undefined,
  // GitHub Pages project sites are served from https://user.github.io/<repo>/.
  basePath: basePath || undefined,
  trailingSlash: isStaticExport ? true : undefined,
  images: {
    // The image optimiser needs a server; GitHub Pages serves the files as-is.
    unoptimized: isStaticExport,
    remotePatterns,
  },
  // Mode-specific files, matched before the plain extensions:
  //   route.api.ts  / page.server.tsx → server build only
  //   page.static.tsx                → static (GitHub Pages) build only
  pageExtensions: isStaticExport ? ["static.tsx", "tsx", "ts"] : ["server.tsx", "api.ts", "tsx", "ts"],
};

export default nextConfig;
