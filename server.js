
import express from "express";
import rateLimit from "express-rate-limit";
import sanitizeHtml from "sanitize-html";
import dns from "node:dns/promises";
import net from "node:net";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "2kb" }));
app.use("/api", rateLimit({ windowMs: 60_000, limit: 20 }));

const page = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>google_classroom Desktop</title>
<style>
*{box-sizing:border-box}
:root{color-scheme:dark}
body{margin:0;height:100vh;overflow:hidden;font:14px Arial,sans-serif;color:#f8f3ff;background:#10091e}
.desktop{height:100vh;position:relative;overflow:hidden;background:radial-gradient(ellipse at 50% 20%,#49216e 0,#201033 42%,#0a0712 100%)}
.wallpaper{position:absolute;inset:0;overflow:hidden;pointer-events:none}
.orb{position:absolute;border-radius:50%;filter:blur(2px);opacity:.22}
.orb.one{width:420px;height:420px;background:#b34aff;top:-200px;right:-90px}
.orb.two{width:350px;height:350px;background:#6d42ff;bottom:5%;left:-200px}
.topbar{height:38px;position:absolute;top:0;left:0;right:0;background:#120b20c9;backdrop-filter:blur(20px);display:flex;align-items:center;justify-content:space-between;padding:0 18px;border-bottom:1px solid #ffffff12;z-index:5}
.brand{font-weight:bold;color:#d6a0ff;letter-spacing:.3px}
.system{color:#c9b9dc;font-size:12px}
.shortcuts{position:absolute;top:58px;left:18px;display:grid;gap:22px;width:80px}
.shortcut{border:0;background:transparent;color:#f5eaff;display:grid;justify-items:center;gap:7px;cursor:pointer;padding:5px;font-size:11px;text-shadow:0 2px 5px #000}
.shortcut:hover{background:#ffffff12;border-radius:12px}
.appicon{height:48px;width:48px;border-radius:15px;background:linear-gradient(145deg,#c45bff,#6335c9);display:grid;place-items:center;font-size:24px;box-shadow:0 6px 24px #0004;border:1px solid #ffffff30}
.window{position:absolute;z-index:2;top:12%;left:50%;transform:translateX(-50%);width:min(850px,calc(100% - 34px));height:min(690px,calc(100% - 150px));min-height:280px;background:#130e20ed;border:1px solid #ffffff25;border-radius:17px;box-shadow:0 24px 90px #0008;overflow:hidden;display:flex;flex-direction:column;backdrop-filter:blur(24px)}
.window.hidden{display:none}
.titlebar{height:48px;flex-shrink:0;display:flex;align-items:center;padding:0 15px;gap:12px;background:#ffffff07;border-bottom:1px solid #ffffff12}
.traffic{display:flex;gap:7px}
.dot{width:11px;height:11px;border:0;border-radius:50%;padding:0;cursor:pointer}
.close{background:#ff657a}.minimize{background:#ffc45d}.maximize{background:#65d99a}
.wintitle{font-weight:bold;flex:1;text-align:center;margin-right:48px;color:#e5d4f7}
.content{padding:22px;overflow:auto;flex:1}
.hero{text-align:center;margin:20px auto 25px}
.logo{font-size:53px;font-weight:900;color:#d49aff;text-shadow:0 0 35px #ad42ff}
h1{font-size:clamp(27px,5vw,42px);letter-spacing:-1.8px;margin:5px 0 10px}
h1 span{color:#c078ff}
.muted{color:#ad9cbe;line-height:1.6}
.searchform{display:flex;gap:9px;width:min(620px,100%);margin:22px auto}
input{font:inherit;color:#fff;background:#090711;border:1px solid #59406d;border-radius:12px;padding:14px;min-width:0;outline:none}
input:focus{border-color:#bc72ff;box-shadow:0 0 0 3px #a746ff24}
.searchform input{flex:1;width:100%}
button.primary{border:0;border-radius:11px;padding:13px 19px;background:linear-gradient(110deg,#c04aff,#7042ff);color:white;font-weight:bold;cursor:pointer}
button.primary:hover{filter:brightness(1.15)}
.quicklinks{display:flex;justify-content:center;gap:10px;flex-wrap:wrap;margin:24px 0}
.quicklinks a,.pill{padding:9px 13px;border:1px solid #ffffff18;background:#ffffff08;border-radius:20px;color:#dfc4ff;text-decoration:none}
.quicklinks a:hover{background:#ffffff17}
.sectiontitle{font-size:12px;color:#a995bd;letter-spacing:1.5px;margin:25px 0 12px}
.results{max-width:680px;margin:0 auto;line-height:1.7;overflow-wrap:anywhere}
.results .result{padding:15px 0;border-bottom:1px solid #ffffff12}
.results a{color:#cba1ff;font-size:17px}
.results .result__url{font-size:12px;color:#8fd8b0}
.results .result__snippet{color:#b9adc9;margin-top:5px}
.results h2,.results h3{font-size:17px}
.results .no-results{color:#b9adc9}
.browserbar{display:flex;gap:8px;padding:12px;border-bottom:1px solid #ffffff12}
.browserbar input{flex:1}
.browserbody{padding:20px;overflow:auto;flex:1;overflow-wrap:anywhere;line-height:1.7}
.browserbody a{color:#cba1ff}
.browserbody img{max-width:100%;height:auto}
.browserbody table{max-width:100%;display:block;overflow:auto}
.status{font-size:12px;color:#c3afd7;margin:12px 0;overflow-wrap:anywhere}
.dockwrap{position:absolute;bottom:14px;left:0;right:0;display:flex;justify-content:center;z-index:5;pointer-events:none}
.dock{pointer-events:auto;display:flex;align-items:center;gap:8px;padding:9px 13px;background:#170f26c9;border:1px solid #ffffff24;border-radius:20px;box-shadow:0 8px 35px #0005;backdrop-filter:blur(22px)}
.dock button{height:49px;width:49px;border:0;border-radius:14px;background:#ffffff0b;color:#fff;font-size:23px;cursor:pointer}
.dock button:hover{transform:translateY(-4px);background:#ffffff20}
.dock .searchicon{background:linear-gradient(145deg,#c04aff,#7042ff)}
.divider{width:1px;height:35px;background:#ffffff24;margin:0 3px}
.footerhint{font-size:11px;color:#a995bd;text-align:center;margin-top:22px}
@media(max-width:600px){
 .shortcuts{left:7px;top:53px;gap:12px}
 .appicon{width:39px;height:39px;font-size:20px}
 .shortcut{font-size:10px}
 .window{top:9%;height:calc(100% - 115px);width:calc(100% - 22px)}
 .content{padding:15px}
 .hero{margin-top:16px}
 .searchform{flex-direction:column}
 .searchform button{width:100%}
 .dock{gap:5px;padding:7px}
 .dock button{width:42px;height:43px}
 .system{font-size:10px}
}
</style>
</head>
<body>
<div class="desktop">
<div class="wallpaper"><div class="orb one"></div><div class="orb two"></div></div>
<div class="topbar">
 <div class="brand">✦ google_classroom</div>
 <div class="system" id="clock">Desktop · Ready</div>
</div>

<div class="shortcuts">
 <button class="shortcut" data-open="searchWindow"><span class="appicon">⌕</span>Search</button>
 <button class="shortcut" data-open="browserWindow"><span class="appicon">🌐</span>Browser</button>
 <button class="shortcut" data-open="aboutWindow"><span class="appicon">✦</span>About</button>
</div>

<section class="window" id="searchWindow">
 <div class="titlebar">
  <div class="traffic">
   <button class="dot close" data-close="searchWindow" aria-label="Close"></button>
   <button class="dot minimize" data-hide="searchWindow" aria-label="Minimize"></button>
   <button class="dot maximize" data-max="searchWindow" aria-label="Maximize"></button>
  </div>
  <div class="wintitle">⌕ Search</div>
 </div>
 <div class="content">
  <div class="hero">
   <div class="logo">G</div>
   <h1>google_<span>classroom</span></h1>
   <p class="muted">Your internet. Your desktop. Your discovery.</p>
   <form class="searchform" action="/search" method="get">
    <input name="q" id="q" type="search" placeholder="Search the web..." required maxlength="200" autocomplete="off" value="__QUERY__">
    <button class="primary">Search ↗</button>
   </form>
   <div class="quicklinks">
    <a href="https://www.wikipedia.org" target="_blank" rel="noopener noreferrer">Wikipedia</a>
    <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer">YouTube</a>
    <a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a>
    <a href="https://www.reddit.com" target="_blank" rel="noopener noreferrer">Reddit</a>
   </div>
  </div>
  <div id="resultsArea">__RESULTS__</div>
  <div class="footerhint">Powered by DuckDuckGo · Open the Browser app to view a website</div>
 </div>
</section>

<section class="window hidden" id="browserWindow">
 <div class="titlebar">
  <div class="traffic">
   <button class="dot close" data-close="browserWindow" aria-label="Close"></button>
   <button class="dot minimize" data-hide="browserWindow" aria-label="Minimize"></button>
   <button class="dot maximize" data-max="browserWindow" aria-label="Maximize"></button>
  </div>
  <div class="wintitle">🌐 Web Viewer</div>
 </div>
 <form id="browserForm" class="browserbar">
  <input id="url" type="url" value="https://www.wikipedia.org" placeholder="https://example.com" required>
  <button class="primary" id="go">Go ↗</button>
 </form>
 <div class="browserbody">
  <p class="status" id="status">Enter a public website address and select Go.</p>
  <div id="result"></div>
 </div>
</section>

<section class="window hidden" id="aboutWindow" style="width:min(480px,calc(100% - 30px));height:auto;max-height:70%">
 <div class="titlebar">
  <div class="traffic"><button class="dot close" data-close="aboutWindow" aria-label="Close"></button></div>
  <div class="wintitle">About this desktop</div>
 </div>
 <div class="content">
  <div class="hero">
   <div class="logo">✦</div>
   <h1>google_<span>classroom</span></h1>
   <p class="muted">A custom web-search desktop built with Express.</p>
   <p class="muted">Search the web, open desktop apps, and view supported web pages.</p>
   <button class="primary" data-open="searchWindow">Back to Search</button>
  </div>
 </div>
</section>

<div class="dockwrap">
 <div class="dock">
  <button class="searchicon" data-open="searchWindow" title="Search" aria-label="Search">⌕</button>
  <button data-open="browserWindow" title="Browser" aria-label="Browser">🌐</button>
  <button data-open="aboutWindow" title="About" aria-label="About">✦</button>
  <div class="divider"></div>
  <button id="homeButton" title="Show desktop" aria-label="Show desktop">⌂</button>
 </div>
</div>
</div>

<script>
const $ = s => document.querySelector(s);

function openWindow(id) {
  document.querySelectorAll(".window").forEach(w => {
    if (w.id !== id) w.classList.add("hidden");
  });
  const win = document.getElementById(id);
  if (win) win.classList.remove("hidden");
}

document.querySelectorAll("[data-open]").forEach(el =>
  el.addEventListener("click", () => openWindow(el.dataset.open))
);
document.querySelectorAll("[data-close],[data-hide]").forEach(el =>
  el.addEventListener("click", () =>
    document.getElementById(el.dataset.close || el.dataset.hide).classList.add("hidden")
  )
);

document.querySelectorAll("[data-max]").forEach(el =>
  el.addEventListener("click", () => {
    const w = document.getElementById(el.dataset.max);
    w.style.top = w.dataset.maxed === "yes" ? "12%" : "45px";
    w.style.width = w.dataset.maxed === "yes" ? "" : "calc(100% - 24px)";
    w.style.height = w.dataset.maxed === "yes" ? "" : "calc(100% - 115px)";
    w.dataset.maxed = w.dataset.maxed === "yes" ? "no" : "yes";
  })
);

$("#homeButton").addEventListener("click", () => {
  document.querySelectorAll(".window").forEach(w => w.classList.add("hidden"));
});

function updateClock() {
  $("#clock").textContent = new Date().toLocaleString([], {
    weekday: "short", hour: "2-digit", minute: "2-digit"
  }) + " · Online";
}
updateClock();
setInterval(updateClock, 30000);

const browserForm = $("#browserForm");
browserForm.addEventListener("submit", async e => {
  e.preventDefault();
  openWindow("browserWindow");
  $("#go").disabled = true;
  $("#status").textContent = "Loading website…";
  $("#result").replaceChildren();

  try {
    const r = await fetch("/api/fetch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: $("#url").value })
    });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error || "Request failed");

    $("#status").textContent = d.title + " · " + d.url;
    const template = document.createElement("template");
    template.innerHTML = d.html;

    for (const a of template.content.querySelectorAll("a[href]")) {
      try {
        const dest = new URL(a.getAttribute("href"), d.url);
        if (!["http:", "https:"].includes(dest.protocol)) {
          a.removeAttribute("href");
          continue;
        }
        a.href = dest.href;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
      } catch {
        a.removeAttribute("href");
      }
    }
    $("#result").append(template.content);
  } catch (err) {
    $("#status").textContent = err.message || "Unable to load website.";
  } finally {
    $("#go").disabled = false;
  }
});

document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    document.querySelectorAll(".window").forEach(w => w.classList.add("hidden"));
  }
});
</script>
</body>
</html>`;

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;",
    '"': "&quot;", "'": "&#39;"
  })[c]);
}

function renderPage(query = "", results = "") {
  return page
    .replaceAll("__QUERY__", escapeHtml(query))
    .replace("__RESULTS__", results);
}

app.get("/", (_req, res) => {
  res.type("html").send(renderPage());
});

app.get("/search", async (req, res) => {
  const q = String(req.query.q || "").trim().slice(0, 200);
  if (!q) return res.redirect("/");

  try {
    const response = await fetch(
      "https://html.duckduckgo.com/html/?q=" + encodeURIComponent(q),
      {
        signal: AbortSignal.timeout(8000),
        headers: { "User-Agent": "Mozilla/5.0" }
      }
    );

    if (!response.ok) {
      return res.status(502).type("html").send(
        renderPage(q, '<p class="no-results">Search is temporarily unavailable. Please try again.</p>')
      );
    }

    const source = await response.text();

    const results = sanitizeHtml(source, {
      allowedTags: [
        "div", "a", "span", "p", "b", "strong", "br",
        "h2", "h3", "ol", "li"
      ],
      allowedAttributes: {
        a: ["href", "class", "title"],
        div: ["class"],
        span: ["class"],
        ol: ["class"]
      },
      allowedSchemes: ["http", "https"],
      transformTags: {
        a: (tagName, attribs) => {
          let href = attribs.href || "";
          try {
            href = new URL(href, "https://html.duckduckgo.com").href;
            if (!["http:", "https:"].includes(new URL(href).protocol)) href = "";
          } catch {
            href = "";
          }
          return {
            tagName,
            attribs: {
              ...attribs,
              ...(href ? { href, target: "_blank", rel: "noopener noreferrer" } : {})
            }
          };
        }
      }
    });

    const styledResults = '<div class="results"><p class="sectiontitle">SEARCH RESULTS</p>' +
      results +
      '</div>';

    res.type("html").send(renderPage(q, styledResults));
  } catch {
    res.status(502).type("html").send(
      renderPage(q, '<p class="no-results">Could not load search results. Please try again.</p>')
    );
  }
});

app.get("/health", (_req, res) => res.json({ ok: true }));

function isPrivateIPv4(ip) {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some(n => !Number.isInteger(n) || n < 0 || n > 255)) return true;
  const [a, b] = parts;
  return a === 0 || a === 10 || a === 127 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 100 && b >= 64 && b <= 127) ||
    a >= 224;
}

function isPrivateIPv6(ip) {
  const s = ip.toLowerCase();
  return s === "::" || s === "::1" ||
    s.startsWith("fc") || s.startsWith("fd") ||
    s.startsWith("fe8") || s.startsWith("fe9") ||
    s.startsWith("fea") || s.startsWith("feb") ||
    s.startsWith("::ffff:") || s.startsWith("2001:db8:");
}

app.post("/api/fetch", async (req, res) => {
  let target;
  try {
    target = new URL(String(req.body?.url || ""));
    if (!["http:", "https:"].includes(target.protocol) ||
        target.username || target.password ||
        (target.port && !["80", "443"].includes(target.port))) {
      throw new Error("Invalid URL");
    }

    const host = target.hostname.toLowerCase();
    if (!host || host === "localhost" || host.endsWith(".localhost") ||
        host.endsWith(".local") || host.endsWith(".internal") ||
        host === "metadata.google.internal" || host.endsWith(".test")) {
      throw new Error("Private host");
    }

    if (net.isIP(host)) {
      if (net.isIP(host) === 4 && isPrivateIPv4(host)) throw new Error("Private IP");
      if (net.isIP(host) === 6 && isPrivateIPv6(host)) throw new Error("Private IP");
    } else {
      const addresses = await dns.lookup(host, { all: true, verbatim: true });
      if (!addresses.length || addresses.some(a =>
        (net.isIP(a.address) === 4 && isPrivateIPv4(a.address)) ||
        (net.isIP(a.address) === 6 && isPrivateIPv6(a.address))
      )) throw new Error("Host resolves to a private address");
    }
  } catch {
    return res.status(400).json({
      error: "Enter a valid public HTTP or HTTPS website address."
    });
  }

  try {
    const response = await fetch(target, {
      redirect: "error",
      signal: AbortSignal.timeout(8000),
      headers: { "user-agent": "GoogleClassroomViewer/1.0" }
    });

    if (!response.ok) {
      return res.status(502).json({
        error: "Website returned HTTP " + response.status
      });
    }

    const type = response.headers.get("content-type") || "";
    if (!/^(text\/html|text\/plain|application\/xhtml\+xml)(;|$)/i.test(type)) {
      return res.status(415).json({
        error: "Only HTML and text pages are supported."
      });
    }

    if (!response.body) {
      return res.status(502).json({ error: "The website returned no content." });
    }

    const reader = response.body.getReader();
    const chunks = [];
    let size = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      size += value.byteLength;
      if (size > 1_000_000) {
        await reader.cancel();
        return res.status(413).json({ error: "Page exceeds the 1 MB limit." });
      }
      chunks.push(value);
    }

    let source = Buffer.concat(chunks).toString("utf8");

    if (type.startsWith("text/plain")) {
      source = "<pre>" + escapeHtml(source) + "</pre>";
    }

    const titleMatch = source.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch
      ? titleMatch[1].replace(/<[^>]*>/g, "").slice(0, 200)
      : target.hostname;

    const html = sanitizeHtml(source, {
      allowedTags: [
        "h1", "h2", "h3", "h4", "p", "div", "span", "br", "hr",
        "ul", "ol", "li", "blockquote", "pre", "code", "strong",
        "b", "em", "i", "table", "thead", "tbody", "tr", "th", "td", "a"
      ],
      allowedAttributes: {
        a: ["href", "title"],
        th: ["colspan", "rowspan"],
        td: ["colspan", "rowspan"]
      },
      allowedSchemes: ["http", "https"]
    });

    res.json({ url: target.href, title, html });
  } catch {
    res.status(502).json({
      error: "Couldn't load that site. It may block automated requests or require JavaScript."
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("google_classroom desktop listening on port " + PORT);
});
