import http from "node:http";
import { spawnSync } from "node:child_process";
import { stat, readFile } from "node:fs/promises";
const result = spawnSync(process.execPath, ["scripts/build.mjs"], {
  stdio: "inherit",
});
if (result.status) process.exit(result.status);
http
  .createServer(async (req, res) => {
    try {
      if (req.url === "/__qa/mobile") {
        const html = await readFile("src/index.html", "utf8");
        res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
        res.end(
          `<html><head><title>Le Repère · contrôle mobile</title></head><body style="margin:0;background:#e4ded7;display:flex;justify-content:center"><iframe title="Le Repère mobile" style="width:390px;height:844px;border:0;background:#f5f0e8" srcdoc="${html.replaceAll("&", "&amp;").replaceAll('"', "&quot;")}"></iframe></body></html>`,
        );
        return;
      }
      const version = (await stat("dist/server/index.js")).mtimeMs;
      const { default: worker } = await import(
        `../dist/server/index.js?v=${version}`
      );
      const body = ["GET", "HEAD"].includes(req.method)
        ? undefined
        : Buffer.concat(await Array.fromAsync(req));
      const request = new Request(`http://${req.headers.host}${req.url}`, {
        method: req.method,
        headers: req.headers,
        ...(body ? { body } : {}),
      });
      const response = await worker.fetch(request, {}, {});
      const headers = Object.fromEntries(response.headers);
      delete headers["set-cookie"];
      res.writeHead(response.status, {
        ...headers,
        ...(response.headers.getSetCookie().length
          ? { "set-cookie": response.headers.getSetCookie() }
          : {}),
      });
      res.end(Buffer.from(await response.arrayBuffer()));
    } catch {
      res.writeHead(500);
      res.end("Erreur de prévisualisation");
    }
  })
  .listen(Number(process.env.PORT) || 4173, "0.0.0.0", () =>
    console.log("Le Repère web preview ready"),
  );
