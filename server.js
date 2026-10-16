import express from "express";
import rateLimit from "express-rate-limit";
import sanitizeHtml from "sanitize-html";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "2kb" }));
app.use("/api", rateLimit({ windowMs: 60_000, limit: 20 }));

const page = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>google_classroom</title>
<style>
*{box-sizing:border-box}
body{margin:0;min-height:100vh;background:radial-gradient(ellipse at top,#30104e,#090711 65%);color:#f7f0ff;font:16px Arial,sans-serif;display:grid;place-items:center;padding:20px}
main{width:min(720px,100%)}
header{text-align:center;margin-bottom:35px}
.logo{font-size:48px;color:#bd78ff;text-shadow:0 0 30px #a342ff}
h1{font-size:42px;margin:10px 0;letter-spacing:-2px;overflow-wrap:anywhere}
h1 span{color:#b65bff}
p{color:#b5a5c8;line-height:1.7}
.panel{background:#130d20;border:1px solid #50306b;border-radius:18px;padding:24px;box-shadow:0 0 40px #8c32ff16}
label{display:block;font-size:12px;color:#c5a5e6;margin:14px 0 8px}
input{width:100%;padding:14px;border:1px solid #503764;border-radius:10px;background:#090711;color:white;font-size:15px}
button{width:100%;margin-top:16px;padding:14px;border:0;border-radius:10px;background:linear-gradient(100deg,#c044ff,#713bff);color:white;font-weight:bold;cursor:pointer}
button:disabled{opacity:.6}
#status{overflow-wrap:anywhere;color:#d6b5ff}
#result{background:#0b0912;border-radius:10px;padding:16px;overflow-wrap:anywhere;line-height:1.7}
#result a{color:#caa0ff}
@media(max-width:480px){h1{font-size:32px}.panel{padding:17px}}
</style>
</head>
<body><main>
<header><div class="logo">G</div><h1>google_<span>classroom</span></h1>
<p>Your web viewer. A clean, neon-powered experience.</p></header>
<section class="panel">
<form id="form">
<label for="url">WEBSITE ADDRESS</label>
<input id="url" type="url" required value="https://www.wikipedia.org" placeholder="https://example.com">
<button id="go">OPEN WEBSITE ↗</button>
</form>
<p id="status" role="status">Enter a public website address to get started.</p>
<div id="result"></div>
</section>
</main>
<script>
const $=s=>document.querySelector(s);
$("#form").addEventListener("submit",async e=>{
 e.preventDefault();
 $("#go").disabled=true;
 $("#status").textContent="Loading website…";
 $("#result").replaceChildren();
 try{
  const r=await fetch("/api/fetch",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url:$("#url").value})});
  const d=await r.json();
  if(!r.ok)throw Error(d.error||"Request failed");
  $("#status").textContent="Loaded: "+d.url+" — "+d.title;
  const box=$("#result");
  const template=document.createElement("template");
  template.innerHTML=d.html;
  for(const a of template.content.querySelectorAll("a[href]")){
   try{
    const dest=new URL(a.getAttribute("href"),d.url);
    if(!["http:","https:"].includes(dest.protocol)){a.removeAttribute("href");continue}
    a.href=dest.href;a.target="_blank";a.rel="noopener noreferrer";
   }catch{a.removeAttribute("href")}
  }
  box.append(template.content);
 }catch(err){$("#status").textContent=err.message}
 finally{$("#go").disabled=false}
});
</script>
</body></html>`;

app.get("/", (_req, res) => res.type("html").send(page));
app.get("/health", (_req, res) => res.json({ ok: true }));

app.post("/api/fetch", async (req, res) => {
  let target;
  try {
    target = new URL(String(req.body?.url || ""));
    if (!["http:", "https:"].includes(target.protocol) ||
        target.username || target.password ||
        target.port && !["80", "443"].includes(target.port)) {
      throw new Error();
    }

    const host = target.hostname.toLowerCase();
    if (
      host === "localhost" ||
      host.endsWith(".localhost") ||
      host.endsWith(".local") ||
      host === "metadata.google.internal"
    ) throw new Error();

    // This starter deliberately blocks IP-literal targets.
    if (host.startsWith("[") || /^[0-9.]+$/.test(host) || host.includes(":")) {
      throw new Error();
    }
  } catch {
    return res.status(400).json({ error: "Enter a valid public HTTP or HTTPS website address." });
  }

  try {
    const response = await fetch(target, {
      redirect: "error",
      signal: AbortSignal.timeout(8000),
      headers: { "user-agent": "GoogleClassroomViewer/1.0" }
    });

    if (!response.ok) {
      return res.status(502).json({ error: "Website returned HTTP " + response.status });
    }

    const type = response.headers.get("content-type") || "";
    if (!/^(text\/html|text\/plain|application\/xhtml\+xml)(;|$)/i.test(type)) {
      return res.status(415).json({ error: "Only HTML and text pages are supported." });
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
      source = "<pre>" + source.replace(/[&<>]/g, c => ({
        "&":"&amp;","<":"&lt;",">":"&gt;"
      })[c]) + "</pre>";
    }

    const titleMatch = source.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch
      ? titleMatch[1].replace(/<[^>]*>/g, "").slice(0, 200)
      : target.hostname;

    const html = sanitizeHtml(source, {
      allowedTags: [
        "h1","h2","h3","h4","p","div","span","br","hr",
        "ul","ol","li","blockquote","pre","code","strong",
        "b","em","i","table","thead","tbody","tr","th","td","a"
      ],
      allowedAttributes: { a: ["href","title"] },
      allowedSchemes: ["http","https"]
    });

    res.json({ url: target.href, title, html });
  } catch {
    res.status(502).json({
      error: "Couldn't load that site. It may block automated requests or require JavaScript."
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("google_classroom listening on port " + PORT);
});
