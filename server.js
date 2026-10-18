import express from "express";
import rateLimit from "express-rate-limit";

const app = express();
const PORT = process.env.PORT || 3000;

app.disable("x-powered-by");
app.use(express.json({ limit: "2kb" }));
app.use("/api", rateLimit({ windowMs: 60_000, limit: 30 }));

const page = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Desktop OS</title>
<style>
*{box-sizing:border-box}
body{margin:0;font:14px Arial;color:#f5f7ff}
button,input{font:inherit}
button{cursor:pointer}
.desktop{
 height:100vh;overflow:hidden;position:relative;
 background:radial-gradient(ellipse at 20% 20%,#315a9b,transparent 42%),
 radial-gradient(ellipse at 80% 70%,#543f91,transparent 40%),
 linear-gradient(135deg,#10172b,#182b4c 55%,#111827)
}
.desktop-icons{position:absolute;top:18px;left:14px;display:grid;gap:8px}
.shortcut{width:82px;border:1px solid transparent;background:transparent;
 color:white;border-radius:9px;padding:9px 4px;display:flex;
 flex-direction:column;align-items:center;gap:7px}
.shortcut:hover{background:#ffffff18}
.appicon{font-size:29px;line-height:1.3}
.shortcut span:last-child{font-size:12px}
.taskbar{position:absolute;bottom:0;left:0;right:0;height:54px;
 display:flex;align-items:center;justify-content:center;gap:8px;
 background:#111827ef;border-top:1px solid #ffffff25;z-index:1000}
.taskbutton{border:0;border-radius:9px;background:#ffffff12;color:white;padding:9px 13px}
.taskbutton:hover,.taskbutton.active{background:#ffffff30}
.clock{position:absolute;right:16px;font-size:12px}
.startmenu{display:none;position:absolute;bottom:64px;left:50%;
 transform:translateX(-50%);width:min(360px,94vw);padding:20px;
 background:#1b2438f5;border:1px solid #ffffff25;border-radius:16px;z-index:1100}
.startmenu.open{display:block}
.startgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.startgrid button{border:0;border-radius:10px;padding:15px 4px;background:#ffffff10;color:white}
.window{position:absolute;z-index:10;left:12%;top:9%;
 width:min(850px,84vw);height:min(570px,78vh);min-width:290px;
 min-height:230px;display:flex;flex-direction:column;
 background:#f5f7fb;color:#172033;border:1px solid #ffffff66;
 border-radius:12px;overflow:hidden;box-shadow:0 22px 70px #0006}
.window.hidden{display:none}
.titlebar{height:44px;flex-shrink:0;display:flex;align-items:center;
 gap:12px;padding:0 12px;background:#e7ebf3;
 border-bottom:1px solid #d4dae5;cursor:move;user-select:none}
.windowtitle{font-size:13px;font-weight:600;flex:1}
.wincontrols{display:flex;gap:6px}
.wincontrols button{width:29px;height:27px;border:0;border-radius:6px;background:#d7deea;color:#172033}
.wincontrols button:last-child{background:#d95361;color:white}
.windowbody{flex:1;min-height:0;display:flex;flex-direction:column}
.homeview{overflow:auto;padding:24px;flex:1}
.homeview h1{font-size:27px;margin:0 0 8px}
.sub{color:#657087;font-size:14px;line-height:1.6}
.searchrow{display:flex;gap:8px;margin:22px 0}
.searchrow input{min-width:0;flex:1;padding:13px;border:1px solid #ccd4e2;border-radius:9px}
.action{border:0;background:#356ac0;color:white;border-radius:8px;padding:11px 15px}
.action:hover{background:#2857a1}
.appgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(125px,1fr));gap:12px}
.appcard{padding:15px 12px;text-align:left;border:1px solid #dce2ec;background:white;color:#172033;border-radius:12px}
.appcard:hover{background:#edf3ff;border-color:#a9c3ef}
.appcard .appicon{display:block;margin-bottom:10px}
.appcard strong{font-size:13px}
.appcard p{font-size:12px;color:#69748a;margin-bottom:0}
.toolbar{display:flex;align-items:center;gap:7px;padding:10px;background:#edf0f6;border-bottom:1px solid #d8deea}
.toolbar button{border:0;border-radius:7px;padding:9px 11px;background:#dce3ef;color:#243149}
.toolbar input{width:100%;min-width:0;border:1px solid #cbd3e0;border-radius:8px;background:white;color:#172033;padding:10px}
.browserstatus{padding:8px 12px;font-size:12px;color:#68758b;background:#f5f7fb;border-bottom:1px solid #e0e5ed;overflow-wrap:anywhere}
.browserbody{flex:1;min-height:0;display:flex;flex-direction:column;background:white;overflow:auto}
.webframe{width:100%;height:100%;flex:1;border:0;background:white;min-height:300px}
.browserhint{padding:20px;color:#27344c;font-size:14px;line-height:1.7;overflow:auto}
.browserhint a{color:#245fba;overflow-wrap:anywhere}
.filelist{display:grid;gap:8px}
.fileitem{padding:13px;border:1px solid #e0e5ed;background:white;border-radius:8px}
.settingsrow{padding:14px 0;border-bottom:1px solid #e0e5ed}
.searchresults{margin-top:20px}
.searchresults article{padding:12px 0;border-bottom:1px solid #e0e5ed;overflow-wrap:anywhere}
.searchresults a{color:#215db2;font-size:17px;text-decoration:none}
.searchresults p{font-size:13px;color:#5d687c;line-height:1.6}
@media(max-width:600px){
 .window{left:3%;top:5%;width:94%;height:82vh}
 .desktop-icons{left:5px;top:8px}
 .taskbar{justify-content:flex-start;overflow-x:auto}
 .clock{display:none}.homeview{padding:17px}
 .toolbar{gap:5px;padding:7px}
}
</style>
</head>
<body>
<div class="desktop" id="desktop">
 <div class="desktop-icons">
  <button class="shortcut" data-app="home"><span class="appicon">🖥️</span><span>This PC</span></button>
  <button class="shortcut" data-app="browser"><span class="appicon">🌐</span><span>Browser</span></button>
  <button class="shortcut" data-app="files"><span class="appicon">📁</span><span>Files</span></button>
  <button class="shortcut" data-app="settings"><span class="appicon">⚙️</span><span>Settings</span></button>
 </div>

 <section class="window" id="home" style="z-index:20">
  <header class="titlebar"><span>🖥️</span><span class="windowtitle">Desktop Hub</span>
   <div class="wincontrols">
    <button data-min="home">—</button><button data-max="home">□</button><button data-close="home">×</button>
   </div>
  </header>
  <div class="windowbody"><div class="homeview">
   <h1>Welcome to your desktop</h1>
   <p class="sub">Your apps, files, and web browsing in one place.</p>
   <form class="searchrow" id="searchForm">
    <input id="searchInput" maxlength="200" placeholder="Search the web or enter a website">
    <button class="action">Search</button>
   </form>
   <div class="appgrid">
    <button class="appcard" data-app="browser"><span class="appicon">🌐</span><strong>Web Browser</strong><p>Visit websites</p></button>
    <button class="appcard" data-app="files"><span class="appicon">📁</span><strong>File Explorer</strong><p>Your workspace</p></button>
    <button class="appcard" data-app="settings"><span class="appicon">⚙️</span><strong>Settings</strong><p>Desktop preferences</p></button>
    <button class="appcard" data-site="https://www.wikipedia.org"><span class="appicon">📚</span><strong>Wikipedia</strong><p>Knowledge</p></button>
    <button class="appcard" data-site="https://www.youtube.com"><span class="appicon">▶️</span><strong>YouTube</strong><p>Videos</p></button>
    <button class="appcard" data-site="https://github.com"><span class="appicon">💻</span><strong>GitHub</strong><p>Code and projects</p></button>
   </div>
   <div class="searchresults" id="searchResults"></div>
  </div></div>
 </section>

 <section class="window hidden" id="browser">
  <header class="titlebar"><span>🌐</span><span class="windowtitle">Web Browser</span>
   <div class="wincontrols"><button data-min="browser">—</button><button data-max="browser">□</button><button data-close="browser">×</button></div>
  </header>
  <div class="windowbody">
   <form class="toolbar" id="browserForm">
    <button type="button" id="browserBack">⌂</button>
    <input id="address" placeholder="https://example.com">
    <button class="action">Go</button>
   </form>
   <div class="browserstatus" id="browserStatus">Ready. Enter a website address.</div>
   <div class="browserbody" id="browserBody">
    <div class="browserhint"><h2>Your browser</h2><p>Enter a website address above.</p></div>
   </div>
  </div>
 </section>

 <section class="window hidden" id="files">
  <header class="titlebar"><span>📁</span><span class="windowtitle">File Explorer</span>
   <div class="wincontrols"><button data-min="files">—</button><button data-max="files">□</button><button data-close="files">×</button></div>
  </header>
  <div class="windowbody"><div class="homeview">
   <h1>File Explorer</h1><p class="sub">Desktop workspace</p>
   <div class="filelist">
    <div class="fileitem">🖥️ &nbsp; Desktop</div>
    <div class="fileitem">📄 &nbsp; Documents</div>
    <div class="fileitem">⬇️ &nbsp; Downloads</div>
    <div class="fileitem">🖼️ &nbsp; Pictures</div>
   </div>
   <p class="sub">These are visual shortcuts, not your actual computer files.</p>
  </div></div>
 </section>

 <section class="window hidden" id="settings">
  <header class="titlebar"><span>⚙️</span><span class="windowtitle">Settings</span>
   <div class="wincontrols"><button data-min="settings">—</button><button data-max="settings">□</button><button data-close="settings">×</button></div>
  </header>
  <div class="windowbody"><div class="homeview">
   <h1>Settings</h1><p class="sub">Desktop preferences</p>
   <div class="settingsrow"><strong>Appearance</strong><p class="sub">Dark blue desktop theme</p><button class="action" id="wallpaper">Change wallpaper</button></div>
   <div class="settingsrow"><strong>Web browsing</strong><p class="sub">Some websites block embedded browsing. Open them in a separate tab if needed.</p></div>
  </div></div>
 </section>

 <div class="startmenu" id="startMenu">
  <h2>Desktop apps</h2>
  <div class="startgrid">
   <button data-app="home">🖥️<br>Desktop</button>
   <button data-app="browser">🌐<br>Browser</button>
   <button data-app="files">📁<br>Files</button>
   <button data-app="settings">⚙️<br>Settings</button>
  </div>
 </div>

 <footer class="taskbar">
  <button class="taskbutton" id="startButton">⊞</button>
  <button class="taskbutton" data-app="home">🖥️</button>
  <button class="taskbutton" data-app="browser">🌐</button>
  <button class="taskbutton" data-app="files">📁</button>
  <button class="taskbutton" data-app="settings">⚙️</button>
  <div class="clock" id="clock"></div>
 </footer>
</div>

<script>
const $ = s => document.querySelector(s);
let topZ = 30;
const positions = new Map();

function showApp(id) {
 const el = document.getElementById(id);
 if (!el) return;
 el.classList.remove("hidden");
 el.style.zIndex = ++topZ;
 $("#startMenu").classList.remove("open");
 document.querySelectorAll(".taskbutton[data-app]").forEach(b =>
  b.classList.toggle("active", b.dataset.app === id)
 );
}
function hideApp(id) {
 const el = document.getElementById(id);
 if (el) el.classList.add("hidden");
}
function openSite(raw) {
 let url;
 try {
  const value = raw.trim();
  if (!value) return;
  url = new URL(/^[a-zA-Z][a-zA-Z\\d+.-]*:/.test(value) ? value : "https://" + value);
  if (!["http:","https:"].includes(url.protocol)) throw Error();
 } catch {
  showApp("browser");
  $("#browserStatus").textContent = "Enter a valid website address.";
  return;
 }

 showApp("browser");
 $("#address").value = url.href;
 $("#browserStatus").textContent = "Opening " + url.hostname;
 const body = $("#browserBody");
 body.replaceChildren();

 const frame = document.createElement("iframe");
 frame.className = "webframe";
 frame.title = "Website preview";
 frame.referrerPolicy = "no-referrer";
 frame.src = url.href;
 body.append(frame);

 const hint = document.createElement("div");
 hint.className = "browserhint";
 hint.innerHTML = "<strong>If the site doesn't appear</strong><p>Some websites block embedded browsing. Use the link below to open the full site.</p>";

 const link = document.createElement("a");
 link.href = url.href;
 link.target = "_blank";
 link.rel = "noopener noreferrer";
 link.textContent = "Open " + url.hostname + " in a new tab ↗";
 hint.append(link);
 body.append(hint);
}
</script>
</body>
</html>`;
Keep Part 1. Copy Part 2 below and place it immediately after the last line of Part 1.

Part 2 of 2 — Server and search

javascript

app.get("/", (_req, res) => res.type("html").send(page));

app.get("/api/search", async (req, res) => {
 const q = String(req.query.q || "").trim().slice(0,200);
 if (!q) return res.status(400).json({error:"Enter a search."});

 try {
  const response = await fetch(
   "https://html.duckduckgo.com/html/?q=" + encodeURIComponent(q),
   {
    signal: AbortSignal.timeout(10000),
    headers: {"User-Agent":"Mozilla/5.0"}
   }
  );

  if (!response.ok) throw Error("Search provider unavailable");

  const html = await response.text();
  const results = [];
  const pattern = /<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  let match;

  while ((match = pattern.exec(html)) && results.length < 10) {
   let url;

   try {
    url = new URL(
     match[1].replace(/&amp;/g, "&"),
     "https://html.duckduckgo.com"
    );

    const destination = url.searchParams.get("uddg");
    if (destination) url = new URL(destination);

    if (!["http:","https:"].includes(url.protocol)) continue;
   } catch {
    continue;
   }

   const title = match[2]
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

   results.push({
    title: title.slice(0,300),
    url: url.href,
    snippet: ""
   });
  }

  res.json({results});
 } catch {
  res.status(502).json({
   error: "Search is temporarily unavailable. Try again shortly."
  });
 }
});

app.get("/health", (_req,res) => res.json({ok:true}));

app.listen(PORT, "0.0.0.0", () => {
 console.log("Desktop OS running on port " + PORT);
});document.addEventListener("click", e => {
 const app = e.target.closest("[data-app]");
 if (app) showApp(app.dataset.app);

 const site = e.target.closest("[data-site]");
 if (site) openSite(site.dataset.site);

 const close = e.target.closest("[data-close]");
 if (close) hideApp(close.dataset.close);

 const min = e.target.closest("[data-min]");
 if (min) hideApp(min.dataset.min);

 const max = e.target.closest("[data-max]");
 if (max) {
  const el = document.getElementById(max.dataset.max);
  if (!el) return;

  if (el.dataset.maxed === "yes") {
   const p = positions.get(el.id);
   if (p) Object.assign(el.style, p);
   el.dataset.maxed = "no";
  } else {
   positions.set(el.id, {
    left: el.style.left || getComputedStyle(el).left,
    top: el.style.top || getComputedStyle(el).top,
    width: el.style.width || getComputedStyle(el).width,
    height: el.style.height || getComputedStyle(el).height
   });

   Object.assign(el.style, {
    left:"0", top:"0", width:"100%", height:"calc(100% - 54px)"
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

 if (/^(https?:\/\/)?[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(q)) {
  openSite(q);
  return;
 }

 $("#searchResults").textContent = "Searching...";

 try {
  const r = await fetch("/api/search?q=" + encodeURIComponent(q));
  const data = await r.json();
  if (!r.ok) throw Error(data.error || "Search failed");

  const results = $("#searchResults");
  results.replaceChildren();

  const heading = document.createElement("h2");
  heading.textContent = "Search results";
  results.append(heading);

  for (const item of data.results) {
   const article = document.createElement("article");
   const a = document.createElement("a");

   a.href = item.url;
   a.target = "_blank";
   a.rel = "noopener noreferrer";
   a.textContent = item.title;

   const p = document.createElement("p");
   p.textContent = item.snippet;

   article.append(a,p);
   results.append(article);
  }

  if (!data.results.length) results.append("No results found.");
 } catch (err) {
  $("#searchResults").textContent = err.message || "Search is unavailable.";
 }
});

$("#wallpaper").addEventListener("click", () => {
 const d = $(".desktop");

 d.style.background = d.dataset.alt === "yes"
  ? "linear-gradient(135deg,#10172b,#182b4c,#111827)"
  : "linear-gradient(135deg,#102d35,#146b65,#543f91)";

 d.dataset.alt = d.dataset.alt === "yes" ? "no" : "yes";
});

document.querySelectorAll(".titlebar").forEach(bar => {
 let sx, sy, ox, oy, moving = false;

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

  win.style.left = Math.max(
   0, Math.min(innerWidth - win.offsetWidth, ox + e.clientX - sx)
  ) + "px";

  win.style.top = Math.max(
   0, Math.min(innerHeight - 100, oy + e.clientY - sy)
  ) + "px";
 });

 bar.addEventListener("pointerup", () => moving = false);
 bar.addEventListener("pointercancel", () => moving = false);
});

function updateClock() {
 $("#clock").textContent = new Date().toLocaleString([], {
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit"
 });
}

updateClock();
setInterval(updateClock, 30000);
