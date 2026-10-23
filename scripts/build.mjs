import { build } from "esbuild";
import { readFile, writeFile, mkdir } from "node:fs/promises";
const app = await build({
  metafile: true,
  entryPoints: ["src/app.tsx"],
  bundle: true,
  write: false,
  minify: true,
  format: "esm",
  target: ["es2022"],
  outdir: "out",
  jsx: "automatic",
  define: { "process.env.NODE_ENV": '"production"' },
});
if(Object.keys(app.metafile.inputs).some(p=>/packages\/assessment|apps\/api\/src\/(?:course-catalog|product-content)/.test(p))) throw new Error("Les corrections serveur ne doivent pas être embarquées dans le client.");
const js = app.outputFiles.find((f) => f.path.endsWith(".js")).text;
const css = app.outputFiles.find((f) => f.path.endsWith(".css")).text;
const html = await readFile("src/index.html", "utf8");
const vercelTarget = process.argv.includes("--vercel");
const logo = await readFile("src/assets/le-repere-logo.svg", "utf8");
const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1431 1431"><image x="0" y="444" width="1431" height="543" href="data:image/svg+xml;base64,${Buffer.from(logo).toString("base64")}"/></svg>`;
const release=JSON.parse(await readFile("packages/product/generated/release.json","utf8"));
const assets = {
  "/product-version.json": {body:JSON.stringify(release),type:"application/json"},
  "/index.html": { body: html, type: "text/html; charset=utf-8" },
  "/assets/app.js": { body: js, type: "text/javascript; charset=utf-8" },
  "/assets/app.css": { body: css, type: "text/css; charset=utf-8" },
  "/assets/le-repere-logo.svg": {
    body: logo,
    type: "image/svg+xml",
  },
  "/icon.svg": { body: icon, type: "image/svg+xml" },
  "/manifest.webmanifest": {
    body: JSON.stringify({
      name: "Le Repère Permis",
      short_name: "Le Repère",
      start_url: "/",
      display: "standalone",
      background_color: "#F5F0E8",
      theme_color: "#672C3B",
      icons: [
        {
          src: "/icon.svg",
          sizes: "any",
          type: "image/svg+xml",
          purpose: "any",
        },
      ],
    }),
    type: "application/manifest+json",
  },
};
const worker = await build({
  stdin: {
    contents: `import {createWorker} from './src/worker.js'; export default createWorker(${JSON.stringify(assets)});`,
    resolveDir: process.cwd(),
  },
  bundle: true,
  write: false,
  minify: true,
  format: "esm",
  platform: "browser",
  target: "es2022",
});
await mkdir("dist/server", { recursive: true });
await mkdir("dist/.openai", { recursive: true });
await writeFile("dist/server/index.js", worker.outputFiles[0].contents);
if (!vercelTarget)
  await writeFile(
    "dist/.openai/hosting.json",
    await readFile(".openai/hosting.json"),
  );
if (vercelTarget) {
  for (const [path, entry] of Object.entries(assets)) {
    const filename = "public" + path;
    await mkdir(filename.slice(0, filename.lastIndexOf("/")), {
      recursive: true,
    });
    await writeFile(
      filename,
      entry.encoding === "base64"
        ? Buffer.from(entry.body, "base64")
        : entry.body,
    );
  }
  console.log(
    "Vercel static assets ready; API requests use api/site.js on Node.js 22.",
  );
}
console.log(
  `Web app built: ${js.length} JS bytes, ${css.length} CSS bytes. No native secrets included.`,
);
