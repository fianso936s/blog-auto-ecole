import { defineConfig } from "@neon/config/v1";
export default defineConfig({
  auth: true,
  buckets: { "repere-videos": { access: "private" } },
  functions: {
    spotapi: {
      name: "LE REPÈRE SPOT · API iPhone",
      source: "apps/api/src/index.ts",
      env: {
        APP_DATABASE_URL: process.env.APP_DATABASE_URL!,
        ADMIN_EMAIL: process.env.ADMIN_EMAIL!,
        APP_AUTH_BASE_URL: process.env.APP_AUTH_BASE_URL!,
        APP_AUTH_JWKS_URL: process.env.APP_AUTH_JWKS_URL!,
        ...(process.env.LIVEKIT_URL && process.env.LIVEKIT_API_KEY && process.env.LIVEKIT_API_SECRET
          ? {
              LIVEKIT_URL: process.env.LIVEKIT_URL,
              LIVEKIT_API_KEY: process.env.LIVEKIT_API_KEY,
              LIVEKIT_API_SECRET: process.env.LIVEKIT_API_SECRET,
            }
          : {}),
        ...(process.env.GOOGLE_MAPS_BROWSER_KEY
          ? { GOOGLE_MAPS_BROWSER_KEY: process.env.GOOGLE_MAPS_BROWSER_KEY }
          : {}),
        ...(process.env.MAP_STYLE_URL
          ? { MAP_STYLE_URL: process.env.MAP_STYLE_URL }
          : {}),
      },
    },
  },
});
