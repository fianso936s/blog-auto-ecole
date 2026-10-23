import { serve } from "@hono/node-server";
import app from "./index.js";
serve({ fetch: app.fetch, port: Number(process.env.PORT || 8787) }, () =>
  console.log("API locale : http://localhost:8787"),
);
