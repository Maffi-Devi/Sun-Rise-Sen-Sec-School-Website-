/*
 * Creates a .webp copy next to every .jpg in assets/img using headless Chrome
 * (canvas.toDataURL). Only (re)converts images whose .webp is missing or older.
 * Usage: node _build/make-webp.js
 */
const http = require("http");
const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");
const run = (args) => new Promise((resolve) => execFile(CHROME_BIN(), args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }, (e, out) => resolve(out || "")));

const ROOT = path.resolve(__dirname, "..");
const IMG = path.join(ROOT, "assets", "img");
const CHROME = process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 8766;
const CHROME_BIN = () => CHROME;

const server = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split("?")[0]);
  const file = url === "/convert" ? path.join(__dirname, "webp-convert.html") : path.join(ROOT, url);
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { "Content-Type": file.endsWith(".html") ? "text/html" : "image/jpeg" });
    res.end(data);
  });
}).listen(PORT, async () => {
  const profile = path.join(require("os").tmpdir(), "webp-chrome-profile");
  let done = 0, saved = 0;
  for (const f of fs.readdirSync(IMG).filter((n) => n.endsWith(".jpg"))) {
    const src = path.join(IMG, f), dst = src.replace(/\.jpg$/, ".webp");
    if (fs.existsSync(dst) && fs.statSync(dst).mtimeMs >= fs.statSync(src).mtimeMs) continue;
    const dom = await run(["--headless=new", "--disable-gpu", `--user-data-dir=${profile}`,
      "--virtual-time-budget=8000", "--dump-dom", `http://localhost:${PORT}/convert?img=/assets/img/${f}&q=0.78`]);
    const m = dom.match(/WEBP:data:image\/webp;base64,([A-Za-z0-9+/=]+)/);
    if (!m) { console.warn("  ! failed", f); continue; }
    const buf = Buffer.from(m[1], "base64");
    const orig = fs.statSync(src).size;
    if (buf.length >= orig) { console.log("  skip (not smaller)", f); continue; }
    fs.writeFileSync(dst, buf);
    done++; saved += orig - buf.length;
  }
  console.log(`webp: ${done} files, saved ${Math.round(saved / 1024)} KB`);
  server.close();
});
