// M16.0 ONLY — genuine Chromium baseline capture, no external packages or live-site writes.
// Intended to be run inside the isolated draft PR's GitHub Actions job.
import fs from "node:fs";
import fsp from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";

const sizes=[[390,844],[440,956],[667,375],[844,390],[932,430]];
const extraViews=["quest","craft"]; const extraSheets=["atlas","zones","crew"];
const output=process.env.BASELINE_OUTPUT || "m16-foundation-evidence";
const chrome=process.env.CHROME_BIN || "chromium";
const url=process.env.BASELINE_URL || "http://127.0.0.1:8765/";
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const fail=message=>{throw new Error(message);};
let browser=null, socket=null;
const dir=await fsp.mkdtemp(path.join(os.tmpdir(),"tranzit-m16-"));
await fsp.mkdir(output,{recursive:true});

async function connectPage() {
  browser=spawn(chrome,[
    "--headless=new","--no-sandbox","--disable-dev-shm-usage","--disable-gpu",
    "--no-first-run","--no-default-browser-check","--disable-extensions",
    "--remote-debugging-port=0","--remote-allow-origins=*",
    "--user-data-dir="+dir,"about:blank"
  ],{stdio:"ignore"});
  let port=0;
  for(let attempts=0;attempts<150;attempts++){
    if(browser.exitCode!==null)fail("Chromium terminated before opening debugging port");
    try {
      const value=await fsp.readFile(path.join(dir,"DevToolsActivePort"),"utf8");
      port=Number(value.split("\n")[0]);
      if(port)break;
    }catch{}
    await sleep(100);
  }
  if(!port)fail("Chromium debugging port unavailable");
  const response=await fetch("http://127.0.0.1:"+port+"/json/list");
  const pages=await response.json();
  const page=pages.find(p=>p.type==="page"&&p.webSocketDebuggerUrl);
  if(!page)fail("No Chromium page target");
  socket=new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{
    socket.addEventListener("open",resolve,{once:true});
    socket.addEventListener("error",()=>reject(Error("DevTools socket error")),{once:true});
  });
  let seq=0;
  const pending=new Map();
  socket.addEventListener("message",event=>{
    const msg=JSON.parse(event.data);
    if(!msg.id||!pending.has(msg.id))return;
    const {resolve,reject}=pending.get(msg.id);pending.delete(msg.id);
    if(msg.error)reject(Error(JSON.stringify(msg.error)));else resolve(msg.result);
  });
  const rpc=(method,params={})=>new Promise((resolve,reject)=>{
    const id=++seq;pending.set(id,{resolve,reject});
    socket.send(JSON.stringify({id,method,params}));
    setTimeout(()=>{if(pending.has(id)){pending.delete(id);reject(Error("CDP timeout: "+method));}},12000).unref();
  });
  return rpc;
}

async function evaluate(rpc,expression){
  const value=await rpc("Runtime.evaluate",{expression,returnByValue:true,awaitPromise:true});
  if(value.exceptionDetails)fail("Browser evaluate failed: "+JSON.stringify(value.exceptionDetails));
  return value.result?.value;
}
const metricsExpression='(() => { const $=s=>document.querySelector(s), box=s=>{const e=$(s);if(!e)return null;const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height}};return {url:location.href,documentReady:document.readyState,viewport:{innerWidth:innerWidth,innerHeight:innerHeight,visualWidth:visualViewport.width,visualHeight:visualViewport.height,documentWidth:document.documentElement.scrollWidth,documentHeight:document.documentElement.scrollHeight},activeView:document.querySelector(".view.active")?.id || null,navCount:document.querySelectorAll("nav.bottom-nav button").length,navViews:Array.from(document.querySelectorAll("nav.bottom-nav button"),b=>b.dataset.view),sitePinCount:document.querySelectorAll("#mapPins [data-zone]").length,categoryKeyCount:document.querySelectorAll("#mapLegend [data-map-key]").length,buildFilterCount:document.querySelectorAll("#craftMapStrip [data-craft-map]").length,buildCount:window.TZ_DATA?.builds?.length,worldSites:window.TZ_DATA?.zones?.length,catalogItems:window.TZ_DATA?.items?.length,questMaxis:window.TZ_DATA?.quests?.maxis?.length,questRichtofen:window.TZ_DATA?.quests?.richtofen?.length,sheetOpen:!$("#auxSheet")?.hidden,sheetTitle:$("#sheetTitle")?.textContent,sheetView:Array.from(document.querySelectorAll(".aux-sheet .view.active"),v=>v.id),scannerPresent:!!$("#mapScanPanel"),scannerHidden:!!$("#mapScanPanel")?.hidden,layout:{header:box(".top"),map:box("#mapViewport"),navigation:box(".bottom-nav"),key:box("#mapLegend")}}})()';

async function waitForApp(rpc){
  for(let i=0;i<60;i++){
    const m=await evaluate(rpc,metricsExpression);
    if(m?.documentReady==="complete"&&m?.sitePinCount===10&&m?.catalogItems===130&&m?.navCount===3)return m;
    await sleep(200);
  }
  fail("Baseline app did not finish rendering with 130 items, 10 site anchors and three tabs");
}
async function capture(rpc,width,height,label){
  const screenshot=await rpc("Page.captureScreenshot",{format:"png",fromSurface:true,captureBeyondViewport:false});
  const bytes=Buffer.from(screenshot.data,"base64");
  if(bytes.subarray(1,4).toString()!=="PNG")fail("Invalid PNG "+label);
  const actualWidth=bytes.readUInt32BE(16), actualHeight=bytes.readUInt32BE(20);
  if(actualWidth!==width||actualHeight!==height)fail("Viewport PNG mismatch "+label+": "+actualWidth+"x"+actualHeight);
  if(bytes.length<12000)fail("Unexpectedly small screenshot "+label+": "+bytes.length+" bytes");
  const filename=width+"x"+height+"-"+label+".png";
  await fsp.writeFile(path.join(output,filename),bytes);
  return {file:filename,width:actualWidth,height:actualHeight,bytes:bytes.length};
}
try {
  const rpc=await connectPage();
  await rpc("Page.enable");
  await rpc("Runtime.enable");
  const evidence=[];
  for(const [width,height] of sizes){
    await rpc("Emulation.setDeviceMetricsOverride",{width,height,deviceScaleFactor:1,mobile:true,screenWidth:width,screenHeight:height});
    await rpc("Emulation.setTouchEmulationEnabled",{enabled:true,maxTouchPoints:5});
    await rpc("Page.navigate",{url});
    await sleep(450);
    let info=await waitForApp(rpc);
    if(info.viewport.innerWidth!==width||info.viewport.innerHeight!==height)fail("Viewport CSS mismatch "+width+"x"+height+" got "+info.viewport.innerWidth+"x"+info.viewport.innerHeight);
    if(info.activeView!=="view-map") {
      await evaluate(rpc,'document.querySelector("nav [data-view=map]").click()');
      await sleep(250);
      info=await evaluate(rpc,metricsExpression);
    }
    if(info.buildCount!==9||info.questMaxis!==6||info.questRichtofen!==8)fail("Feature parity count mismatch");
    const mapScreenshot=await capture(rpc,width,height,"map");
    evidence.push({requested:{width,height},measured:info,screenshot:mapScreenshot});
    if(width===390&&height===844){
      for(const name of extraViews){
        await evaluate(rpc,'document.querySelector("nav [data-view='+name+']").click()');
        await sleep(230);
        const viewInfo=await evaluate(rpc,metricsExpression);
        if(viewInfo.activeView!=="view-"+name)fail("Primary three-tab navigation failure: "+name);
        evidence.push({requested:{width,height},measured:viewInfo,screenshot:await capture(rpc,width,height,name)});
      }
      for(const name of extraSheets){
        if(name==="atlas")await evaluate(rpc,'document.querySelector("#globalFind").click()');
        if(name==="zones"){
          await evaluate(rpc,'document.querySelector("nav [data-view=map]").click()');
          await evaluate(rpc,'document.querySelector("#mapPins [data-zone=town]").dispatchEvent(new MouseEvent("click",{bubbles:true}))');
          await evaluate(rpc,'document.querySelector("#mapContext [data-open-zone=town]").click()');
        }
        if(name==="crew"){
          await evaluate(rpc,'document.querySelector("nav [data-view=quest]").click()');
          await evaluate(rpc,'document.querySelector("#crewAccess").click()');
        }
        await sleep(230);
        const sheet=await evaluate(rpc,metricsExpression);
        if(!sheet.sheetOpen||!sheet.sheetView.includes("view-"+name))fail("Secondary sheet missing: "+name);
        evidence.push({requested:{width,height},measured:sheet,screenshot:await capture(rpc,width,height,name)});
        await evaluate(rpc,'document.querySelector("#closeSheet").click()');
      }
    }
    console.log("Verified baseline Chromium viewport "+width+"x"+height+", 10 site pins, 130 records");
  }
  await fsp.writeFile(path.join(output,"baseline-layout.json"),JSON.stringify({
    baselineCommit:"80cdb6db12efb38edb41a3d43adbfec52ac5a99a",
    candidateCommit:process.env.GITHUB_SHA||"local PR branch",
    browser:"Chromium headless CDP; mobile emulation at deviceScaleFactor=1; not physical iPhone",
    milestone:"M16.1 three-tab foundation",
    screenshotCount:evidence.length,records:evidence
  },null,2)+"\n");
  if(evidence.length!==10)fail("Expected 5 map viewport captures plus 2 main tab and 3 secondary sheet captures");
  console.log("M16_FOUNDATION_CAPTURE_PASS "+evidence.length+" genuine screenshots");
}finally {
  try{socket?.close();}catch{}
  try{browser?.kill("SIGTERM");}catch{}
  await fsp.rm(dir,{recursive:true,force:true,maxRetries:2});
}
