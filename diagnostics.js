/* TranZit Map Diagnostics — all measurements stay on-device until manually copied. */
(function(){
"use strict";
const $=id=>document.getElementById(id);
const panel=$("mapScanPanel");
if(!panel)return;
const durationMs=15000;
const scan={active:false,timer:null,tick:null,raf:null,lastFrame:0,started:0,frameIntervals:[],workMs:[],longTasks:[],pointerCount:0,maxPointers:0,downs:0,ups:0,cancels:0,moves:0,touchMoves:0,mouseMoves:0,distancePx:0,lastMoveAt:null,longestMoveGap:0,activePointers:new Map(),mapStart:null,mapEnd:null,zoomMin:1,zoomMax:1,hiddenMs:0,hiddenSince:null,longTaskSupported:false,report:""};
const now=()=>performance.now();
const round=(v,d=1)=>Number.isFinite(v)?Number(v.toFixed(d)):0;
const sorted=a=>a.slice().sort((x,y)=>x-y);
function percentile(values,p){
 if(!values.length)return null;
 const a=sorted(values),idx=Math.min(a.length-1,Math.max(0,Math.ceil(p*a.length)-1));
 return round(a[idx],2);
}
function safeMapState(light=false){
 try{
  const value=window.TZ_MAP_TELEMETRY?.(light);
  if(value&&typeof value==="object")return value;
 }catch(_){}
 return null;
}
function reportValue(value){
 return value===null||value===undefined?"unavailable":String(value);
}
function renderStatus(text){
 $("mapScanState").textContent=text;
}
function frame(timestamp){
 if(!scan.active)return;
 if(scan.lastFrame){
  const delta=timestamp-scan.lastFrame;
  if(delta>0&&delta<5000&&scan.frameIntervals.length<15000)scan.frameIntervals.push(delta);
 }
 scan.lastFrame=timestamp;
 const st=safeMapState(true);
 if(st){scan.zoomMin=Math.min(scan.zoomMin,st.zoom);scan.zoomMax=Math.max(scan.zoomMax,st.zoom);}
 scan.raf=requestAnimationFrame(frame);
}
function resetStats(){
 scan.frameIntervals=[];scan.workMs=[];scan.longTasks=[];
 scan.started=now();scan.lastFrame=0;scan.pointerCount=0;scan.maxPointers=0;
 scan.downs=0;scan.ups=0;scan.cancels=0;scan.moves=0;scan.touchMoves=0;scan.mouseMoves=0;
 scan.distancePx=0;scan.lastMoveAt=null;scan.longestMoveGap=0;
 scan.activePointers.clear();scan.hiddenMs=0;scan.hiddenSince=null;
 scan.mapStart=safeMapState();
 scan.zoomMin=scan.zoomMax=scan.mapStart?.zoom??1;
 scan.mapEnd=null;scan.report="";
}
let observer=null;
function start(){
 if(scan.active)return;
 resetStats();scan.active=true;
 panel.classList.add("scan-running");
 $("startMapScan").hidden=true;$("stopMapScan").hidden=false;$("copyMapScan").hidden=true;
 $("mapScanReport").hidden=true;
 $("mapScanHint").textContent="Drag around, then pinch-zoom a few times. The scan finishes automatically.";
 const canLongTask=typeof PerformanceObserver!=="undefined"&&PerformanceObserver.supportedEntryTypes?.includes("longtask");
 scan.longTaskSupported=!!canLongTask;
 if(canLongTask){
  try{observer=new PerformanceObserver(list=>{
   if(!scan.active)return;
   for(const entry of list.getEntries())if(scan.longTasks.length<1500)scan.longTasks.push(round(entry.duration,2));
  });observer.observe({entryTypes:["longtask"]});}catch(_){observer=null}
 }
 renderStatus("Recording 15 seconds · drag and pinch the map");
 scan.raf=requestAnimationFrame(frame);
 scan.tick=setInterval(()=>{
  if(!scan.active)return;
  const remain=Math.max(0,Math.ceil((durationMs-(now()-scan.started))/1000));
  renderStatus("Recording · "+remain+"s left · move the map");
 },1000);
 scan.timer=setTimeout(stop,durationMs);
 $("interactiveMap")?.scrollIntoView?.({behavior:"auto",block:"center"});
}
function stop(){
 if(!scan.active)return;
 scan.active=false;
 clearTimeout(scan.timer);clearInterval(scan.tick);cancelAnimationFrame(scan.raf);
 scan.timer=scan.tick=scan.raf=null;
 if(observer){try{observer.disconnect()}catch(_){}observer=null;}
 if(scan.hiddenSince!==null){scan.hiddenMs+=now()-scan.hiddenSince;scan.hiddenSince=null;}
 scan.mapEnd=safeMapState();
 const elapsed=Math.max(0,now()-scan.started);
 const frames=scan.frameIntervals;
 const over33=frames.filter(x=>x>33.4).length,over50=frames.filter(x=>x>50).length;
 const info=scan.mapEnd||scan.mapStart||{};
 const change=field=>Math.max(0,(Number(info[field])||0)-(Number(scan.mapStart?.[field])||0));
 const ua=navigator.userAgent||"Unavailable";
 const display=window.visualViewport;
 const lines=[
  "TRANZIT MAP PERFORMANCE SCAN v2",
  "Captured: "+new Date().toISOString(),
  "Duration: "+round(elapsed/1000,2)+" s (target 15 s)",
  "Result: "+(scan.moves<5?"INSUFFICIENT MOVEMENT — run again while dragging and pinching":"TOUCH ACTIVITY CAPTURED"),
  "",
  "[PHONE / BROWSER]",
  "User agent: "+ua.slice(0,220),
  "Window: "+innerWidth+" x "+innerHeight+" CSS px",
  "Visual viewport: "+(display?round(display.width,0)+" x "+round(display.height,0):"unavailable"),
  "Pixel ratio: "+(devicePixelRatio||1),
  "Display mode: "+(window.matchMedia?.("(display-mode: standalone)").matches||navigator.standalone?"Home Screen / standalone":"Safari/browser tab"),
  "Document visibility changes: "+(scan.hiddenMs>0?round(scan.hiddenMs,0)+" ms hidden":"none observed"),
  "",
  "[MAP]",
  "Starting zoom: "+reportValue(scan.mapStart?.zoom),
  "Ending zoom: "+reportValue(info.zoom),
  "Zoom range: "+round(scan.zoomMin,2)+" to "+round(scan.zoomMax,2),
  "Map pan end: "+reportValue(info.panX)+" x, "+reportValue(info.panY)+" y (SVG coordinates)",
  "Markers: "+reportValue(info.markers),
  "Labels: "+reportValue(info.labels),
  "Expanded mode: "+reportValue(info.expanded),
  "",
  "[TOUCH / DRAG]",
  "Touch starts / ends / cancels: "+scan.downs+" / "+scan.ups+" / "+scan.cancels,
  "Pointer moves: "+scan.moves+" (touch "+scan.touchMoves+", mouse/other "+scan.mouseMoves+")",
  "Finger travel: "+round(scan.distancePx,0)+" CSS px",
  "Max concurrent pointers: "+scan.maxPointers,
  "Native touch events processed: "+change("nativeTouchHandled"),
  "Pointer events processed by map: "+change("pointerHandled"),
  "Camera movement accepted: "+change("panChanged"),
  "Camera movement blocked by edge/limit: "+change("panAtBoundary"),
  "Map camera frames: "+change("cameraFrames"),
  "Overlay position refreshes: "+change("overlayRefreshes"),
  "Map gesture starts: "+change("gestureStarts"),
  "Pointer capture interruptions: "+change("pointerCaptureLost"),
  "Largest touch-move gap: "+(scan.longestMoveGap?round(scan.longestMoveGap,1)+" ms":"not measured"),
  "",
  "[FRAME PACING — requestAnimationFrame]",
  "Samples: "+frames.length,
  "Median frame interval: "+reportValue(percentile(frames,.50))+" ms",
  "P95 frame interval: "+reportValue(percentile(frames,.95))+" ms",
  "Worst frame interval: "+reportValue(frames.length?round(Math.max(...frames),2):null)+" ms",
  "Frames over 33 ms: "+over33+" / "+frames.length,
  "Frames over 50 ms: "+over50+" / "+frames.length,
  "Approx. rAF cadence: "+(frames.length?round(1000/percentile(frames,.5),0)+" Hz":"not measured"),
  "",
  "[MAP TRANSFORM WORK]",
  "Update samples: "+scan.workMs.length,
  "Median transform: "+reportValue(percentile(scan.workMs,.50))+" ms",
  "P95 transform: "+reportValue(percentile(scan.workMs,.95))+" ms",
  "Worst transform: "+reportValue(scan.workMs.length?round(Math.max(...scan.workMs),2):null)+" ms",
  "Total transform work: "+round(scan.workMs.reduce((x,y)=>x+y,0),0)+" ms",
  "",
  "[BROWSER LONG TASKS]",
  "Long tasks observed: "+scan.longTasks.length+(scan.longTaskSupported?" (supported API)":" (not supported by browser)"),
  "Worst long task: "+reportValue(scan.longTasks.length?round(Math.max(...scan.longTasks),2):null)+" ms",
  "",
  "[NOTES]",
  "Technical performance report only. No game saves, account data, GPS location, or conversation contents were collected.",
  "Send this text to ChatGPT with a description of how dragging felt."
 ];
 scan.report=lines.join("\n");
 $("mapScanReport").value=scan.report;
 $("mapScanReport").hidden=false;
 $("startMapScan").hidden=false;$("stopMapScan").hidden=true;$("copyMapScan").hidden=false;
 panel.classList.remove("scan-running");
 renderStatus("Scan complete · "+frames.length+" frame samples · "+scan.moves+" pointer moves");
 $("mapScanHint").textContent=scan.moves<5?"Very little movement detected. Try again while actively dragging and pinching.":"Tap Copy report and paste the results into our ChatGPT conversation.";
 panel.scrollIntoView?.({behavior:"auto",block:"start"});
}
function pointerDown(e){
 if(!scan.active)return;
 scan.downs++;
 if(!scan.activePointers.size)scan.lastMoveAt=null;
 scan.activePointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
 scan.maxPointers=Math.max(scan.maxPointers,scan.activePointers.size);
}
function pointerMove(e){
 if(!scan.active)return;
 const last=scan.activePointers.get(e.pointerId);if(!last)return;
 scan.moves++;
 if(e.pointerType==="touch")scan.touchMoves++;else scan.mouseMoves++;
 scan.distancePx+=Math.hypot(e.clientX-last.x,e.clientY-last.y);
 scan.activePointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
 const t=now();if(scan.lastMoveAt!==null)scan.longestMoveGap=Math.max(scan.longestMoveGap,t-scan.lastMoveAt);
 scan.lastMoveAt=t;
}
function pointerEnd(e){
 if(!scan.active)return;
 if(e.type==="pointercancel")scan.cancels++;else scan.ups++;
 scan.activePointers.delete(e.pointerId);
}
function visibilityChange(){
 if(!scan.active)return;
 if(document.hidden&&scan.hiddenSince===null)scan.hiddenSince=now();
 else if(!document.hidden&&scan.hiddenSince!==null){scan.hiddenMs+=now()-scan.hiddenSince;scan.hiddenSince=null;}
}
const area=$("mapViewport");
area.addEventListener("pointerdown",pointerDown,{passive:true});
area.addEventListener("pointermove",pointerMove,{passive:true});
area.addEventListener("pointerup",pointerEnd,{passive:true});
area.addEventListener("pointercancel",pointerEnd,{passive:true});
document.addEventListener("visibilitychange",visibilityChange);
$("openMapScan").addEventListener("click",()=>{
 const show=panel.hidden;
 panel.hidden=!show;
 $("openMapScan").setAttribute("aria-expanded",String(show));
 if(show)panel.scrollIntoView?.({behavior:"auto",block:"nearest"});
});
$("closeMapScan").addEventListener("click",()=>{
 if(scan.active)stop();
 panel.hidden=true;
 $("openMapScan").setAttribute("aria-expanded","false");
});
$("startMapScan").addEventListener("click",start);
$("stopMapScan").addEventListener("click",stop);
$("copyMapScan").addEventListener("click",async()=>{
 if(!scan.report)return;
 const field=$("mapScanReport");
 let copied=false;
 if(navigator.clipboard?.writeText){
  try{await navigator.clipboard.writeText(scan.report);copied=true;}catch(_){}
 }
 if(!copied){
  field.focus();field.select();field.setSelectionRange?.(0,field.value.length);
  try{copied=!!document.execCommand?.("copy");}catch(_){}
 }
 $("mapScanHint").textContent=copied?"Copied! Paste the report into our ChatGPT conversation.":"Copy permission was blocked. Tap and hold the report text, Select All, then Copy.";
});
window.TZ_SCAN={
 get active(){return scan.active;},
 recordMapWork(ms){if(scan.active&&Number.isFinite(ms)&&scan.workMs.length<15000)scan.workMs.push(round(ms,3));},
 getReport(){return scan.report;},
 // Lightweight exposed stats support automated diagnostic UI tests.
 getStatus(){return{active:scan.active,moves:scan.moves,frames:scan.frameIntervals.length,work:scan.workMs.length};}
};
})();
