
import express from "express";
import rateLimit from "express-rate-limit";
import sanitizeHtml from "sanitize-html";
import dns from "node:dns/promises";
import net from "node:net";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "2kb" }));
app.use("/api", rateLimit({ windowMs: 60_000, limit: 20 }));

<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Google Search</title>
<style>
*{box-sizing:border-box}
:root{color-scheme:light}
html,body{margin:0;min-height:100%;font:14px Arial,sans-serif;color:#202124;background:#fff}
body{min-height:100vh}
.desktop{min-height:100vh;position:relative;background:#fff}
.wallpaper,.orb,.shortcuts,.dockwrap{display:none}
.topbar{height:60px;display:flex;align-items:center;justify-content:flex-end;padding:0 28px;gap:20px}
.brand{color:#5f6368;font-size:13px;font-weight:400;letter-spacing:0}
.system{font-size:12px;color:#5f6368}
.window{position:relative;top:auto;left:auto;transform:none;width:100%;height:auto;min-height:calc(100vh - 60px);background:#fff;border:0;border-radius:0;box-shadow:none;overflow:visible;display:flex;flex-direction:column;backdrop-filter:none}
.window.hidden{display:none}
#searchWindow{min-height:calc(100vh - 60px)}
.titlebar{display:none}
.content{padding:0 24px 40px;overflow:visible;flex:1}
.hero{text-align:center;margin:105px auto 0;max-width:650px}
.logo{font-size:0;font-weight:400;text-shadow:none;margin:0 auto 24px;display:flex;align-items:center;justify-content:center;letter-spacing:-5px}
.logo:before{content:"G";font-size:88px;font-weight:500;letter-spacing:-5px;background:conic-gradient(from -45deg,#4285f4 0deg 90deg,#34a853 90deg 150deg,#fbbc05 150deg 210deg,#ea4335 210deg 270deg,#4285f4 270deg 360deg);background-clip:text;-webkit-background-clip:text;color:transparent}
h1{font-size:0;margin:0}
h1 span{color:inherit}
.muted{color:#5f6368;line-height:1.6}
.hero>.muted{display:none}
.searchform{display:flex;gap:0;align-items:center;width:min(584px,100%);margin:26px auto 28px;position:relative}
.searchform:before{content:"";position:absolute;left:17px;width:17px;height:17px;border:2px solid #9aa0a6;border-radius:50%;pointer-events:none}
.searchform:after{content:"";position:absolute;left:34px;top:30px;width:8px;height:2px;background:#9aa0a6;transform:rotate(45deg);pointer-events:none}
input{font:16px Arial,sans-serif;color:#202124;background:#fff;border:1px solid #dfe1e5;border-radius:24px;padding:13px 45px;min-width:0;outline:none}
input:focus{border-color:transparent;box-shadow:0 1px 6px #20212447}
.searchform input{flex:1;width:100%;height:46px;border-radius:24px;padding-left:48px;padding-right:18px}
.searchform:hover input{box-shadow:0 1px 6px #20212447;border-color:transparent}
button.primary{border:1px solid #f8f9fa;border-radius:4px;padding:10px 16px;background:#f8f9fa;color:#3c4043;font-size:14px;font-weight:400;cursor:pointer}
button.primary:hover{border-color:#dadce0;box-shadow:0 1px 1px #00000010}
.searchform button{position:absolute;left:-9999px}
.searchform:focus-within button{position:static;margin-left:10px}
.quicklinks{display:flex;justify-content:center;gap:12px;flex-wrap:wrap;margin:0 auto}
.quicklinks a{padding:10px 15px;border:1px solid transparent;background:#f8f9fa;border-radius:4px;color:#3c4043;text-decoration:none;font-size:14px}
.quicklinks a:hover{border-color:#dadce0;box-shadow:0 1px 1px #00000010}
.sectiontitle{font-size:14px;color:#70757a;letter-spacing:0;margin:22px 0}
.results{max-width:600px;margin:36px auto 0;line-height:1.58;overflow-wrap:anywhere}
.results .result{padding:8px 0 18px;border:0}
.results a{color:#1a0dab;font-size:20px;text-decoration:none}
.results a:hover{text-decoration:underline}
.results .result__url{font-size:14px;color:#202124}
.results .result__snippet{font-size:14px;color:#4d5156;margin-top:4px}
.results h2,.results h3{font-size:18px;font-weight:400}
.results .no-results{color:#5f6368}
.browserbar{display:flex;gap:8px;padding:12px 24px;border-bottom:1px solid #dadce0}
.browserbar input{flex:1;border-radius:24px}
.browserbody{padding:24px;overflow:auto;flex:1;overflow-wrap:anywhere;line-height:1.7}
.browserbody a{color:#1a73e8}
.browserbody img{max-width:100%;height:auto}
.browserbody table{max-width:100%;display:block;overflow:auto}
.status{font-size:12px;color:#5f6368;margin:12px 0;overflow-wrap:anywhere}
.footerhint{font-size:12px;color:#70757a;text-align:center;margin-top:30px}
#browserWindow,#aboutWindow{max-width:100%;min-height:calc(100vh - 60px)}
@media(max-width:600px){
 .topbar{height:48px;padding:0 16px}
 .window,#searchWindow{min-height:calc(100vh - 48px)}
 .content{padding:0 18px 30px}
 .hero{margin-top:100px}
 .logo:before{font-size:76px}
 .searchform{flex-direction:row}
 .searchform input{width:100%}
 .searchform button{display:none}
 .quicklinks{gap:8px}
 .quicklinks a{padding:10px 12px}
 .results{margin-top:30px}
 .browserbar{padding:12px}
 .browserbody{padding:16px}
}
</style>
</head>
<body>
<div class="desktop">
<div class="topbar">
 <div class="brand">Web Search</div>
 <div class="system" id="clock">Ready</div>
</div>

<section class="window" id="searchWindow">
 <div class="content">
  <div class="hero">
   <div class="logo" aria-label="Google">Google</div>
   <h1>Google <span>Search</span></h1>
   <form class="searchform" action="/search" method="get">
    <input name="q" id="q" type="search"
      placeholder="Search Google or type a URL"
      required maxlength="200" autocomplete="off"
      value="__QUERY__" aria-label="Search Google">
    <button class="primary" type="submit">Google Search</button>
   </form>
   <div class="quicklinks">
    <a href="https://www.google.com">Google</a>
    <a href="https://www.youtube.com">YouTube</a>
    <a href="https://www.wikipedia.org">Wikipedia</a>
    <a href="https://github.com">GitHub</a>
   </div>
  </div>
  <div id="resultsArea">__RESULTS__</div>
  <div class="footerhint">Search the web · Results provided by DuckDuckGo</div>
 </div>
</section>

<section class="window hidden" id="browserWindow">
 <div class="content">
  <form id="browserForm" class="browserbar">
   <input id="url" type="url" value="https://www.wikipedia.org"
     placeholder="https://example.com" required>
   <button class="primary" id="go" type="submit">Go</button>
   <button class="primary" type="button" data-open="searchWindow">Home</button>
  </form>
  <div class="browserbody">
   <p class="status" id="status">Enter a public website address and select Go.</p>
   <div id="result"></div>
  </div>
 </div>
</section>

<section class="window hidden" id="aboutWindow">
 <div class="content">
  <div class="hero">
   <div class="logo">Google</div>
   <h1>Web Search</h1>
   <p class="muted">A Google-inspired search interface powered by Express.</p>
   <button class="primary" data-open="searchWindow">Back to Search</button>
  </div>
 </div>
</section>

</div>
<script>
const $ = s => document.querySelector(s);

function openWindow(id) {
 document.querySelectorAll(".window").forEach(w => {
  w.classList.toggle("hidden",w.id!==id);
 });
}

document.querySelectorAll("[data-open]").forEach(el =>
 el.addEventListener("click",()=>openWindow(el.dataset.open))
);

function updateClock(){
 $("#clock").textContent=new Date().toLocaleString([],{
  weekday:"short",hour:"2-digit",minute:"2-digit"
 });
}
updateClock();
setInterval(updateClock,30000);

const browserForm=$("#browserForm");

async function openInDesktop(url){
 openWindow("browserWindow");
 $("#url").value=url;
 $("#go").disabled=true;
 $("#status").textContent="Loading website…";
 $("#result").replaceChildren();

 try{
  const r=await fetch("/api/fetch",{
   method:"POST",
   headers:{"Content-Type":"application/json"},
   body:JSON.stringify({url})
  });
  const d=await r.json();
  if(!r.ok)throw new Error(d.error||"Unable to load website.");
  $("#url").value=d.url;
  $("#status").textContent=d.title+" · "+d.url;
  const template=document.createElement("template");
  template.innerHTML=d.html;

  for(const a of template.content.querySelectorAll("a[href]")){
   try{
    const dest=new URL(a.getAttribute("href"),d.url);
    if(!["http:","https:"].includes(dest.protocol)){
     a.removeAttribute("href");continue;
    }
    a.href=dest.href;
    a.removeAttribute("target");
    a.rel="noopener noreferrer";
   }catch{a.removeAttribute("href");}
  }
  $("#result").replaceChildren(template.content);
 }catch(err){
  $("#status").textContent=err.message||"Unable to load website.";
 }finally{$("#go").disabled=false;}
}

browserForm.addEventListener("submit",e=>{
 e.preventDefault();
 openInDesktop($("#url").value.trim());
});

$("#result").addEventListener("click",e=>{
 const a=e.target.closest("a[href]");
 if(!a||!$("#result").contains(a))return;
 e.preventDefault();
 openInDesktop(a.href);
});

$("#resultsArea").addEventListener("click",e=>{
 const a=e.target.closest("a[href]");
 if(!a||!$("#resultsArea").contains(a))return;
 let dest;
 try{dest=new URL(a.href);}catch{return;}
 if(!["http:","https:"].includes(dest.protocol))return;
 e.preventDefault();
 openInDesktop(dest.href);
});

document.querySelector(".quicklinks").addEventListener("click",e=>{
 const a=e.target.closest("a[href]");
 if(!a)return;
 e.preventDefault();
 openInDesktop(a.href);
});

document.addEventListener("keydown",e=>{
 if(e.key==="Escape")openWindow("searchWindow");
});
</script>
</body>
</html>

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
