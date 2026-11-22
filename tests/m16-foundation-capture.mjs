// M16.2 — genuine Chromium map, filter and location-sheet acceptance capture, no external packages or live-site writes.
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
  if(value.exceptionDetails)fail("Browser evaluate failed for "+expression.slice(0,260)+": "+JSON.stringify(value.exceptionDetails));
  return value.result?.value;
}
const metricsExpression='(() => { const $=s=>document.querySelector(s), box=s=>{const e=$(s);if(!e)return null;const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height}};return {url:location.href,documentReady:document.readyState,viewport:{innerWidth:innerWidth,innerHeight:innerHeight,visualWidth:visualViewport.width,visualHeight:visualViewport.height,documentWidth:document.documentElement?.scrollWidth||0,documentHeight:document.documentElement?.scrollHeight||0},activeView:document.querySelector(".view.active")?.id || null,navCount:document.querySelectorAll("nav.bottom-nav button").length,navViews:Array.from(document.querySelectorAll("nav.bottom-nav button"),b=>b.dataset.view),sitePinCount:document.querySelectorAll("#mapPins [data-zone]").length,categoryKeyCount:document.querySelectorAll("#mapLegend [data-map-key]").length,buildFilterCount:document.querySelectorAll("#craftMapStrip [data-craft-map]").length,buildCount:window.TZ_DATA?.builds?.length,worldSites:window.TZ_DATA?.zones?.length,catalogItems:window.TZ_DATA?.items?.length,questMaxis:window.TZ_DATA?.quests?.maxis?.length,questRichtofen:window.TZ_DATA?.quests?.richtofen?.length,sheetOpen:!$("#auxSheet")?.hidden,sheetTitle:$("#sheetTitle")?.textContent,sheetView:Array.from(document.querySelectorAll(".aux-sheet .view.active"),v=>v.id),scannerPresent:!!$("#mapScanPanel"),scannerHidden:!!$("#mapScanPanel")?.hidden,layout:{header:box(".top"),map:box("#mapViewport"),navigation:box(".bottom-nav"),key:box("#mapLegend"),keyToggle:box("#mapKeyDisclosure summary"),context:box("#mapContext")},drawerOpen:!!$("#mapKeyDisclosure")?.open,contextOpen:!$("#mapContext")?.hidden,mapAspect:$("#worldMap")?.getAttribute("preserveAspectRatio")}})()';

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
    // Previous viewport can retain a selected site; capture the uncluttered overview.
    await evaluate(rpc,'document.querySelector("#closeMapContext")?.click()');
    info=await evaluate(rpc,metricsExpression);
    const nav=info.layout.navigation;
    if(!nav||nav.x < -1||nav.x+nav.width>width+1||nav.width < width-2)
      fail("Offscreen primary navigation at "+width+"x"+height+": "+JSON.stringify(nav));
    const mapScreenshot=await capture(rpc,width,height,"map");
    evidence.push({requested:{width,height},measured:info,screenshot:mapScreenshot});
    if(info.mapAspect!=="xMidYMid meet")fail("Expected uncropped full-world meet mode: "+width+"x"+height);

    // M16 map-fit real phone-size browser witnesses: initial overview, zoom and
    // reset fully contain source art and never shrink the +/- controls.
    const cameraEvidence='(()=>{const vp=document.querySelector("#mapViewport").getBoundingClientRect(),r=document.querySelector("#mapWorld image").getBoundingClientRect(),t=window.TZ_MAP_TELEMETRY(),controls=Array.from(document.querySelectorAll("#interactiveMap .map-tools button")).filter(b=>!b.hidden).map(b=>({id:b.id,w:b.getBoundingClientRect().width,h:b.getBoundingClientRect().height}));return {zoom:t.zoom,panX:t.panX,panY:t.panY,map:{left:vp.left,top:vp.top,right:vp.right,bottom:vp.bottom,width:vp.width,height:vp.height},art:{left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height},siteCount:document.querySelectorAll("#mapPins [data-zone]").length,controls}})()';
    const assertFits=(s,label)=>{
      if(s.zoom!==1||Math.abs(s.panX)>.01||Math.abs(s.panY)>.01||s.siteCount!==10)
        fail("Map "+label+" must reset to 1x, zero pan and ten sites: "+JSON.stringify(s));
      if(s.art.width<40||s.art.height<40||s.art.left<s.map.left-2||s.art.right>s.map.right+2||s.art.top<s.map.top-2||s.art.bottom>s.map.bottom+2)
        fail("Real Chromium map "+label+" crops source artwork: "+JSON.stringify(s));
      if(s.controls.some(c=>c.w<43||c.h<43))
        fail("Real Chromium map "+label+" has undersized +/- reset controls: "+JSON.stringify(s.controls));
    };
    assertFits(await evaluate(rpc,cameraEvidence),width+"x"+height+" initial");
    await evaluate(rpc,'document.querySelector("#zoomOut").click()');
    assertFits(await evaluate(rpc,cameraEvidence),width+"x"+height+" minimum zoom");
    await evaluate(rpc,'document.querySelector("#zoomIn").click();document.querySelector("#zoomIn").click()');
    const zoomedCamera=await evaluate(rpc,cameraEvidence);
    if(zoomedCamera.zoom<1.6)fail("Map failed two zoom-in taps: "+JSON.stringify(zoomedCamera));
    evidence.push({requested:{width,height},mapFit:"zoom-in",measured:zoomedCamera,screenshot:await capture(rpc,width,height,"map-zoomed")});
    await evaluate(rpc,'document.querySelector("#zoomOut").click();document.querySelector("#zoomOut").click();document.querySelector("#resetMap").click()');
    const resetCamera=await evaluate(rpc,cameraEvidence);
    assertFits(resetCamera,width+"x"+height+" reset");
    evidence.push({requested:{width,height},mapFit:"full-world-reset",measured:resetCamera,screenshot:await capture(rpc,width,height,"map-reset-fit")});

    if(info.viewport.documentWidth>width+1)fail("Horizontal document overflow "+width+"x"+height);
    if(height<=470){
      if(info.layout.map.y>116)fail("Landscape map starts too far below header: "+JSON.stringify(info.layout.map));
      if(info.layout.map.height < Math.max(165,height*.48))fail("Landscape map area too small "+JSON.stringify(info.layout.map));
      if(info.layout.map.y+info.layout.map.height>nav.y+10)fail("Map hidden beneath bottom tabs "+JSON.stringify(info.layout.map));
    }
    await evaluate(rpc,'document.querySelector("#mapKeyDisclosure").open=true');
    await sleep(70);
    const keyInfo=await evaluate(rpc,metricsExpression);
    if(!keyInfo.drawerOpen||keyInfo.categoryKeyCount!==7||keyInfo.buildFilterCount!==10)fail("Map key/buildable drawer parity failure");
    evidence.push({requested:{width,height},measured:keyInfo,screenshot:await capture(rpc,width,height,"filters")});
    await evaluate(rpc,'document.querySelector("#mapKeyDisclosure").open=false');
    await evaluate(rpc,'document.querySelector("#mapPins [data-zone=town]").dispatchEvent(new MouseEvent("click",{bubbles:true}))');
    await sleep(80);
    const detailInfo=await evaluate(rpc,metricsExpression);
    if(!detailInfo.contextOpen||!detailInfo.layout.context||detailInfo.layout.context.height<70)fail("Town location sheet failed: "+width+"x"+height);
    if(detailInfo.layout.context.y+detailInfo.layout.context.height > info.layout.map.y+info.layout.map.height+4)fail("Location sheet goes below map edge");
    evidence.push({requested:{width,height},measured:detailInfo,screenshot:await capture(rpc,width,height,"location")});
    await evaluate(rpc,'document.querySelector("#closeMapContext")?.click()');


    // M16.3: screenshot both complete source-authored routes and the saved crew
    // disclosure in real mobile Chromium at *every* requested viewport.
    await evaluate(rpc,'document.querySelector("nav [data-view=quest]").click()');
    await evaluate(rpc,'document.querySelector("[data-side=maxis]").click()');
    await sleep(110);
    const maxisView=await evaluate(rpc,'(() => {const action=document.querySelector("#questPanel .quest-next-actions").getBoundingClientRect(),nav=document.querySelector(".bottom-nav").getBoundingClientRect(),hero=document.querySelector("#questPanel .quest-next").getBoundingClientRect();return {count:document.querySelectorAll("#questPanel [data-quest-step]").length,current:document.querySelectorAll("#questPanel .quest-step-details[open]").length,route:document.querySelector("[data-side=maxis]").getAttribute("aria-pressed"),heroTop:hero.top,actionBottom:action.bottom,navTop:nav.top}})()');
    if(maxisView.count!==6||maxisView.current!==1||maxisView.route!=="true")fail("Maxis source route screenshot contract failed "+width+"x"+height);
    if(height<=470&&maxisView.actionBottom>maxisView.navTop+2)fail("Landscape next-objective buttons clipped under navigation at "+width+"x"+height+": "+JSON.stringify(maxisView));
    evidence.push({requested:{width,height},questRoute:"maxis",measured:maxisView,screenshot:await capture(rpc,width,height,"quest-maxis")});
    await evaluate(rpc,'document.querySelector("[data-side=richtofen]").click()');
    await sleep(110);
    const richtofenView=await evaluate(rpc,'({count:document.querySelectorAll("#questPanel [data-quest-step]").length,current:document.querySelectorAll("#questPanel .quest-step-details[open]").length,route:document.querySelector("[data-side=richtofen]").getAttribute("aria-pressed")})');
    if(richtofenView.count!==8||richtofenView.current!==1||richtofenView.route!=="true")fail("Richtofen source route screenshot contract failed "+width+"x"+height);
    evidence.push({requested:{width,height},questRoute:"richtofen",measured:richtofenView,screenshot:await capture(rpc,width,height,"quest-richtofen")});
    await evaluate(rpc,'document.querySelector("#questCrewDisclosure").open=true');
    // Crew follows the priority objective in short landscape; scroll to show the
    // actual names in the screenshot, not merely an offscreen details[open] node.
    if(height<=470)await evaluate(rpc,'document.querySelector("#questCrewDisclosure").scrollIntoView({behavior:"instant",block:"start"})');
    await sleep(140);
    const crewView=await evaluate(rpc,'({open:document.querySelector("#questCrewDisclosure").open,people:document.querySelectorAll("#questCrewSummary .quest-roster-person").length})');
    if(!crewView.open||crewView.people!==4)fail("Crew disclosure screenshot contract failed "+width+"x"+height);
    if(height<=470){
      const rosterBounds=await evaluate(rpc,'(() => {const e=document.querySelector("#questCrewSummary .quest-roster-person"),r=e.getBoundingClientRect(),n=document.querySelector(".bottom-nav").getBoundingClientRect();return {top:r.top,bottom:r.bottom,navTop:n.top}})()');
      if(rosterBounds.top<0||rosterBounds.top>rosterBounds.navTop-25)fail("Expanded Crew names not visible in landscape screenshot "+width+"x"+height+": "+JSON.stringify(rosterBounds));
    }
    evidence.push({requested:{width,height},questRoute:"crew-disclosure",measured:crewView,screenshot:await capture(rpc,width,height,"quest-crew")});
    await evaluate(rpc,'document.querySelector("#questCrewDisclosure").open=false');
    if(height<=470)await evaluate(rpc,'window.scrollTo({top:0,behavior:"instant"})');

    // M16.4: source-driven craft UI at every phone size, not mocked panels.
    // Include every important outlier: Jet's four fixed areas, NAV alternate
    // locations, and the moving bus with no fixed workbench.
    await evaluate(rpc,'document.querySelector("nav [data-view=craft]").click()');
    await evaluate(rpc,'document.querySelector("#craftPanel [data-craft-select=jet]").click()');
    await sleep(140);
    const jetView=await evaluate(rpc,'(() => {const $=s=>document.querySelector(s),b=$("#craftPanel .craft-show").getBoundingClientRect(),n=$(".bottom-nav").getBoundingClientRect(),sel=$("#craftPanel .craft-selector.selected").getBoundingClientRect(),rail=$("#craftPanel .craft-selector-grid").getBoundingClientRect();return {name:$("#craftPanel .craft-detail h3").textContent,parts:document.querySelectorAll("#craftPanel .craft-part-row").length,rooms:document.querySelectorAll("#craftPanel .craft-room").length,bench:!!$("#craftPanel [data-craft-bench=jet]"),mapActionBottom:b.bottom,navTop:n.top,selectedVisible:sel.left>=rail.left-3&&sel.right<=rail.right+3,selectedBounds:[sel.left,sel.right],pickerBounds:[rail.left,rail.right],pickerScroll:$("#craftPanel .craft-selector-grid").scrollLeft}})()');
    if(jetView.name!=="Jet Gun"||jetView.parts!==4||jetView.rooms!==4||!jetView.bench||!jetView.selectedVisible)fail("M16.4 Jet Gun craft source failure "+width+"x"+height+": "+JSON.stringify(jetView));
    if(height<=470&&jetView.mapActionBottom>jetView.navTop+2)fail("M16.4 landscape map action clipped under nav "+width+"x"+height+": "+JSON.stringify(jetView));
    evidence.push({requested:{width,height},craft:"jet",measured:jetView,screenshot:await capture(rpc,width,height,"craft-jet")});
    await evaluate(rpc,'document.querySelector("#craftPanel [data-craft-select=nav]").click()');
    await sleep(100);
    const navView=await evaluate(rpc,'({name:document.querySelector("#craftPanel .craft-detail h3").textContent,parts:document.querySelectorAll("#craftPanel .craft-part-row").length,alternate:document.querySelectorAll("#craftPanel .craft-alternates").length})');
    if(navView.parts!==4||navView.alternate<2)fail("NAV original alternate-spawn source failure: "+JSON.stringify(navView));
    evidence.push({requested:{width,height},craft:"nav",measured:navView,screenshot:await capture(rpc,width,height,"craft-nav")});
    await evaluate(rpc,'document.querySelector("#craftPanel [data-craft-select=bus]").click()');
    await sleep(100);
    const busView=await evaluate(rpc,'({name:document.querySelector("#craftPanel .craft-detail h3").textContent,parts:document.querySelectorAll("#craftPanel .craft-part-row").length,noFixedBench:document.querySelector("#craftPanel .craft-bench").textContent.includes("NO FIXED BENCH")})');
    if(busView.parts!==3||!busView.noFixedBench)fail("Bus equipment false static bench: "+JSON.stringify(busView));
    evidence.push({requested:{width,height},craft:"bus",measured:busView,screenshot:await capture(rpc,width,height,"craft-bus")});
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
      // Genuine Chromium page reload, exercising the deployed v1 localStorage
      // contract rather than merely seeding a Node VM with a parsed save.
      const savedBefore=await evaluate(rpc,'localStorage.getItem("tranzit-atlas-save-v1")');
      await evaluate(rpc,'document.querySelector("nav [data-view=craft]").click()');
      await evaluate(rpc,'document.querySelector("#craftPanel [data-craft-select=jet]").click()');
      await evaluate(rpc,'document.querySelectorAll("#craftPanel [data-part]")[1].click()');
      await sleep(100);
      const craftProgress=await evaluate(rpc,'({parts:JSON.parse(localStorage.getItem("tranzit-atlas-save-v1")).parts["jet:1"],text:document.querySelector("#craftPanel .craft-status").textContent})');
      if(!craftProgress.parts||!craftProgress.text.includes("1 of 4"))fail("Craftable checklist does not persist to v1 part slot: "+JSON.stringify(craftProgress));
      evidence.push({requested:{width,height},craft:"collected",measured:craftProgress,screenshot:await capture(rpc,width,height,"craft-collected")});

      await evaluate(rpc,'document.querySelector("nav [data-view=quest]").click()');
      await evaluate(rpc,'document.querySelector("[data-side=richtofen]").click()');
      await evaluate(rpc,'document.querySelector("#questPanel [data-quest-done]").click()');
      await evaluate(rpc,'(() => {const a=document.querySelector("#questAssign1");a.value="2";a.dispatchEvent(new Event("change",{bubbles:true}));return true})()');
      await evaluate(rpc,'document.querySelector("#crewAccess").click()');
      await evaluate(rpc,'(() => {const p=document.querySelector("#crewName2");p.value="Atlas Test Pilot";p.dispatchEvent(new Event("input",{bubbles:true}));return true})()');
      await evaluate(rpc,'document.querySelector("#closeSheet").click()');
      await rpc("Page.reload",{ignoreCache:true});
      await sleep(550);
      await waitForApp(rpc);
      const persisted=await evaluate(rpc,'(() => {const s=JSON.parse(localStorage.getItem("tranzit-atlas-save-v1"));return {side:s.side,done:s.done["richtofen:0"],assigned:s.assign["richtofen:1"],name:s.crew[2],jetPart:s.parts["jet:1"],maxis:document.querySelectorAll("#questPanel [data-quest-step]").length,step2:document.querySelector("#questPanel .quest-next")?.textContent.includes("STEP 2 OF 8"),active:document.querySelector("#view-quest").classList.contains("active")}})()');
      if(persisted.side!=="richtofen"||!persisted.done||persisted.assigned!=="2"||persisted.name!=="Atlas Test Pilot"||!persisted.jetPart||persisted.maxis!==8||!persisted.step2||!persisted.active)fail("Real browser reload lost quest/crew progress: "+JSON.stringify(persisted));
      evidence.push({requested:{width,height},questRoute:"real-reload",measured:persisted,screenshot:await capture(rpc,width,height,"quest-reload")});
      await evaluate(rpc,'document.querySelector("nav [data-view=craft]").click()');
      await evaluate(rpc,'document.querySelector("#craftPanel [data-craft-select=jet]").click()');
      const reloadedCraft=await evaluate(rpc,'({progress:document.querySelector("#craftPanel .craft-status").textContent,checked:document.querySelectorAll("#craftPanel [data-part]")[1].getAttribute("aria-pressed")})');
      if(!reloadedCraft.progress.includes("1 of 4")||reloadedCraft.checked!=="true")fail("Real reload lost shared craft part checkmark: "+JSON.stringify(reloadedCraft));
      evidence.push({requested:{width,height},craft:"real-reload",measured:reloadedCraft,screenshot:await capture(rpc,width,height,"craft-reload")});

      await evaluate(rpc,'localStorage.setItem("tranzit-atlas-save-v1",'+JSON.stringify(savedBefore)+')');
      await rpc("Page.reload",{ignoreCache:true});
      await sleep(350);
      await waitForApp(rpc);
    }
    console.log("Verified baseline Chromium viewport "+width+"x"+height+", 10 site pins, 130 records");
  }
  // M16.5A: genuine Chromium SW upgrade/offline witness on a secure local origin.
  // This executes after all 53 previously accepted source-specific screenshots.
  // CacheStorage is shared by sibling GitHub Pages apps: seed one unrelated cache
  // plus the previous TranZit v13 cache before installing the v14 worker.
  await rpc("Emulation.setDeviceMetricsOverride",{width:390,height:844,deviceScaleFactor:1,mobile:true,screenWidth:390,screenHeight:844});
  const upgrade=await evaluate(rpc,'(async()=>{const sibling=await caches.open("mythwrought-offline-sentinel");await sibling.put("./sibling-safety-proof",new Response("untouched sibling bytes"));const legacy=await caches.open("tranzit-atlas-v14");await legacy.put("./old-tranzit",new Response("old v14"));const reg=await navigator.serviceWorker.register("./sw.js",{updateViaCache:"none"});await navigator.serviceWorker.ready;let keys=await caches.keys();for(let attempt=0;attempt<50&&keys.includes("tranzit-atlas-v14");attempt++){await new Promise(resolve=>setTimeout(resolve,100));keys=await caches.keys()}const saved=await caches.match("./sibling-safety-proof");const old=keys.includes("tranzit-atlas-v14");const icon=await caches.match("./apple-touch-icon.png");return {active:!!reg.active,keys,siblingContent:await saved?.text(),oldOwnedRetained:old,iconCached:!!icon}})()');
  if(!upgrade.active||upgrade.siblingContent!=="untouched sibling bytes"||upgrade.oldOwnedRetained||!upgrade.iconCached)
   fail("Real Chromium SW activation must retire old TranZit cache, precache PNG and preserve sibling: "+JSON.stringify(upgrade));
  await rpc("Page.reload",{ignoreCache:false});
  await sleep(500);
  await waitForApp(rpc);
  await evaluate(rpc,'document.querySelector("nav [data-view=map]").click()');
  const controlled=await evaluate(rpc,'({controlled:!!navigator.serviceWorker.controller,scope:navigator.serviceWorker.controller?.scriptURL,siteCount:document.querySelectorAll("#mapPins [data-zone]").length})');
  if(!controlled.controlled||controlled.siteCount!==10)fail("Service worker failed to control the real app before network loss: "+JSON.stringify(controlled));
  await rpc("Network.enable");
  await rpc("Network.emulateNetworkConditions",{offline:true,latency:0,downloadThroughput:0,uploadThroughput:0});
  await rpc("Page.reload",{ignoreCache:false});
  await sleep(600);
  const loadedOffline=await waitForApp(rpc);
  const offlineState=await evaluate(rpc,'(async()=>{const keys=await caches.keys(),sibling=await caches.match("./sibling-safety-proof"),icon=await caches.match("./apple-touch-icon.png");return {controller:!!navigator.serviceWorker.controller,sites:document.querySelectorAll("#mapPins [data-zone]").length,items:window.TZ_DATA?.items.length,mapActive:document.querySelector("#view-map").classList.contains("active"),siblingContent:await sibling?.text(),iconCached:!!icon,cacheNames:keys,online:navigator.onLine}})()');
  if(!offlineState.controller||offlineState.sites!==10||offlineState.items!==130||!offlineState.mapActive||offlineState.siblingContent!=="untouched sibling bytes"||!offlineState.iconCached)
   fail("Genuine offline Chromium reload after cache upgrade did not preserve app and sibling PWA: "+JSON.stringify(offlineState));
  evidence.push({requested:{width:390,height:844},releaseSafety:"genuine-offline-upgrade",measured:{upgrade,controlled,offlineState,viewport:loadedOffline.viewport},screenshot:await capture(rpc,390,844,"offline-upgrade")});
  await rpc("Network.emulateNetworkConditions",{offline:false,latency:0,downloadThroughput:0,uploadThroughput:0});
  console.log("M16_5A_REAL_CHROMIUM_OFFLINE_PASS controller="+offlineState.controller+" sibling cache intact; v14 retired; v15 precached; catalog="+offlineState.items);
  await fsp.writeFile(path.join(output,"baseline-layout.json"),JSON.stringify({
    baselineCommit:"80cdb6db12efb38edb41a3d43adbfec52ac5a99a",
    candidateCommit:process.env.ATLAS_CANDIDATE_SHA||process.env.GITHUB_SHA||"local PR branch",
    browser:"Chromium headless CDP; mobile emulation at deviceScaleFactor=1; not physical iPhone",
    milestone:"M16 map-fit hotfix with 53 protected screens, ten full-world zoom witnesses and offline cache upgrade",
    screenshotCount:evidence.length,records:evidence
  },null,2)+"\n");
  if(evidence.length!==64)fail("Expected 53 preserved source captures, ten map-fit witnesses and one offline upgrade");
  console.log("M16_MAP_FIT_CAPTURE_PASS "+evidence.length+" genuine screenshots: 53 previous, ten map fit/zoom and one real offline upgrade");
}finally {
  try{socket?.close();}catch{}
  try{browser?.kill("SIGTERM");}catch{}
  await fsp.rm(dir,{recursive:true,force:true,maxRetries:2});
}
