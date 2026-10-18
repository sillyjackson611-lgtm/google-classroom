
import express from "express";
import rateLimit from "express-rate-limit";

const app = express();
const PORT = process.env.PORT || 3000;

app.disable("x-powered-by");
app.use(express.json({ limit: "2kb" }));
app.use("/api", rateLimit({ windowMs: 60000, limit: 30 }));

const page = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>My Desktop</title>
<style>
*{box-sizing:border-box}
body{margin:0;font:14px Arial,sans-serif;color:#edf3ff}
button,input{font:inherit}
button{cursor:pointer}
.desktop{
 height:100vh;position:relative;overflow:hidden;
 background:radial-gradient(ellipse at 20% 20%,#315a9b,transparent 42%),
 radial-gradient(ellipse at 80% 70%,#543f91,transparent 40%),
 linear-gradient(135deg,#10172b,#182b4c 55%,#111827)
}
.icons{position:absolute;top:15px;left:12px;display:grid;gap:8px}
.shortcut{width:80px;padding:9px 3px;border:1px solid transparent;
 border-radius:9px;background:transparent;color:white;
 display:flex;flex-direction:column;align-items:center;gap:7px}
.shortcut:hover{background:#ffffff20}
.emoji{font-size:28px}
.shortcut span:last-child{font-size:12px}
.taskbar{position:absolute;bottom:0;left:0;right:0;height:52px;
 display:flex;align-items:center;justify-content:center;gap:8px;
 background:#111827ed;border-top:1px solid #ffffff25;z-index:1000}
.taskbar button{border:0;border-radius:8px;padding:9px 13px;
 background:#ffffff12;color:white}
.taskbar button:hover,.taskbar button.active{background:#ffffff30}
.clock{position:absolute;right:14px;font-size:12px}
.window{position:absolute;left:12%;top:9%;z-index:10;
 width:min(850px,84vw);height:min(570px,78vh);min-width:290px;
 min-height:230px;display:flex;flex-direction:column;
 background:#f5f7fb;color:#172033;border:1px solid #ffffff66;
 border-radius:12px;overflow:hidden;box-shadow:0 22px 70px #0006}
.window.hidden{display:none}
.titlebar{height:43px;flex-shrink:0;display:flex;align-items:center;
 gap:10px;padding:0 10px;background:#e7ebf3;
 border-bottom:1px solid #d4dae5;cursor:move;user-select:none}
.windowtitle{font-weight:bold;flex:1;font-size:13px}
.controls{display:flex;gap:5px}
.controls button{width:28px;height:26px;border:0;border-radius:5px;
 background:#d7deea;color:#172033}
.controls button:last-child{background:#d95361;color:white}
.windowbody{flex:1;min-height:0;display:flex;flex-direction:column}
.content{flex:1;min-height:0;overflow:auto;padding:23px}
h1{font-size:27px;margin:0 0 8px}
.sub{color:#657087;line-height:1.6}
.searchrow{display:flex;gap:8px;margin:22px 0}
.searchrow input{flex:1;min-width:0;padding:12px;
 border:1px solid #ccd4e2;border-radius:8px}
.action{border:0;background:#356ac0;color:white;
 border-radius:8px;padding:11px 14px}
.action:hover{background:#2857a1}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(125px,1fr));gap:12px}
.appcard{padding:15px 12px;text-align:left;border:1px solid #dce2ec;
 background:white;color:#172033;border-radius:12px}
.appcard:hover{background:#edf3ff;border-color:#a9c3ef}
.appcard .emoji{display:block;margin-bottom:10px}
.appcard strong{font-size:13px}
.appcard p{font-size:12px;color:#69748a;margin-bottom:0}
.toolbar{display:flex;gap:7px;align-items:center;padding:10px;
 background:#edf0f6;border-bottom:1px solid #d8deea}
.toolbar button{border:0;border-radius:7px;padding:10px;background:#dce3ef;color:#243149}
.toolbar input{flex:1;width:100%;min-width:0;padding:10px;
 border:1px solid #cbd3e0;border-radius:8px}
.status{padding:9px 12px;font-size:12px;color:#68758b;
 background:#f5f7fb;border-bottom:1px solid #e0e5ed;overflow-wrap:anywhere}
.browserbody{flex:1;min-height:0;display:flex;flex-direction:column;overflow:auto;background:white}
.webframe{width:100%;height:100%;min-height:300px;flex:1;border:0}
.hint{padding:15px;color:#27344c;line-height:1.6}
.hint a{color:#245fba;overflow-wrap:anywhere}
.results article{padding:12px 0;border-bottom:1px solid #e0e5ed;overflow-wrap:anywhere}
.results a{color:#215db2;font-size:17px;text-decoration:none}
.results p{font-size:13px;color:#5d687c;line-height:1.6}
.fileitem,.setting{padding:13px;margin:9px 0;border:1px solid #e0e5ed;
 background:white;border-radius:8px}
.startmenu{display:none;position:absolute;z-index:1100;bottom:62px;left:50%;
 transform:translateX(-50%);width:min(350px,94vw);padding:18px;
 background:#1b2438f5;border:1px solid #ffffff30;border-radius:15px}
.startmenu.open{display:block}
.startgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.startgrid button{padding:13px 4px;border:0;border-radius:8px;
 background:#ffffff12;color:white}
@media(max-width:600px){
 .window{left:3%;top:5%;width:94%;height:82vh}
 .content{padding:16px}
 .taskbar{justify-content:flex-start;overflow-x:auto}
 .clock{display:none}
 .toolbar{gap:5px;padding:6px}
}
</style>
</head>
<body>
<div class="desktop" id="desktop">
 <div class="icons">
  <button class="shortcut" data-app="home"><span class="emoji">🖥️</span><span>Desktop</span></button>
  <button class="shortcut" data-app="browser"><span class="emoji">🌐</span><span>Browser</span></button>
  <button class="shortcut" data-app="files"><span class="emoji">📁</span><span>Files</span></button>
  <button class="shortcut" data-app="settings"><span class="emoji">⚙️</span><span>Settings</span></button>
 </div>

 <section class="window" id="home" style="z-index:20">
  <header class="titlebar"><span>🖥️</span><span class="windowtitle">Desktop Hub</span>
   <div class="controls">
    <button data-min="home">—</button><button data-max="home">□</button><button data-close="home">×</button>
   </div>
  </header>
  <div class="windowbody"><div class="content">
   <h1>Welcome to your desktop</h1>
   <p class="sub">Your apps, files, and web browsing in one place.</p>
   <form class="searchrow" id="searchForm">
    <input id="searchInput" maxlength="200" placeholder="Search the web or enter a website">
    <button class="action">Search</button>
   </form>
   <div class="grid">
    <button class="appcard" data-app="browser"><span class="emoji">🌐</span><strong>Web Browser</strong><p>Visit websites</p></button>
    <button class="appcard" data-app="files"><span class="emoji">📁</span><strong>File Explorer</strong><p>Workspace folders</p></button>
    <button class="appcard" data-app="settings"><span class="emoji">⚙️</span><strong>Settings</strong><p>Change appearance</p></button>
    <button class="appcard" data-site="https://www.wikipedia.org"><span class="emoji">📚</span><strong>Wikipedia</strong><p>Knowledge</p></button>
    <button class="appcard" data-site="https://www.youtube.com"><span class="emoji">▶️</span><strong>YouTube</strong><p>Videos</p></button>
    <button class="appcard" data-site="https://github.com"><span class="emoji">💻</span><strong>GitHub</strong><p>Code and projects</p></button>
   </div>
   <div class="results" id="searchResults"></div>
  </div></div>
 </section>

 <section class="window hidden" id="browser">
  <header class="titlebar"><span>🌐</span><span class="windowtitle">Web Browser</span>
   <div class="controls">
    <button data-min="browser">—</button><button data-max="browser">□</button><button data-close="browser">×</button>
   </div>
  </header>
  <div class="windowbody">
   <form class="toolbar" id="browserForm">
    <button type="button" id="browserBack">⌂</button>
    <input id="address" placeholder="https://example.com">
    <button class="action">Go</button>
   </form>
   <div class="status" id="browserStatus">Enter a website address.</div>
   <div class="browserbody" id="browserBody">
    <div class="hint">Enter a website address above to get started.</div>
   </div>
  </div>
 </section>

 <section class="window hidden" id="files">
  <header class="titlebar"><span>📁</span><span class="windowtitle">File Explorer</span>
   <div class="controls">
    <button data-min="files">—</button><button data-max="files">□</button><button data-close="files">×</button>
   </div>
  </header>
  <div class="windowbody"><div class="content">
   <h1>File Explorer</h1><p class="sub">Desktop workspace</p>
   <div class="fileitem">🖥️ &nbsp; Desktop</div>
   <div class="fileitem">📄 &nbsp; Documents</div>
   <div class="fileitem">⬇️ &nbsp; Downloads</div>
   <div class="fileitem">🖼️ &nbsp; Pictures</div>
   <p class="sub">These are visual shortcuts, not your computer's actual files.</p>
  </div></div>
 </section>

 <section class="window hidden" id="settings">
  <header class="titlebar"><span>⚙️</span><span class="windowtitle">Settings</span>
   <div class="controls">
    <button data-min="settings">—</button><button data-max="settings">□</button><button data-close="settings">×</button>
   </div>
  </header>
  <div class="windowbody"><div class="content">
   <h1>Settings</h1><p class="sub">Desktop preferences</p>
   <div class="setting"><strong>Appearance</strong><p class="sub">Change the desktop wallpaper.</p>
    <button class="action" id="wallpaper">Change wallpaper</button>
   </div>
   <div class="setting"><strong>Web browsing</strong><p class="sub">Some sites block embedded windows. Use the open-in-new-tab link when needed.</p></div>
  </div></div>
 </section>

 <div class="startmenu" id="startMenu">
  <h3>Desktop apps</h3>
  <div class="startgrid">
   <button data-app="home">🖥️<br>Desktop</button>
   <button data-app="browser">🌐<br>Browser</button>
   <button data-app="files">📁<br>Files</button>
   <button data-app="settings">⚙️<br>Settings</button>
  </div>
 </div>

 <footer class="taskbar">
  <button id="startButton">⊞ Start</button>
  <button data-app="home">🖥️</button>
  <button data-app="browser">🌐</button>
  <button data-app="files">📁</button>
  <button data-app="settings">⚙️</button>
  <span class="clock" id="clock"></span>
 </footer>
</div>

<script>
const $ = s => document.querySelector(s);
let topZ = 30;
const savedSizes = new Map();

function showApp(id) {
 const el = document.getElementById(id);
 if (!el) return;
 el.classList.remove("hidden");
 el.style.zIndex = ++topZ;
 $("#startMenu").classList.remove("open");
}

function hideApp(id) {
 const el = document.getElementById(id);
 if (el) el.classList.add("hidden");
}

function openSite(raw) {
 const value = String(raw || "").trim();
 if (!value) return;

 let url;
 try {
  url = new URL(
   value.startsWith("http://") || value.startsWith("https://")
    ? value : "https://" + value
  );
  if (url.protocol !== "http:" && url.protocol !== "https:") throw Error();
 } catch {
  showApp("browser");
  $("#browserStatus").textContent = "Enter a valid website address.";
  return;
 }

 showApp("browser");
 $("#address").value = url.href;
 $("#browserStatus").textContent = "Opening " + url.hostname + "…";

 const body = $("#browserBody");
 body.replaceChildren();

 const frame = document.createElement("iframe");
 frame.className = "webframe";
 frame.title = "Website preview";
 frame.referrerPolicy = "no-referrer";
 frame.src = url.href;
 body.append(frame);

 const hint = document.createElement("div");
 hint.className = "hint";
 const message = document.createElement("p");
 message.textContent = "If the site is blank, it may block embedded browsing.";
 const link = document.createElement("a");
 link.href = url.href;
 link.target = "_blank";
 link.rel = "noopener noreferrer";
 link.textContent = "Open " + url.hostname + " in a new browser tab ↗";
 hint.append(message, link);
 body.append(hint);

 frame.addEventListener("load", () => {
  $("#browserStatus").textContent = "Website opened: " + url.hostname +
   ". If blank, use the new-tab link below.";
 });
}

document.addEventListener("click", e => {
 const appButton = e.target.closest("[data-app]");
 if (appButton) showApp(appButton.dataset.app);

 const siteButton = e.target.closest("[data-site]");
 if (siteButton) openSite(siteButton.dataset.site);

 const close = e.target.closest("[data-close]");
 if (close) hideApp(close.dataset.close);

 const min = e.target.closest("[data-min]");
 if (min) hideApp(min.dataset.min);

 const max = e.target.closest("[data-max]");
 if (max) {
  const el = document.getElementById(max.dataset.max);
  if (!el) return;

  if (el.dataset.maxed === "yes") {
   const old = savedSizes.get(el.id);
   if (old) Object.assign(el.style, old);
   el.dataset.maxed = "no";
  } else {
   savedSizes.set(el.id, {
    left: el.style.left,
    top: el.style.top,
    width: el.style.width,
    height: el.style.height
   });
   Object.assign(el.style, {
    left:"0", top:"0", width:"100%", height:"calc(100% - 52px)"
   });
   el.dataset.maxed = "yes";
  }
  el.style.zIndex = ++topZ;
 }

 if (e.target.closest("#startButton")) {
  $("#startMenu").classList.toggle("open");
 }
});

$("#browserBack").addEventListener("click", () => showApp("home"));

$("#browserForm").addEventListener("submit", e => {
 e.preventDefault();
 openSite($("#address").value);
});

$("#searchForm").addEventListener("submit", async e => {
 e.preventDefault();
 const q = $("#searchInput").value.trim();
 if (!q) return;

 if (!q.includes(" ")) {
  try {
   const candidate = new URL(
    q.startsWith("http://") || q.startsWith("https://")
     ? q : "https://" + q
   );
   if (candidate.hostname.includes(".")) {
    openSite(candidate.href);
    return;
   }
  } catch {}
 }

 const output = $("#searchResults");
 output.textContent = "Searching…";

 try {
  const response = await fetch("/api/search?q=" + encodeURIComponent(q));
  const data = await response.json();
  if (!response.ok) throw Error(data.error || "Search failed.");

  output.replaceChildren();
  const heading = document.createElement("h2");
  heading.textContent = "Search results";
  output.append(heading);

  for (const item of data.results) {
   const article = document.createElement("article");
   const link = document.createElement("a");
   link.href = item.url;
   link.target = "_blank";
   link.rel = "noopener noreferrer";
   link.textContent = item.title;

   const description = document.createElement("p");
   description.textContent = item.snippet || item.url;
   article.append(link, description);
   output.append(article);
  }

  if (!data.results.length) {
   output.append("No results found. Try a different search.");
  }
 } catch (err) {
  output.textContent = err.message || "Search failed. Try again.";
 }
});

$("#wallpaper").addEventListener("click", () => {
 const desktop = $("#desktop");
 desktop.dataset.alt = desktop.dataset.alt === "yes" ? "no" : "yes";
 desktop.style.background = desktop.dataset.alt === "yes"
  ? "linear-gradient(135deg,#102d35,#146b65,#543f91)"
  : "radial-gradient(ellipse at 20% 20%,#315a9b,transparent 42%),radial-gradient(ellipse at 80% 70%,#543f91,transparent 40%),linear-gradient(135deg,#10172b,#182b4c 55%,#111827)";
});

document.querySelectorAll(".titlebar").forEach(bar => {
 let moving = false;
 let sx = 0, sy = 0, ox = 0, oy = 0;

 bar.addEventListener("pointerdown", e => {
  if (e.target.closest("button")) return;
  const win = bar.closest(".window");
  if (win.dataset.maxed === "yes") return;

  moving = true;
  sx = e.clientX;
  sy = e.clientY;
  ox = win.offsetLeft;
  oy = win.offsetTop;
  win.style.zIndex = ++topZ;
  bar.setPointerCapture(e.pointerId);
 });

 bar.addEventListener("pointermove", e => {
  if (!moving) return;
  const win = bar.closest(".window");
  win.style.left = Math.max(0, Math.min(
   window.innerWidth - win.offsetWidth, ox + e.clientX - sx
  )) + "px";
  win.style.top = Math.max(0, Math.min(
   window.innerHeight - 90, oy + e.clientY - sy
  )) + "px";
 });

 bar.addEventListener("pointerup", () => moving = false);
 bar.addEventListener("pointercancel", () => moving = false);
});

function updateClock() {
 $("#clock").textContent = new Date().toLocaleString([], {
  weekday:"short", hour:"2-digit", minute:"2-digit"
 });
}
updateClock();
setInterval(updateClock, 30000);
</script>
</body>
</html>`;
Part 2 of 2 — Server and search
Now paste this directly after Part 1, without deleting anything from Part 1.


javascript

app.get("/", (_req, res) => {
 res.type("html").send(page);
});

app.get("/api/search", async (req, res) => {
 const q = String(req.query.q || "").trim().slice(0, 200);

 if (!q) {
  return res.status(400).json({ error: "Enter a search." });
 }

 try {
  const response = await fetch(
   "https://html.duckduckgo.com/html/?q=" + encodeURIComponent(q),
   {
    signal: AbortSignal.timeout(10000),
    headers: { "User-Agent": "Mozilla/5.0" }
   }
  );

  if (!response.ok) {
   throw new Error("Search provider unavailable.");
  }

  const html = await response.text();
  const results = [];
  const pattern =
   /<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;

  let match;

  while ((match = pattern.exec(html)) && results.length < 10) {
   try {
    let href = match[1]
     .replace(/&amp;/g, "&")
     .replace(/&#x2F;/g, "/");

    let url = new URL(href, "https://html.duckduckgo.com");

    const redirect = url.searchParams.get("uddg");
    if (redirect) url = new URL(redirect);

    if (!["http:", "https:"].includes(url.protocol)) continue;

    const title = match[2]
     .replace(/<[^>]*>/g, "")
     .replace(/&amp;/g, "&")
     .replace(/&quot;/g, '"')
     .replace(/&#39;|&#x27;/g, "'")
     .replace(/&lt;/g, "<")
     .replace(/&gt;/g, ">")
     .trim();

    results.push({
     title: title.slice(0, 300) || url.hostname,
     url: url.href,
     snippet: ""
    });
   } catch {
    // Skip malformed search results.
   }
  }

  res.json({ results });
 } catch (err) {
  console.error("Search error:", err.message);

  res.status(502).json({
   error: "Search is unavailable right now. Try again shortly."
  });
 }
});

app.get("/health", (_req, res) => {
 res.json({ ok: true });
});

app.listen(PORT, "0.0.0.0", () => {
 console.log("Desktop OS running on port " + PORT);
 console.log("Open http://localhost:" + PORT);
});
