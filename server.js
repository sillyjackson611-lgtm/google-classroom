import express from "express";
import rateLimit from "express-rate-limit";
import sanitizeHtml from "sanitize-html";
import dns from "node:dns/promises";
import net from "node:net";

const app = express();
const PORT = process.env.PORT || 3000;

app.disable("x-powered-by");
app.use(express.json({ limit: "2kb" }));
app.use("/api", rateLimit({ windowMs: 60_000, limit: 20 }));

const page = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Google Search</title>
<style>
*{box-sizing:border-box}
body{margin:0;font:14px Arial,sans-serif;color:#202124;background:white;min-height:100vh}
.topbar{height:60px;display:flex;justify-content:flex-end;align-items:center;gap:20px;padding:0 28px}
.topbar a{color:#202124;text-decoration:none;font-size:13px}
.avatar{background:#1a73e8;color:white;border-radius:50%;width:34px;height:34px;display:grid;place-items:center;font-weight:bold}
.home{min-height:calc(100vh - 60px);display:flex;flex-direction:column}
.main{text-align:center;padding:95px 20px 30px;flex:1}
.logo{font-size:76px;font-weight:500;letter-spacing:-5px;margin-bottom:28px}
.b{color:#4285f4}.r{color:#ea4335}.y{color:#fbbc05}.g{color:#34a853}
.search{height:48px;width:min(584px,100%);border:1px solid #dfe1e5;border-radius:28px;display:flex;align-items:center;gap:12px;padding:0 16px;margin:auto}
.search:hover,.search:focus-within{box-shadow:0 1px 6px #20212447;border-color:transparent}
.glass{width:16px;height:16px;border:2px solid #9aa0a6;border-radius:50%;position:relative;flex-shrink:0}
.glass:after{content:"";position:absolute;width:7px;height:2px;background:#9aa0a6;right:-5px;bottom:-2px;transform:rotate(45deg)}
.search input{border:0;outline:0;flex:1;min-width:0;font-size:16px;background:transparent;color:#202124}
.buttons{display:flex;justify-content:center;gap:12px;margin:28px}
.btn{background:#f8f9fa;color:#3c4043;border:1px solid #f8f9fa;border-radius:4px;padding:10px 16px;cursor:pointer}
.btn:hover{border-color:#dadce0;box-shadow:0 1px 1px #0001}
.shortcuts{display:flex;justify-content:center;gap:12px;flex-wrap:wrap;margin:24px auto}
.shortcuts a{background:#f8f9fa;color:#3c4043;padding:10px 14px;border-radius:22px;text-decoration:none}
.results{width:min(650px,100%);margin:25px auto;text-align:left;padding:0 10px;overflow-wrap:anywhere}
.results-heading{color:#70757a;margin-bottom:24px}
.result{margin-bottom:25px}
.result a{color:#1a0dab;text-decoration:none;font-size:20px}
.result a:hover{text-decoration:underline}
.result__url{font-size:14px;margin:5px 0;color:#202124}
.result__snippet{color:#4d5156;font-size:14px;line-height:1.55;margin-top:5px}
.no-results{color:#5f6368;line-height:1.6}
.footer{background:#f2f2f2;color:#70757a;padding:16px 28px;margin-top:auto}
.footer a{color:#70757a;text-decoration:none;margin-right:18px}
.footer-bottom{border-top:1px solid #dadce0;margin-top:14px;padding-top:14px;display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap}
.browser{display:none;min-height:calc(100vh - 60px)}
.browser.active{display:block}
#home.hidden{display:none}
.browserbar{display:flex;gap:10px;padding:12px;border-bottom:1px solid #dadce0}
.browserbar input{flex:1;min-width:0;border:1px solid #dadce0;border-radius:25px;padding:12px}
.viewer{padding:20px;line-height:1.7;overflow-wrap:anywhere}
.viewer img{max-width:100%;height:auto}
.status{color:#5f6368}
@media(max-width:600px){
 .main{padding-top:90px}
 .logo{font-size:64px}
 .topbar{padding:0 16px}
 .footer{padding:15px}
}
</style>
</head>
<body>
<header class="topbar">
<a href="https://mail.google.com">Gmail</a>
<a href="https://images.google.com">Images</a>
<div class="avatar">G</div>
</header>

<main id="home" class="home">
<section class="main">
<div class="logo" aria-label="Google"><span class="b">G</span><span class="r">o</span><span class="y">o</span><span class="b">g</span><span class="g">l</span><span class="r">e</span></div>
<form action="/search" method="get">
<div class="search">
<span class="glass"></span>
<input name="q" id="q" type="search" maxlength="200" placeholder="Search Google or type a URL" value="__QUERY__" required>
</div>
<div class="buttons">
<button class="btn" type="submit">Google Search</button>
<button class="btn" type="button" id="lucky">I'm Feeling Lucky</button>
</div>
</form>
<nav class="shortcuts">
<a href="https://www.youtube.com">▶ YouTube</a>
<a href="https://www.wikipedia.org">Wikipedia</a>
<a href="https://github.com">GitHub</a>
<a href="https://www.reddit.com">Reddit</a>
</nav>
<div id="resultsArea">__RESULTS__</div>
</section>
<footer class="footer">
<div>Web Search</div>
<div class="footer-bottom">
<div><a href="https://about.google">About</a><a href="https://policies.google.com/privacy">Privacy</a><a href="https://policies.google.com/terms">Terms</a></div>
<span>Search results powered by DuckDuckGo</span>
</div>
</footer>
</main>

<section id="browser" class="browser">
<form id="browserForm" class="browserbar">
<button class="btn" id="back" type="button">← Home</button>
<input id="url" type="url" placeholder="https://example.com" required>
<button class="btn" id="go" type="submit">Go</button>
</form>
<div class="viewer">
<p id="status" class="status">Enter a public website address.</p>
<div id="result"></div>
</div>
</section>

<script>
const $=s=>document.querySelector(s);

function showHome(){
 $("#home").classList.remove("hidden");
 $("#browser").classList.remove("active");
 window.scrollTo(0,0);
}
function showBrowser(){
 $("#home").classList.add("hidden");
 $("#browser").classList.add("active");
 window.scrollTo(0,0);
}
$("#back").addEventListener("click",showHome);

async function openInDesktop(url){
 showBrowser();
 $("#url").value=url;
 $("#go").disabled=true;
 $("#status").textContent="Loading website...";
 $("#result").replaceChildren();

 try{
  const response=await fetch("/api/fetch",{
   method:"POST",
   headers:{"Content-Type":"application/json"},
   body:JSON.stringify({url})
  });
  const data=await response.json();
  if(!response.ok)throw new Error(data.error||"Unable to load website.");

  $("#url").value=data.url;
  $("#status").textContent=data.title+" · "+data.url;

  const template=document.createElement("template");
  template.innerHTML=data.html;

  for(const a of template.content.querySelectorAll("a[href]")){
   try{
    const dest=new URL(a.getAttribute("href"),data.url);
    if(!["http:","https:"].includes(dest.protocol)){
     a.removeAttribute("href");
     continue;
    }
    a.href=dest.href;
   }catch{a.removeAttribute("href");}
  }
  $("#result").replaceChildren(template.content);
 }catch(error){
  $("#status").textContent=error.message||"Unable to load website.";
 }finally{
  $("#go").disabled=false;
 }
}

$("#browserForm").addEventListener("submit",e=>{
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
 let u;
 try{u=new URL(a.href);}catch{return;}
 if(!["http:","https:"].includes(u.protocol))return;
 e.preventDefault();
 openInDesktop(u.href);
});

document.querySelector(".shortcuts").addEventListener("click",e=>{
 const a=e.target.closest("a[href]");
 if(!a)return;
 e.preventDefault();
 openInDesktop(a.href);
});

$("#lucky").addEventListener("click",async()=>{
 const q=$("#q").value.trim();
 if(!q){$("#q").focus();return;}
 try{
  const r=await fetch("/api/lucky?q="+encodeURIComponent(q));
  const d=await r.json();
  if(!r.ok)throw new Error();
  openInDesktop(d.url);
 }catch{
  const f=document.createElement("form");
  f.method="GET";
  f.action="/search";
  const i=document.createElement("input");
  i.name="q";i.value=q;
  f.append(i);document.body.append(f);f.submit();
 }
});
</script>
</body>
</html>`;

function escapeHtml(value) {
 return String(value).replace(/[&<>"']/g, c => ({
  "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
 })[c]);
}

function renderPage(query="",results="") {
 return page
  .replaceAll("__QUERY__",escapeHtml(query))
  .replace("__RESULTS__",results);
}

app.get("/",(_req,res)=>{
 res.type("html").send(renderPage());
});

app.get("/search",async(req,res)=>{
 const q=String(req.query.q||"").trim().slice(0,200);
 if(!q)return res.redirect("/");

 try{
  const response=await fetch(
   "https://html.duckduckgo.com/html/?q="+encodeURIComponent(q),
   {signal:AbortSignal.timeout(10000),headers:{"User-Agent":"Mozilla/5.0"}}
  );
  if(!response.ok)throw new Error("Search unavailable");

  const source=await response.text();
  const results=sanitizeHtml(source,{
   allowedTags:["div","a","span","p","b","strong","br","h2","h3","ol","li"],
   allowedAttributes:{a:["href","class","title"],div:["class"],span:["class"],ol:["class"]},
   allowedSchemes:["http","https"],
   transformTags:{
    a:(tag,attrs)=>{
     let href="";
     try{
      const u=new URL(attrs.href||"","https://html.duckduckgo.com");
      if(["http:","https:"].includes(u.protocol))href=u.href;
     }catch{}
     return {tagName:tag,attribs:{
      ...(attrs.class?{class:attrs.class}:{}),
      ...(attrs.title?{title:attrs.title}:{}),
      ...(href?{href}: {})
     }};
    }
   }
  });

  const styled='<div class="results"><p class="results-heading">Search results for: '+escapeHtml(q)+'</p>'+results+'</div>';
  res.type("html").send(renderPage(q,styled));
 }catch{
  res.status(502).type("html").send(renderPage(q,
   '<div class="results"><p class="no-results">Search is temporarily unavailable. Please try again.</p></div>'
  ));
 }
});

app.get("/api/lucky",async(req,res)=>{
 const q=String(req.query.q||"").trim().slice(0,200);
 if(!q)return res.status(400).json({error:"Enter a search."});

 try{
  const r=await fetch("https://html.duckduckgo.com/html/?q="+encodeURIComponent(q),{
   signal:AbortSignal.timeout(8000),
   headers:{"User-Agent":"Mozilla/5.0"}
  });
  if(!r.ok)throw new Error();
  const html=await r.text();
  const match=html.match(/class="result__a"[^>]*href="([^"]+)"/i);
  if(!match)throw new Error();

  let url=match[1].replace(/&amp;/g,"&");
  url=new URL(url,"https://html.duckduckgo.com").href;
  const parsed=new URL(url);
  if(parsed.hostname.endsWith("duckduckgo.com")){
   const destination=parsed.searchParams.get("uddg");
   if(destination)url=destination;
  }
  const target=new URL(url);
  if(!["http:","https:"].includes(target.protocol))throw new Error();
  res.json({url:target.href});
 }catch{
  res.status(502).json({error:"Could not find a result."});
 }
});

app.get("/health",(_req,res)=>res.json({ok:true}));

function isPrivateIPv4(ip){
 const p=ip.split(".").map(Number);
 if(p.length!==4||p.some(n=>!Number.isInteger(n)||n<0||n>255))return true;
 const [a,b]=p;
 return a===0||a===10||a===127||
  (a===169&&b===254)||(a===172&&b>=16&&b<=31)||
  (a===192&&b===168)||(a===100&&b>=64&&b<=127)||a>=224;
}

function isPrivateIPv6(ip){
 const s=ip.toLowerCase();
 return s==="::"||s==="::1"||s.startsWith("fc")||
  s.startsWith("fd")||s.startsWith("fe8")||
  s.startsWith("fe9")||s.startsWith("fea")||
  s.startsWith("feb")||s.startsWith("ff")||
  s.startsWith("::ffff:")||s.startsWith("2001:db8:");
}

async function validatePublicUrl(raw){
 const target=new URL(raw);
 if(!["http:","https:"].includes(target.protocol)||
  target.username||target.password||
  (target.port&&!["80","443"].includes(target.port))){
  throw new Error("Invalid URL");
 }

 const host=target.hostname.toLowerCase();
 if(!host||host==="localhost"||host.endsWith(".localhost")||
  host.endsWith(".local")||host.endsWith(".internal")||
  host.endsWith(".test")||host==="metadata.google.internal"){
  throw new Error("Private host");
 }

 if(net.isIP(host)===4){
  if(isPrivateIPv4(host))throw new Error("Private IP");
 }else if(net.isIP(host)===6){
  if(isPrivateIPv6(host))throw new Error("Private IP");
 }else{
  const addresses=await dns.lookup(host,{all:true,verbatim:true});
  if(!addresses.length||addresses.some(a=>{
   const v=net.isIP(a.address);
   return v===4?isPrivateIPv4(a.address):
    v===6?isPrivateIPv6(a.address):true;
  }))throw new Error("Private address");
 }
 return target;
}

app.post("/api/fetch",async(req,res)=>{
 let target;
 try{
  target=await validatePublicUrl(String(req.body?.url||""));
 }catch{
  return res.status(400).json({error:"Enter a valid public HTTP or HTTPS website address."});
 }

 try{
  const response=await fetch(target,{
   redirect:"error",
   signal:AbortSignal.timeout(10000),
   headers:{"User-Agent":"Mozilla/5.0"}
  });
  if(!response.ok)return res.status(502).json({error:"Website returned HTTP "+response.status});

  const type=response.headers.get("content-type")||"";
  if(!/^(text\/html|text\/plain|application\/xhtml\+xml)(;|$)/i.test(type)){
   return res.status(415).json({error:"Only HTML and text pages are supported."});
  }
  if(!response.body)return res.status(502).json({error:"No content returned."});

  const reader=response.body.getReader();
  const chunks=[];
  let size=0;
  while(true){
   const {done,value}=await reader.read();
   if(done)break;
   size+=value.byteLength;
   if(size>1_000_000){
    await reader.cancel();
    return res.status(413).json({error:"Page exceeds the 1 MB limit."});
   }
   chunks.push(value);
  }

  let source=Buffer.concat(chunks).toString("utf8");
  if(type.startsWith("text/plain"))source="<pre>"+escapeHtml(source)+"</pre>";

  const m=source.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title=m?m[1].replace(/<[^>]*>/g,"").slice(0,200):target.hostname;

  const html=sanitizeHtml(source,{
   allowedTags:[
    "h1","h2","h3","h4","h5","h6","p","div","span","br","hr",
    "ul","ol","li","blockquote","pre","code","strong","b","em","i",
    "u","s","table","thead","tbody","tr","th","td","a","img"
   ],
   allowedAttributes:{
    a:["href","title"],img:["src","alt","width","height"],
    th:["colspan","rowspan"],td:["colspan","rowspan"]
   },
   allowedSchemes:["http","https"],
   transformTags:{
    a:(tag,attrs)=>{
     let href="";
     try{
      const u=new URL(attrs.href||"",target.href);
      if(["http:","https:"].includes(u.protocol))href=u.href;
     }catch{}
     return {tagName:tag,attribs:{
      ...(href?{href}:{}),...(attrs.title?{title:attrs.title}:{})
     }};
    },
    img:(tag,attrs)=>{
     let src="";
     try{
      const u=new URL(attrs.src||"",target.href);
      if(["http:","https:"].includes(u.protocol))src=u.href;
     }catch{}
     return {tagName:tag,attribs:{
      ...(src?{src}:{}),...(attrs.alt?{alt:attrs.alt}:{})
     }};
    }
   }
  });

  res.json({url:target.href,title,html});
 }catch{
  res.status(502).json({error:"Couldn't load that website. It may require JavaScript or block proxy requests."});
 }
});

app.listen(PORT,"0.0.0.0",()=>{
 console.log("Google-style search running on port "+PORT);
});
