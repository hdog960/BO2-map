/* TranZit Field Atlas — offline, no accounts, no game-state access. */
(function(){
"use strict";
const D=window.TZ_DATA;if(!D){document.body.textContent="TranZit atlas data failed to load.";return;}
const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
const KEY="tranzit-atlas-save-v1";
const defaults={view:"map",side:"maxis",done:{},parts:{},found:{},crew:["Player 1","Player 2","Player 3","Player 4"],assign:{},mapFilters:[],mapMode:"route",atlasFilter:"all",zone:"depot",floor:0,selected:null,craftFocus:null,craftSelected:"jet"};
let state,priorState={};
try{priorState=JSON.parse(localStorage.getItem(KEY)||"{}")||{};state=Object.assign({},defaults,priorState);}catch(e){state=Object.assign({},defaults);}
if(!Array.isArray(state.mapFilters))state.mapFilters=defaults.mapFilters.slice();
// Older installs saved filters before map-view presets existed: preserve their chosen layers.
if(!Object.prototype.hasOwnProperty.call(priorState,"mapMode"))state.mapMode=state.mapFilters.length?"custom":"route";
const MAP_MODES={route:[],quest:["goal","bench"],gear:["perk","weapon","part","bench","box"],doors:["paid","turbine","special"]};
if(!Object.keys(MAP_MODES).includes(state.mapMode)&&state.mapMode!=="custom")state.mapMode="route";
if(!Array.isArray(state.crew)||state.crew.length!==4)state.crew=defaults.crew.slice();
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){console.warn("Progress storage unavailable",e)}};
// Migrate position-based IDs from the initial release to stable item IDs.
let migrated=false;for(const i of D.items){if(i.legacyId && state.found[i.legacyId] && !state.found[i.id]){state.found[i.id]=true;migrated=true;}}if(migrated)save();
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const zone=id=>D.zones.find(x=>x.id===id);
const buildById=id=>D.builds.find(x=>x.id===id);
const buildColor=id=>buildById(id)?.color||"#dbb274";
const buildCode=id=>buildById(id)?.code||"?";
function craftProgress(build){
 const found=build.parts.filter((_,i)=>!!state.parts[build.id+":"+i]).length;
 return {found,total:build.parts.length};
}
function craftCatalog(build,partIndex){
 const refs=build.parts[partIndex]?.[2]||[];
 return refs.map(ref=>D.items.find(i=>i.id===ref)).filter(Boolean);
}
function craftLocations(build,partIndex){
 const items=craftCatalog(build,partIndex),sites=[];
 for(const item of items){
  for(const z of [item.zone,...(item.alternateZones||[])])
   if(!sites.includes(z))sites.push(z);
 }
 return sites;
}
function craftLocationLabel(build,index){
 const names=craftLocations(build,index).map(z=>zone(z)?.name||z);
 return names.join(" / ")||zone(build.zone)?.name||"Area unknown";
}

const markPrice=v=>v?'<span class="meta">'+esc(v)+(v==="Turbine"||v==="Grenade"||v==="Power or Turbine"||v==="Remote Turbine"?"":" pts")+"</span>":"";
function category(type){return D.types[type]||D.types.secret}
function modal(title,body){$("#modalTitle").textContent=title;$("#modalBody").innerHTML=body;const d=$("#modal");if(!d.open)d.showModal();}
// M16.1: older saved destinations become secondary sheets without changing the save key.
if(state.view==="atlas"||state.view==="zones"){state.view="map";save();}
else if(state.view==="crew"){state.view="quest";save();}
if(!["map","quest","craft"].includes(state.view)){state.view="map";save();}
let sheetView=null, sheetReturnFocus=null;
const secondaryViews=new Set(["atlas","zones","crew"]);
function renderNav(){
 $$(".bottom-nav button").forEach(b=>{
  const active=b.dataset.view===state.view;
  b.classList.toggle("selected",active);
  if(active)b.setAttribute("aria-current","page");else b.removeAttribute?.("aria-current");
 });
 $$(".view").forEach(v=>v.classList.toggle("active",v.id==="view-"+(secondaryViews.has(v.id.slice(5))?sheetView:state.view)));
}
function closeSheet(restoreFocus=true){
 if(!sheetView)return;
 sheetView=null;
 $("#auxSheet").hidden=true;
 document.body?.classList?.remove("sheet-open");
 renderNav();
 if(restoreFocus)sheetReturnFocus?.focus?.();
 sheetReturnFocus=null;
}
function openSheet(view){
 if(!secondaryViews.has(view))return;
 if(!sheetView)sheetReturnFocus=document.activeElement;
 // Secondary features inherit a visible, semantically correct primary tab.
 if(view==="crew")state.view="quest";
 else state.view="map";
 save();
 sheetView=view;
 $("#auxSheet").hidden=false;
 document.body?.classList?.add("sheet-open");
 $("#sheetTitle").textContent={atlas:"Find anything",zones:"Interior & sites",crew:"Crew & match"}[view];
 renderNav();
 if(view==="atlas"){renderAtlas();$("#atlasSearch").focus?.();}
 else if(view==="zones")renderZones();
 else renderCrew();
 $("#auxSheet").scrollTop=0;
 if(view==="atlas")$("#atlasSearch").focus?.();
 else $("#closeSheet").focus?.();
}
function go(view){
 if(secondaryViews.has(view)){openSheet(view);return;}
 if(!["map","quest","craft"].includes(view))return;
 closeSheet(false);
 state.view=view;save();renderNav();
 if(view==="map")renderMap();
 if(view==="quest")renderQuest();
 if(view==="craft")renderCraftPanel();
 window.scrollTo({top:0,behavior:"auto"});
}
function selectZone(id){state.zone=id;state.floor=0;save();go("zones");}
function showItem(id){
 const item=D.items.find(x=>x.id===id);if(!item)return;
 const z=zone(item.zone),onMap=item.mapMode==="site-callout",b=buildById(item.buildId);
 const alt=item.alternateZones?.length?'<p><strong>Other possible area(s):</strong> '+item.alternateZones.map(x=>esc(zone(x).name)).join(", ")+'</p>':"";
 const tag=b?'<div class="craft-modal-tag" style="--craft-color:'+b.color+'"><b>'+esc(b.code)+'</b><span>'+esc(b.name)+(item.type==="bench"?" · Workbench":" · Part")+'</span></div>':"";
 const collect=b&&item.buildPartIndex!==null&&item.buildPartIndex!==undefined?
  '<button type="button" class="button ghost" data-part="'+b.id+':'+item.buildPartIndex+'">'+(state.parts[b.id+":"+item.buildPartIndex]?"✓ Collected":"Mark part collected")+'</button>':"";
 modal(item.name,tag+'<div class="kicker">'+esc(category(item.type).name)+' · '+esc(z.name)+'</div><p>'+esc(item.detail||"Check the area described below.")+'</p><div class="info"><b>Where:</b> '+esc(item.room||z.description||z.name)+(item.price?"<br><b>Price / requirement:</b> "+esc(item.price):"")+'</div>'+alt+'<div class="actions">'+(onMap?'<button type="button" class="button" data-find-on-map="'+esc(item.id)+'">⌖ Show location area</button>':"")+(b?'<button class="button ghost" type="button" data-craft-view="'+b.id+'">View '+esc(b.name)+' parts</button>':"")+collect+'<button type="button" class="button ghost" data-toggle-item="'+esc(item.id)+'">'+(state.found[id]?"✓ Tracked":"Mark found / opened")+'</button></div><p class="footer-note">'+esc(onMap?"Location-group callout only; the exact floor/world position is not verified.":"No fixed map pin: "+item.mapReason)+'</p>');
}
/* Interactive atlas. Pins are anchored to known sites, not invented exact in-room coordinates. */
const svgNS="http://www.w3.org/2000/svg";
const MAP_SYMBOLS={perk:"P",weapon:"W",part:"+",bench:"⚒",paid:"$",turbine:"T",special:"!",box:"?",secret:"★",goal:"⚡"};
const MAP_LABELS={perk:"Perks",weapon:"Wall guns",part:"Parts",bench:"Workbenches",paid:"Paid doors",turbine:"Turbine doors",special:"Special access",box:"Mystery Box",secret:"Secrets",goal:"Easter egg"};
const MAP_PRIORITY={perk:0,goal:1,box:2,bench:3,turbine:4,paid:5,special:6,weapon:7,part:8,secret:9};
// Category badges are callouts connected to the verified *site*, not in-room pins.
// See data.js item.mapMode and the complete placement audit in AUDIT_ICON_PLACEMENT.md.
// Start zoomed enough to actually explore the map with a finger; Reset still fits all.
let zoom=1,panX=0,panY=0,pointers=new Map(),dragged=false,lastDrag=0,lastDragPoint=null;
let nativeTouchSeen=false,nativeTouches=new Map(),nativeDrag=false;
let nativeTouchHandled=0,pointerHandled=0,panChanged=0,panAtBoundary=0,gestureStarts=0,pointerCaptureLost=0;

const MAP_WORLD_LABELS=[
 ["FARM",170,145],["DINER / GARAGE",503,26],["TOWN CENTER",358,140],
 ["BUS DEPOT",564,376],["POWER STATION",105,479],["THE TUNNEL",602,138],
 ["OBELISK / PYLON",205,183],["PROTOTYPE / NACHT",70,161],
 ["CABIN",255,293],["BRIDGE",495,188]
];
const MAP_TEXT_CORNER=[["NOT TO SCALE",535,558]];
const MAP_W=720,MAP_H=580;
if(!state.mapKind||!(state.mapKind==="all"||MAP_SYMBOLS[state.mapKind]))state.mapKind="all";
function svgEl(type,attrs,children){
 const el=document.createElementNS(svgNS,type);
 for(const [k,v] of Object.entries(attrs||{}))el.setAttribute(k,String(v));
 if(children!==undefined)el.textContent=String(children);
 return el;
}
function isInMappedSite(item,zoneId){
 return item.mapMode==="site-callout"&&(item.zone===zoneId||item.alternateZones?.includes(zoneId));
}
function placedItems(zoneId,type=null){
 return D.items.filter(i=>isInMappedSite(i,zoneId)&&(!type||i.type===type));
}
function renderCraftMapStrip(){
 const box=$("#craftMapStrip");
 if(!box)return;
 box.innerHTML='<button type="button" class="craft-map-choice all '+(!state.craftFocus?"active":"")+'" data-craft-map="all">ALL</button>'+
 D.builds.map(b=>'<button type="button" data-craft-map="'+b.id+'" class="craft-map-choice '+(state.craftFocus===b.id?"active":"")+'" style="--craft-color:'+b.color+'" aria-pressed="'+(state.craftFocus===b.id)+'"><span>'+esc(b.code)+'</span><small>'+esc(b.name)+'</small></button>').join("");
}
function buildMarkersAtSite(z,pins){
 const b=buildById(state.craftFocus);if(!b)return;
 const entries=D.items.filter(i=>i.buildId===b.id&&(i.type==="part"||i.type==="bench")&&isInMappedSite(i,z.id));
 entries.forEach((item,index)=>{
  const [x,y]=calloutSpot(z,index);
  pins.appendChild(svgEl("line",{x1:x,y1:y,x2:z.x,y2:z.y,stroke:b.color,"stroke-width":1.5,"stroke-dasharray":"4 5",opacity:.8,"pointer-events":"none"}));
  const g=pinGroup(x,y,{"data-item":item.id,"data-craft-pin":b.id,"class":"pin atlas-pin item-pin craft-source-pin",
    "aria-label":b.name+" "+(item.type==="bench"?"workbench":item.name)+" at "+z.name+"; location callout"});
  const mark=item.type==="bench"?"⚒":b.code,done=item.buildPartIndex!==null&&item.buildPartIndex!==undefined&&state.parts[b.id+":"+item.buildPartIndex];
  g.append(svgEl("rect",{x:-17,y:-16,width:34,height:32,rx:8,fill:done?"#72b899":b.color,stroke:state.selected===item.id?"#fff":"#14252b","stroke-width":state.selected===item.id?3:2}));
  g.append(svgEl("text",{x:0,y:5,fill:"#0b1b21","font-size":mark.length>2?10.5:13,"font-weight":"900","text-anchor":"middle"},done?"✓":mark));
  const label=item.type==="bench"?"Workbench":item.name.replace(/^(Jet Gun|Turbine|Shield|Turret|Electric Trap|NAV) /,"");
  const right=x<=520,tx=right?21:-21;
  g.append(svgEl("text",{x:tx,y:4,"class":"item-map-label craft-map-label","text-anchor":right?"start":"end"},label.length>21?label.slice(0,19)+"…":label));
  g.append(svgEl("title",{},b.name+" · "+item.name+" · "+z.name+" · "+item.room+(item.alternateZones.length?" · possible alternate area":"")));
  pins.appendChild(g);
 });
}
function drawMapKey(){
 const list=D.items.filter(i=>i.mapMode==="site-callout");
 const types=[["all","ALL","All",list.length],...Object.keys(MAP_SYMBOLS).map(type=>[type,MAP_SYMBOLS[type],MAP_LABELS[type],list.filter(i=>i.type===type).length])];
 $("#mapLegend").innerHTML=types.map(([kind,symbol,title,count])=>{
  const color=kind==="all"?"#ecd09a":category(kind).color,active=state.mapKind===kind;
  return '<button type="button" class="legend-button '+(active?"active":"")+'" data-map-key="'+kind+'" aria-pressed="'+active+'" title="Site-based category marker, not an exact object coordinate"><span class="legend-symbol" style="background:'+color+'">'+esc(symbol)+'</span><span class="legend-label">'+esc(title)+'</span><span class="legend-count">'+count+'</span></button>';
 }).join("");
}
function mapItemsFor(zoneId){
 const items=placedItems(zoneId,state.mapKind==="all"?null:state.mapKind);
 const groups=Object.keys(MAP_SYMBOLS).map(type=>({type,items:items.filter(i=>i.type===type)})).filter(g=>g.items.length);
 groups.sort((a,b)=>(MAP_PRIORITY[a.type]??10)-(MAP_PRIORITY[b.type]??10));
 const cap=state.mapKind==="all"?(zoom>2.75?4:zoom>2.2?3:2):groups.length;
 const picked=groups.slice(0,cap);
 const selected=state.selected&&D.items.find(i=>i.id===state.selected);
 if(selected&&isInMappedSite(selected,zoneId)&&!picked.some(g=>g.type===selected.type)){
  const wanted=groups.find(g=>g.type===selected.type);
  if(wanted){if(picked.length>=cap)picked.pop();picked.push(wanted);}
 }
 const displayedItems=picked.reduce((n,g)=>n+g.items.length,0);
 return {groups:picked,hidden:items.length-displayedItems,total:items.length};
}
function calloutSpot(z,index){
 // Every badge is visually tethered to the central verified site marker.
 // Badge offsets are *interface layout*, never alleged game coordinates.
 const orientations={
  depot:0,diner:2,farm:1,town:2,power:0,
  pylon:1,nacht:0,tunnel:2,cabin:0,bridge:1
 };
 const base=orientations[z.id]||0;
 const offsets=[[40,-29],[40,30],[-40,-29],[-40,30],[0,-55],[0,55],[-59,0],[59,0]];
 const off=offsets[(index+base)%offsets.length];
 return [Math.max(28,Math.min(690,z.x+off[0])),Math.max(30,Math.min(546,z.y+off[1]))];
}
function pinGroup(x,y,attrs){
 // Items are attached to geography via data coordinates. Their SVG shapes live at
 // local 0,0 so the camera can move their anchors without scaling their graphics.
 const group=svgEl("g",{"class":"pin atlas-pin","role":"button",tabindex:"0","data-world-x":x,"data-world-y":y,...attrs});
 group.appendChild(svgEl("circle",{cx:0,cy:0,r:23,fill:"transparent","pointer-events":"all","class":"pin-touch"}));
 return group;
}
function renderMapLabels(){
 const labels=$("#mapLabels");labels.textContent="";
 for(const [text,x,y] of MAP_WORLD_LABELS){
  const group=svgEl("g",{"class":"map-location-label","data-world-x":x,"data-world-y":y});
  group.append(svgEl("text",{x:0,y:0,"text-anchor":"middle","class":"fixed-world-label"},text));
  labels.appendChild(group);
 }
 for(const [text,x,y] of MAP_TEXT_CORNER){
  const group=svgEl("g",{"class":"map-location-label map-corner-label","data-world-x":x,"data-world-y":y});
  group.append(svgEl("text",{x:0,y:0,"text-anchor":"start","class":"fixed-world-label"},text));
  labels.appendChild(group);
 }
}
function renderMapMarkers(){
 const pins=$("#mapPins");pins.textContent="";
 D.zones.forEach(z=>{
  const site=pinGroup(z.x,z.y,{"data-zone":z.id,"aria-label":(z.stop?"Bus stop "+z.stop+" ":"")+z.name});
  const main=svgEl("circle",{cx:0,cy:0,r:z.stop?16:13,fill:z.stop?"#eac182":"#88c5b7","class":"site-pin"});
  const number=svgEl("text",{x:0,y:5,"font-size":z.stop?14:11,"font-weight":"900","text-anchor":"middle",fill:"#101c1f"},z.stop?z.stop:"◆");
  const title=svgEl("title",{},z.name+" — tap to inspect items in this area");
  site.append(main,number,title);pins.appendChild(site);
  if(state.craftFocus){buildMarkersAtSite(z,pins);return;}
  const data=mapItemsFor(z.id);
  data.groups.forEach((categoryGroup,index)=>{
   const [x,y]=calloutSpot(z,index),type=categoryGroup.type,count=categoryGroup.items.length;
   const dx=z.x-x,dy=z.y-y;
   // A leader line clearly identifies these as site-linked category callouts.
   const leader=svgEl("line",{x1:x,y1:y,x2:z.x,y2:z.y,"stroke":"#debe84","stroke-width":1.25,"stroke-dasharray":"3 5",opacity:.66,"pointer-events":"none"});
   pins.appendChild(leader);
   const group=pinGroup(x,y,{"data-group":z.id+"|"+type,"class":"pin atlas-pin item-pin site-callout",
      "aria-label":count+" "+MAP_LABELS[type]+" associated with "+z.name+"; tap for rooms, not exact map coordinate"});
   const radius=14;
   group.append(svgEl("rect",{x:-radius,y:-radius,width:radius*2,height:radius*2,rx:7,fill:category(type).color,stroke:"#16262d","stroke-width":2}));
   group.append(svgEl("text",{x:0,y:4.6,fill:"#0e2327","font-size":"14","font-weight":"900","text-anchor":"middle"},MAP_SYMBOLS[type]));
   if(count>1)group.append(svgEl("text",{x:13,y:-11,"class":"callout-count","text-anchor":"middle"},count));
   if(state.mapKind!=="all"){
    const right=x<525,anchor=right?"start":"end",lx=right?19:-19;
    group.append(svgEl("text",{x:lx,y:3.5,"class":"item-map-label","text-anchor":anchor},MAP_LABELS[type]));
   }
   group.append(svgEl("title",{},MAP_LABELS[type]+" at "+z.name+" — "+count+" entries. Tap for exact room descriptions."));
   pins.appendChild(group);
  });
  if(data.hidden>0){
   const [x,y]=calloutSpot(z,data.groups.length);
   const g=pinGroup(x,y,{"data-map-more":z.id,"aria-label":data.hidden+" other site-linked entries at "+z.name});
   pins.append(svgEl("line",{x1:x,y1:y,x2:z.x,y2:z.y,stroke:"#debe84","stroke-width":1,"stroke-dasharray":"3 5",opacity:.6,"pointer-events":"none"}));
   g.append(svgEl("rect",{x:-19,y:-12,width:38,height:24,rx:9,fill:"#172c36",stroke:"#f0c582","stroke-width":2}));
   g.append(svgEl("text",{x:0,y:4,"font-size":11,"font-weight":"850","text-anchor":"middle",fill:"#f6d69b"},"+"+data.hidden));
   g.append(svgEl("title",{},data.hidden+" additional site-linked entries at "+z.name+" — opens item list"));
   pins.appendChild(g);
  }
 });
 positionMapOverlays();lastMarkerBand=mapMarkerBand();
}
function renderMap(){
 refreshMapMetrics();drawMapKey();renderCraftMapStrip();renderMapLabels();renderMapMarkers();applyTransform();
 if(state.selected)context(state.selected);else closeMapContext();
}
function closeMapContext(){
 const pop=$("#mapContext");pop.hidden=true;pop.innerHTML="";state.selected=null;save();
}
function mapCard(body,eyebrow,title){
 const pop=$("#mapContext");
 // A pin tap takes priority over the filter drawer. The sheet scrolls on its
 // own and never blocks a native drag/pinch starting outside the sheet.
 const filter=$("#mapKeyDisclosure");if(filter)filter.open=false;
 pop.hidden=false;
 pop.innerHTML='<div class="map-sheet-handle" aria-hidden="true"></div><div class="map-card-top"><span>'+esc(eyebrow)+'</span><button type="button" id="closeMapContext" aria-label="Close map information">✕</button></div><h3>'+esc(title)+'</h3>'+body;
 pop.scrollTop=0;
}
function showCraftOnMap(buildId,partIndex=null,bench=false){
 const build=buildById(buildId);if(!build)return;
 state.craftSelected=build.id;
 state.craftFocus=build.id;
 state.mapKind="part";
 const source=bench?D.items.find(i=>i.id===build.benchItemId):partIndex!==null?craftCatalog(build,partIndex)[0]:null;
 const siteIds=partIndex!==null?craftLocations(build,partIndex):[];
 // Bus upgrades attach to a moving bus. Do not simulate a stationary bench pin.
 const mobileInstall=bench&&!build.benchItemId;
 state.selected=source?.id||null;
 if(partIndex===null&&!bench)state.selected=null;
 go("map");
 // Whole-map overview shows all candidate part sites at once.
 if(mobileInstall||(partIndex===null&&!bench)||siteIds.length>1){
  zoom=1;panX=0;panY=0;renderMapMarkers();applyTransform();
  return;
 }
 const target=source?.zone||build.zone,z=zone(target);
 if(z){
  zoom=2.05;panX=360-z.x*zoom;panY=290-z.y*zoom;
  clampMap();renderMapMarkers();applyTransform();
 }
}
function context(key){
 if(key.startsWith("zone:")){
  const z=zone(key.slice(5));if(!z)return;
  state.selected=key;
  const arr=state.craftFocus?placedItems(z.id).filter(i=>i.buildId===state.craftFocus):placedItems(z.id);
  const notable=arr.slice().sort((a,b)=>(MAP_PRIORITY[a.type]??10)-(MAP_PRIORITY[b.type]??10)).slice(0,6);
  mapCard('<p>'+esc(z.description)+'</p><div class="map-sheet-footnote">Known site, not a verified indoor pickup position.</div><div class="map-card-items">'+notable.map(i=>'<button type="button" data-map-item="'+esc(i.id)+'"><span class="inline-pin" style="background:'+category(i.type).color+'">'+esc(MAP_SYMBOLS[i.type])+'</span>'+esc(i.name)+'</button>').join("")+'</div><div class="map-card-actions"><button type="button" class="button" data-map-more="'+z.id+'">All '+arr.length+' items here</button><button type="button" class="button ghost" data-open-zone="'+z.id+'">Room guide</button></div>',
   z.stop?"BUS STOP "+z.stop:"LANDMARK",z.name);
 }else if(key.startsWith("more:")||key.startsWith("group:")){
  const ref=key.slice(key.indexOf(":")+1),parts=ref.split("|"),z=zone(parts[0]);if(!z)return;
  const type=parts[1],arr=placedItems(z.id,type).filter(i=>!state.craftFocus||i.buildId===state.craftFocus);
  state.selected=key;
  mapCard('<p>'+esc(z.name)+' — tap any entry for its verified area/room description. Badge positions are callouts, not exact coordinates.</p><div class="map-card-list">'+arr.map(i=>'<button type="button" data-map-item="'+esc(i.id)+'"><span class="inline-pin" style="background:'+category(i.type).color+'">'+esc(MAP_SYMBOLS[i.type])+'</span><span><strong>'+esc(i.name)+'</strong><small>'+esc(i.room)+'</small></span><span class="map-list-arrow">›</span></button>').join("")+'</div><div class="map-card-actions"><button type="button" class="button ghost" data-open-zone="'+z.id+'">Room guide</button></div>',
   "LOCATION INDEX",z.name+" · "+arr.length+" entries");
 }else{
  const item=D.items.find(i=>i.id===key);if(!item)return;
  state.selected=key;
  const b=buildById(item.buildId),ix=item.buildPartIndex;
  const tag=b?'<div class="craft-modal-tag" style="--craft-color:'+b.color+'"><b>'+esc(b.code)+'</b><span>'+esc(b.name)+(item.type==="bench"?" · Bench":" · Part")+'</span></div>':"";
  const partCheck=b&&ix!==null&&ix!==undefined?'<button class="button" type="button" data-part="'+b.id+':'+ix+'">'+(state.parts[b.id+":"+ix]?"✓ Collected":"Mark "+esc(b.code)+" part collected")+'</button>':"";
  const alts=item.alternateZones?.length?'<p><b>Alternate possible areas:</b> '+item.alternateZones.map(a=>esc(zone(a).name)).join(", ")+'</p>':"";
  mapCard(tag+'<div class="map-sheet-facts"><div><small>AREA / ROOM</small><strong>'+esc(item.room||zone(item.zone).description)+'</strong></div>'+(item.price?'<div><small>COST / ACCESS</small><strong>'+esc(item.price)+(isNaN(Number(item.price))?"":" points")+'</strong></div>':"")+'</div><p>'+esc(item.detail||"See the location notes.")+'</p>'+alts+'<details class="map-accuracy-note"><summary>Location accuracy</summary><p>'+esc(item.mapReason)+'</p></details><div class="map-card-actions">'+partCheck+(b?'<button class="button ghost" type="button" data-craft-view="'+b.id+'">All '+esc(b.name)+' parts</button>':'')+'<button type="button" class="button" data-toggle-item="'+esc(item.id)+'">'+(state.found[item.id]?"✓ Tracked":"Mark found / opened")+'</button><button type="button" class="button ghost" data-map-more="'+item.zone+'">More at '+esc(zone(item.zone).name)+'</button></div>',
   MAP_LABELS[item.type]+" · "+zone(item.zone).name,item.name);
 }
 save();
}
let mapMetrics=null,mapRaf=0,lastMarkerBand=-1,lastOverlayZoom=NaN,overlayDirty=true;
let cameraFrames=0,overlayRefreshes=0,gestureEvents=0;
function refreshMapMetrics(){
 const svg=$("#worldMap"),r=svg.getBoundingClientRect();
 const width=r.width||svg.clientWidth||$("#mapViewport").clientWidth||MAP_W;
 const height=r.height||svg.clientHeight||$("#mapViewport").clientHeight||MAP_H;
 // The viewport intentionally crops the schematic (SVG slice), so use the same
 // aspect scale for world, hit-testing and inverse-scaled labels. No fake pins.
 const k=Math.max(0.15,Math.max(width/MAP_W,height/MAP_H));
 mapMetrics={left:r.left||0,top:r.top||0,k,
  offX:(width-MAP_W*k)/2,offY:(height-MAP_H*k)/2};
 overlayDirty=true;
 return mapMetrics;
}
function mapPixelScale(){return (mapMetrics||refreshMapMetrics()).k;}
function pointerToMap(e){
 const m=mapMetrics||refreshMapMetrics();
 return {x:((e.clientX??0)-m.left-m.offX)/m.k,y:((e.clientY??0)-m.top-m.offY)/m.k};
}
function positionMapOverlays(){
 // Reapply inverse zoom on rare zoom/viewport changes; pan updates only two parent groups.
 const fixedSize=1/(zoom*mapPixelScale());
 for(const node of $$("#mapLabels [data-world-x],#mapPins [data-world-x]")){
  const x=Number(node.dataset.worldX),y=Number(node.dataset.worldY);
  node.setAttribute("transform","translate("+x+" "+y+") scale("+fixedSize.toFixed(5)+")");
 }
 overlayRefreshes++;
 lastOverlayZoom=zoom;overlayDirty=false;
}
function mapMarkerBand(){return zoom>2.75?2:zoom>2.2?1:0;}
function applyTransform(){
 mapRaf=0;cameraFrames++;
 const profiler=window.TZ_SCAN,stamp=profiler?.active?performance.now():0;
 const band=mapMarkerBand();
 if(band!==lastMarkerBand){lastMarkerBand=band;renderMapMarkers();}
 if(overlayDirty||Math.abs(lastOverlayZoom-zoom)>0.00001)positionMapOverlays();
 const t="translate("+panX.toFixed(3)+" "+panY.toFixed(3)+") scale("+zoom.toFixed(5)+")";
 $("#mapWorld").setAttribute("transform",t);
 $("#mapOverlay").setAttribute("transform",t);
 if(stamp)profiler.recordMapWork(performance.now()-stamp);
}
function requestMapFrame(){
 if(mapRaf)return;
 if(typeof requestAnimationFrame!=="function"){applyTransform();return;}
 mapRaf=requestAnimationFrame(applyTransform);
}
function flushMapFrame(){
 if(mapRaf&&typeof cancelAnimationFrame==="function")cancelAnimationFrame(mapRaf);
 mapRaf=0;applyTransform();
}
function clampMap(){
 // SVG 'slice' crops the virtual world to the screen aspect ratio. Camera bounds
 // must include the visible slice, or edge sites cannot be reached on portrait iPhones.
 const m=mapMetrics||refreshMapMetrics(),svg=$("#worldMap");
 const spanX=(svg.clientWidth||MAP_W)/m.k,spanY=(svg.clientHeight||MAP_H)/m.k;
 const originX=m.offX/m.k,originY=m.offY/m.k;
 const slack=zoom<=1.001?20:0;
 const lowX=spanX-originX-MAP_W*zoom-slack,highX=-originX+slack;
 const lowY=spanY-originY-MAP_H*zoom-slack,highY=-originY+slack;
 panX=lowX>highX?(lowX+highX)/2:Math.max(lowX,Math.min(highX,panX));
 panY=lowY>highY?(lowY+highY)/2:Math.max(lowY,Math.min(highY,panY));
}
function setZoom(next,center={x:MAP_W/2,y:MAP_H/2}){
 const old=zoom,newZoom=Math.min(4,Math.max(1,next));
 if(Math.abs(old-newZoom)<0.00001)return;
 const worldX=(center.x-panX)/old,worldY=(center.y-panY)/old;
 zoom=newZoom;
 panX=center.x-worldX*zoom;
 panY=center.y-worldY*zoom;
 clampMap();
 applyTransform();
}
function resetMap(){zoom=1;panX=0;panY=0;renderMapMarkers();applyTransform();}
function setMapExpanded(expanded){
 $("#interactiveMap").classList.toggle("map-expanded",expanded);
 document.body.classList.toggle("atlas-expanded",expanded);
 $("#mapExit").hidden=!expanded;
 $("#mapFullScreen").textContent=expanded?"Close map":"Full map";
 refreshMapMetrics();renderMapMarkers();applyTransform();
}
function roomSvg(rooms){
return '<div class="zone-art"><svg viewBox="0 0 610 355" role="img" aria-label="Conceptual room-adjacency diagram"><g stroke="#9f9575" stroke-width="3" opacity=".6" stroke-dasharray="6 8"><path d="M10 336 H600"/></g>'+rooms.map((r,i)=>'<g data-room="'+esc(r.name)+'" style="cursor:pointer"><rect class="room-shape '+(i%2?"alt":"")+'" x="'+r.x+'" y="'+r.y+'" width="'+r.w+'" height="'+r.h+'" rx="5"/><text class="room-text" x="'+(r.x+r.w/2)+'" y="'+(r.y+r.h/2)+'">'+esc(r.name.length>24?r.name.slice(0,21)+"…":r.name)+'</text></g>').join("")+'</svg><div id="roomNotice" class="footer-note">Tap a room to highlight its name. Diagram is not a measured footprint or verified doorway layout.</div></div>';
}
function renderZones(){
 const selector=$("#zoneSelect");
 const stops=D.zones.filter(z=>z.stop).sort((a,b)=>a.stop-b.stop);
 const hidden=D.zones.filter(z=>!z.stop);
 selector.innerHTML='<optgroup label="Bus stops">'+stops.map(z=>'<option value="'+z.id+'">'+z.stop+'. '+esc(z.name)+'</option>').join("")+'</optgroup><optgroup label="Between stops & hidden areas">'+hidden.map(z=>'<option value="'+z.id+'">'+esc(z.name)+'</option>').join("")+'</optgroup>';
 selector.value=state.zone;
 $("#zoneTabs").innerHTML=stops.map(z=>'<button type="button" class="chip '+(state.zone===z.id?"on":"")+'" data-zone-tab="'+z.id+'">'+z.stop+'. '+esc(z.name.replace(" & Garage","").replace(" Station",""))+'</button>').join("");
 const z=zone(state.zone)||D.zones[0],plan=D.plans[z.id];
 const all=D.items.filter(i=>i.zone===z.id&&i.type!=="stop");
 let html='<div class="card site-overview"><div class="kicker">'+(z.stop?"BUS STOP "+z.stop:"OFF-ROUTE LOCATION")+'</div><h3>'+esc(z.name)+'</h3><p>'+esc(z.description)+'</p><div class="actions"><button type="button" class="button ghost" data-search-zone="'+z.id+'">Find all '+all.length+' entries here</button></div></div>';
 if(plan){
  const floor=plan.floors[Math.max(0,Math.min(state.floor,plan.floors.length-1))];
  html+='<div class="site-diagram-heading"><strong>Room guide</strong><span>Schematic · not measured</span></div><div class="floor-toggle">'+plan.floors.map((f,i)=>'<button type="button" data-floor="'+i+'" class="'+(i===state.floor?"on":"")+'" aria-pressed="'+(i===state.floor)+'">'+esc(f.name)+'</button>').join("")+'</div>'+roomSvg(floor.rooms);
 }else html+='<div class="info">No verified interior plan for this landmark. Use the listed in-game area descriptions rather than guessing building geometry.</div>';
 html+='<div class="site-diagram-heading"><strong>What is here?</strong><span>'+all.length+' entries</span></div>';
 for(const [type,t] of Object.entries(D.types)){
  const arr=all.filter(i=>i.type===type);if(!arr.length)continue;
  html+='<div class="location-group"><h3><span style="color:'+t.color+'">●</span> '+esc(t.name)+' · '+arr.length+'</h3>'+
  arr.map(i=>'<div class="row-item"><div class="left"><strong>'+esc(i.name)+'</strong><small>'+esc(i.room)+(i.price?" · "+esc(i.price):"")+'</small></div><button type="button" class="button ghost" data-show-item="'+i.id+'">Details</button></div>').join("")+'</div>';
 }
 $("#zonePlan").innerHTML=html;
}
function renderQuestCrewSummary(){
 const panel=$("#questCrewSummary");if(!panel)return;
 const assigned=Object.entries(state.assign).filter(([key,v])=>key.startsWith(state.side+":")&&v!==""&&v!==undefined&&v!==null).length;
 panel.innerHTML='<div class="quest-roster">'+state.crew.map((name,i)=>
  '<div class="quest-roster-person"><span>PLAYER '+(i+1)+'</span><strong>'+esc(name)+'</strong></div>'
 ).join("")+'</div><p class="quest-crew-footnote">'+assigned+' of '+D.quests[state.side].length+' '+(state.side==="maxis"?"Maxis":"Richtofen")+' objectives assigned. Player names and assignments are saved on this device only.</p>';
}
function renderQuest(){
 if(!D.quests[state.side]){state.side="maxis";save();}
 $$("[data-side]").forEach(b=>{
  const active=b.dataset.side===state.side;
  b.classList.toggle("on",active);
  b.setAttribute("aria-pressed",String(active));
 });
 renderQuestCrewSummary();
 const steps=D.quests[state.side];
 const completed=steps.filter((_,i)=>!!state.done[state.side+":"+i]).length;
 const next=steps.findIndex((_,i)=>!state.done[state.side+":"+i]);
 const pct=Math.round(100*completed/steps.length);
 const nextStep=next>=0?steps[next]:null;
 let html='<div class="quest-progress" aria-label="'+completed+' of '+steps.length+' '+state.side+' objectives completed">'+
  '<div class="quest-progress-text"><span><strong>'+completed+'/'+steps.length+'</strong> STEPS COMPLETE</span><span>'+pct+'%</span></div>'+
  '<div class="progress-track" role="progressbar" aria-label="Completed '+state.side+' steps" aria-valuemin="0" aria-valuemax="'+steps.length+'" aria-valuenow="'+completed+'"><div class="progress-bar" style="width:'+pct+'%"></div></div></div>';
 // Source-backed setup prerequisites, not an invented new route requirement.
 html+='<details class="quest-prep" id="questPrerequisites"><summary>BEFORE YOU START <span>Original difficulty · 4 players</span></summary>'+
  '<div class="quest-prep-content"><p>Use Original difficulty, not Easy. Coordinate all four players and verify any prior Easter egg completion state.</p>'+
  (state.side==="richtofen"?'<p>On Richtofen’s route, the Samuel player must hear the required voice lines.</p>':"")+
  '<p>Every checkbox is a manual record; the atlas cannot detect your BO2 match or sync progress between phones.</p></div></details>';
 if(nextStep){
  const who=state.assign[state.side+":"+next];
  const assigned=who!==""&&who!==undefined?state.crew[Number(who)]:"Unassigned";
  html+='<section class="next quest-next" aria-label="Next objective" aria-live="polite">'+
   '<div class="num">YOUR NEXT OBJECTIVE <span>STEP '+(next+1)+' OF '+steps.length+'</span></div>'+
   '<h3>'+esc(nextStep.title)+'</h3>'+
   '<p>'+esc(nextStep.note)+'</p>'+
   '<div class="quest-next-meta"><span>SITE · '+esc(zone(nextStep.zone).name)+'</span><span>♧ '+esc(assigned)+'</span></div>'+
   '<div class="actions quest-next-actions">'+
    '<button type="button" class="button quest-location" data-quest-zone="'+nextStep.zone+'">Show on map</button>'+
    '<button type="button" class="button ghost quest-complete" data-quest-done="'+next+'">✓ Mark step complete</button></div>'+
   '<p class="quest-manual-caveat">Confirm this action in-game before checking it off.</p></section>';
 }else{
  html+='<section class="next quest-next quest-complete" aria-label="Checklist completed">'+
   '<div class="num">ALL CHECKLIST STEPS COMPLETE</div>'+
   '<h3>Verify the Easter egg in-game</h3>'+
   '<p>Your manual checklist is complete. Confirm the matching in-game dialogue and completion state; this app cannot verify or grant an achievement.</p></section>';
 }
 html+='<div class="quest-list-heading"><strong>ALL '+steps.length+' OBJECTIVES</strong><span>Completed steps stay collapsed</span></div>';
 steps.forEach((step,i)=>{
  const key=state.side+":"+i,done=!!state.done[key],isNext=i===next,assigned=state.assign[key]??"";
  const who=assigned!==""?state.crew[Number(assigned)]:"";
  const stepStatus=done?"COMPLETE":isNext?"CURRENT":"UPCOMING";
  html+='<section class="step quest-step '+(done?"done ":"")+(isNext?"current":"")+'" data-quest-step="'+i+'" '+(isNext?'aria-current="step"':"")+'>'+
   '<div class="step-top"><button class="tick '+(done?"checked":"")+'" type="button" data-quest-done="'+i+'" aria-label="'+(done?"Mark incomplete: ":"Mark complete: ")+esc(step.title)+'" aria-pressed="'+done+'">'+(done?"✓":i+1)+'</button>'+
   '<div class="quest-step-head"><span class="quest-step-state">'+stepStatus+' · '+esc(zone(step.zone).name)+'</span>'+
   '<strong>'+esc(step.title)+'</strong><div class="step-count">'+(who?"Assigned: "+esc(who):"No player assigned")+'</div></div></div>'+
   '<details class="step-reveal quest-step-details" '+(isNext?"open":"")+'><summary>Instructions, location & crew</summary>'+
   '<div class="quest-step-body"><p>'+esc(step.note)+'</p>'+
   '<div class="step-extra"><div class="flex between"><span class="pill">SITE · '+esc(zone(step.zone).name)+'</span>'+
   '<button type="button" class="button ghost" data-quest-zone="'+step.zone+'">Show location</button></div>'+
   '<label class="small muted" for="questAssign'+i+'">Assign to player</label>'+
   '<select class="assign" id="questAssign'+i+'" data-assignment="'+i+'" aria-label="Assign '+esc(step.title)+'"><option value="">Unassigned</option>'+
    state.crew.map((name,j)=>'<option value="'+j+'" '+(assigned===String(j)?"selected":"")+'>'+esc(name)+'</option>').join("")+'</select>'+
   '<details class="quest-troubleshooting"><summary>Checklist help</summary>'+
   '<p>Follow the instructions for this objective exactly. Check difficulty, crew coordination and prior completion requirements; for Richtofen, verify the Samuel player hears the required lines. The atlas tracks only manual checks, not live in-game success.</p></details>'+
   '</div></div></details></section>';
 });
 $("#questPanel").innerHTML=html;
}
function renderAtlas(){
 const active=state.atlasFilter;
 $("#atlasFilters").innerHTML='<button class="chip '+(active==="all"?"on":"")+'" data-atlas-filter="all" type="button">All · '+D.items.length+'</button>'+Object.entries(D.types).map(([k,t])=>'<button type="button" class="chip '+(active===k?"on":"")+'" data-atlas-filter="'+k+'">'+esc(t.name)+' · '+D.items.filter(x=>x.type===k).length+'</button>').join("");
 const term=$("#atlasSearch").value.trim().toLowerCase();
 const results=D.items.filter(i=>(active==="all"||i.type===active)&&(!term||[i.name,i.room,i.detail,zone(i.zone).name,i.price,category(i.type).name].join(" ").toLowerCase().includes(term)));
 if(term)results.sort((a,b)=>{
  const rank=x=>x.name.toLowerCase()===term?0:x.name.toLowerCase().startsWith(term)?1:x.name.toLowerCase().includes(term)?2:3;
  return rank(a)-rank(b);
 });
 $("#atlasCount").textContent=results.length+(results.length===1?" result":" results")+(term?' for "'+$("#atlasSearch").value.trim()+'"':" · Choose a category or search above");
 $("#atlasItems").innerHTML=results.map(i=>{
  const b=buildById(i.buildId),t=category(i.type),mark=b?b.code:t.short,color=b?b.color:t.color;
  return '<button type="button" class="atlas-item" data-show-item="'+esc(i.id)+'" aria-label="'+esc(i.name)+' in '+esc(zone(i.zone).name)+'"><span class="symbol" style="background:'+color+'">'+esc(mark)+'</span><span><strong>'+esc(i.name)+'</strong><small>'+esc(zone(i.zone).name)+' · '+esc(i.room)+'</small></span><span class="arr">'+(state.found[i.id]?"✓":"›")+'</span></button>';
 }).join("")||'<div class="empty"><strong>No matching locations</strong><p>Try another name, perk, door, or location; or clear your search.</p><button type="button" class="button ghost" data-quick-find="">Clear search</button></div>';
}
function renderCraftPanel(){
 if(!buildById(state.craftSelected))state.craftSelected="jet";
 const chosen=buildById(state.craftSelected),panel=$("#craftPanel");
 const previousPicker=panel.querySelector?.(".craft-selector-grid");
 const previousSelection=panel.querySelector?.(".craft-selector.selected")?.dataset.craftSelect;
 const previousScroll=previousPicker?.scrollLeft;
 const completedBuilds=D.builds.filter(b=>b.parts.every((_,i)=>!!state.parts[b.id+":"+i])).length;
 const collectedParts=D.builds.reduce((n,b)=>n+craftProgress(b).found,0);
 const totalParts=D.builds.reduce((n,b)=>n+b.parts.length,0);
 let html='<div class="craft-library-header"><div><strong>CHOOSE A BUILDABLE</strong><span>9 original builds · swipe to choose</span></div><span class="craft-library-progress">'+completedBuilds+'/9 ready · '+collectedParts+'/'+totalParts+' parts</span></div>';
 html+='<div class="craft-selector-grid" role="group" aria-label="Choose one of nine color-coded buildables">'+D.builds.map(b=>{
  const p=craftProgress(b),active=b.id===chosen.id;
  return '<button class="craft-selector '+(active?"selected":"")+'" type="button" data-craft-select="'+b.id+'" aria-pressed="'+active+'" aria-label="'+esc(b.name)+', '+p.found+' of '+p.total+' parts collected" style="--craft-color:'+b.color+'">'+
   '<span class="craft-emblem" aria-hidden="true">'+esc(b.code)+'</span><span class="craft-label"><strong>'+esc(b.name)+'</strong><small>'+(p.found===p.total?"Ready to assemble":p.found+'/'+p.total+' parts checked')+'</small></span></button>';
 }).join("")+'</div>';
 const progress=craftProgress(chosen),allDone=progress.found===progress.total;
 html+='<section class="craft-detail" style="--craft-color:'+chosen.color+'" aria-label="Selected '+esc(chosen.name)+' buildable"><div class="craft-detail-head">'+
  '<span class="craft-large-symbol" aria-hidden="true">'+esc(chosen.code)+'</span><div><div class="kicker">SELECTED BUILDABLE · '+esc(chosen.code)+'</div><h3>'+esc(chosen.name)+'</h3><p>'+esc(chosen.note)+'</p></div></div>';
 html+='<div class="craft-actions"><span class="craft-status" aria-live="polite">'+(allDone?"✓ All parts checked":progress.found+' of '+progress.total+' parts checked')+'</span>'+
  '<button class="button craft-show" type="button" data-craft-map="'+chosen.id+'">Show only this on map</button></div>';
 html+='<div class="craft-part-progress" role="progressbar" aria-label="'+esc(chosen.name)+' collected parts" aria-valuemin="0" aria-valuemax="'+progress.total+'" aria-valuenow="'+progress.found+'"><div style="width:'+((progress.found/progress.total)*100)+'%"></div></div>';
 html+='<div class="craft-part-heading"><strong>PART CHECKLIST</strong><span>Tap a circle when collected · map each source area</span></div>';
 html+='<div class="craft-part-list">'+chosen.parts.map((part,i)=>{
  const done=!!state.parts[chosen.id+":"+i],sites=craftLocations(chosen,i),loc=craftLocationLabel(chosen,i);
  const references=craftCatalog(chosen,i),room=references.map(item=>item.room).filter(Boolean);
  const rooms=[...new Set(room)],multi=sites.length>1;
  const extra=multi?'<div class="craft-alternates">ALTERNATE AREAS · One possible spawn, not an item at every site.</div>':"";
  const specific=chosen.id==="pap"?'The three Pack-a-Punch parts share a bank-area reference, not three independently measured pins.':chosen.id==="bus"?'Bus upgrades can appear across four powered rooms; one room is empty.':"";
  const sourceNote=rooms.length?'<div class="craft-room"><span>ROOM / REFERENCE</span><p>'+esc(rooms.slice(0,2).join(' · '))+(rooms.length>2?' · additional possibilities in map details':'')+'</p></div>':"";
  return '<article class="craft-part-row '+(done?"is-done":"")+'" data-craft-part="'+chosen.id+':'+i+'">'+
   '<button type="button" class="tick '+(done?"checked":"")+'" data-part="'+chosen.id+':'+i+'" aria-pressed="'+done+'" aria-label="'+(done?"Uncheck ":"Mark collected ")+esc(part[0])+'">'+(done?"✓":"○")+'</button>'+
   '<div class="craft-part-info"><strong><span class="mini-craft-code">'+esc(chosen.code)+'</span> '+esc(part[0])+'</strong>'+
    '<small class="craft-area">AREA · '+esc(loc)+'</small>'+sourceNote+
    '<small class="craft-part-guidance">'+esc(part[1])+'</small>'+extra+(specific?'<small class="craft-part-warning">'+esc(specific)+'</small>':"")+
   '</div><button type="button" class="craft-locate" data-craft-locate="'+chosen.id+':'+i+'" aria-label="Show '+esc(part[0])+' '+(multi?"possible areas":"source area")+' on map">'+(multi?"Show areas":"Map area")+'</button></article>';
 }).join("")+'</div>';
 html+='<div class="craft-bench"><div class="craft-bench-copy"><strong>'+(chosen.benchItemId?'WORKBENCH / ASSEMBLY':'BUS INSTALLATION · NO FIXED BENCH')+'</strong>'+
  '<span>'+esc(chosen.benchItemId?chosen.location+' · '+zone(chosen.zone).name:'Attach upgrades to the moving bus. Their candidate rooms are not fixed map pins.')+'</span></div>'+
  '<button type="button" class="button ghost" data-craft-bench="'+chosen.id+'">'+(chosen.benchItemId?"Show bench on map":"Show possible areas")+'</button></div>';
 html+='<details class="craft-accuracy"><summary>Map accuracy and saved progress</summary><p>Map badges identify verified sites and possible spawn areas, not exact pickup coordinates. A part may spawn in one of several rooms; source notes are not measured pins. These are manual checkmarks shared with Crew on this device only, not synchronized with Black Ops II.</p></details></section>';
 panel.innerHTML=html;
 // Keep the nine-build picker stable during checklist rerenders; when entering
 // Craftables from a map action, reveal the selected recipe without page-jumping.
 const picker=panel.querySelector?.(".craft-selector-grid");
 if(picker){
  if(previousSelection===chosen.id&&Number.isFinite(previousScroll))picker.scrollLeft=previousScroll;
  const active=picker.querySelector?.(".craft-selector.selected");
  if(active?.getBoundingClientRect){
   const target=active.getBoundingClientRect(),rail=picker.getBoundingClientRect();
   // First render may run inside a hidden tab, leaving a valid but unhelpful
   // scrollLeft=0. Recenter only if the chosen recipe is outside the rail.
   if(rail.width>0&&target.width>0&&(target.left<rail.left+2||target.right>rail.right-2))
    picker.scrollLeft=Math.max(0,picker.scrollLeft+target.left-rail.left-(rail.width-target.width)/2);
  }
 }
}
function renderCrew(){
 const panel=$("#crewPanel");
 const previouslyOpen=$$("details.build-card[open]").map(e=>e.dataset.build);
 const alreadyRendered=panel.dataset.ready==="1";
 const done=Object.values(state.done).filter(Boolean).length,parts=Object.values(state.parts).filter(Boolean).length;
 const totalParts=D.builds.reduce((n,b)=>n+b.parts.length,0);
 const completedBuilds=D.builds.filter(b=>b.parts.every((_,i)=>state.parts[b.id+":"+i])).length;
 let html='<div class="crew-grid">'+state.crew.map((name,i)=>'<div class="crew-card"><label for="crewName'+i+'">PLAYER '+(i+1)+'</label><input id="crewName'+i+'" type="text" maxlength="24" autocomplete="off" data-crew="'+i+'" value="'+esc(name)+'" aria-label="Player '+(i+1)+' name"></div>').join("")+'</div>';
 html+='<div class="info">Progress and assignments stay on this phone. This app does not automatically sync between friends.</div>';
 html+='<div class="stats"><div class="stat"><strong>4</strong><span>PLAYERS</span></div><div class="stat"><strong>'+parts+'/'+totalParts+'</strong><span>PARTS FOUND</span></div><div class="stat"><strong>'+completedBuilds+'/'+D.builds.length+'</strong><span>BUILDS READY</span></div></div>';
 html+='<div class="site-diagram-heading"><strong>Buildable tracker</strong><span>Open one to check its parts</span></div>';
 D.builds.forEach(b=>{
  const complete=b.parts.filter((_,i)=>state.parts[b.id+":"+i]).length;
  const isOpen=alreadyRendered?previouslyOpen.includes(b.id):b.id==="turbine";
  html+='<details class="build-card" data-build="'+b.id+'" style="--craft-color:'+b.color+'" '+(isOpen?"open":"")+'><summary><span><strong><span class="mini-craft-code">'+esc(b.code)+'</span> '+esc(b.name)+'</strong><small>'+esc(zone(b.zone).name)+' · '+esc(b.location)+'</small></span><span class="pill">'+complete+'/'+b.parts.length+'</span></summary><div class="build-content">'+
   b.parts.map((part,i)=>'<div class="row-item"><div class="left"><strong>'+esc(part[0])+'</strong><small>'+esc(part[1])+'</small></div><button class="tick '+(state.parts[b.id+":"+i]?"checked":"")+'" type="button" data-part="'+b.id+":"+i+'" aria-label="'+(state.parts[b.id+":"+i]?"Uncheck ":"Mark found ")+esc(part[0])+'" aria-pressed="'+!!state.parts[b.id+":"+i]+'">'+(state.parts[b.id+":"+i]?"✓":"○")+'</button></div>').join("")+
   '<div class="actions"><button class="button ghost" data-open-zone="'+b.zone+'">Show bench location</button></div></div></details>';
 });
 html+='<div class="card"><h3>New match?</h3><p>Reset checked objectives, parts, and item markers without removing your player names.</p><button class="button danger" id="resetSession" type="button">Reset this match</button></div>';
 html+='<details class="build-card reference-details"><summary><span><strong>Sources & accuracy notes</strong><small>Community guides and reference map</small></span></summary><div class="build-content"><p>World positions are reference-aligned; interiors and part markers remain schematic where not verified.</p>'+D.references.map(r=>'<div class="row-item"><a class="source-link" href="'+esc(r.url)+'" target="_blank" rel="noopener noreferrer">'+esc(r.name)+'</a></div>').join("")+'<p class="footer-note">Unofficial fan utility. No paid backend or live BO2 tracking. Offline caching requires one successful online load.</p></div></details>';
 panel.innerHTML=html;
 panel.dataset.ready="1";
}
function help(){
 modal("Help & Settings",'<div class="stack"><p><b>Map:</b> All major locations and important item icons appear directly on the geography. Tap a numbered stop, perk, weapon, part, bench or door marker to open its details. A <b>+number</b> marker lists the other items at that location.</p><p><b>Map key:</b> Each symbol has a color and meaning. Tap a category in the key to show more icons of that type, or <b>All</b> to restore the overview. Pinch to zoom, drag to pan, or expand the map.</p><p><b>Easter Egg:</b> The separate <b>EASTER EGG</b> tab contains the Maxis and Richtofen steps, progress checks and four-player assignments. A Locate button brings you back to the correct map site.</p><p><b>Sites, Find and Crew:</b> Room notes, searchable listings, buildable part checklists and names remain available without cluttering the main map.</p><p><b>Map diagnostics:</b> Run the privacy-safe v2 map performance scanner while panning and pinching, then copy the report.</p><button type="button" class="button" id="helpMapScan">Open map diagnostics</button><p><b>Offline:</b> Safari Share → Add to Home Screen. Launch once online, then test airplane mode. Information is saved only on your phone, not synced with the game.</p><p><b>Accuracy:</b> Roads and buildings follow the supplied reference map; icons are site-level guides, not measured in-game pickup coordinates. Alternate spawns are listed in details.</p></div>');
}
function isAccidentalMapClick(e){
 // Only disregard the single ghost click generated at the end of a drag,
 // not a separate tap elsewhere during the next fraction of a second.
 return !!(e.isTrusted&&lastDragPoint&&Date.now()-lastDrag<130&&
   Math.hypot((e.clientX??-1000)-lastDragPoint.x,(e.clientY??-1000)-lastDragPoint.y)<12);
}
document.addEventListener("click",e=>{
const b=e.target.closest("button,[data-zone],[data-room],[data-item],[data-group],[data-map-more],[data-map-item],[data-map-key]");
if(!b)return;
if(b.dataset.view){go(b.dataset.view);return;}
if(b.id==="closeSheet"){closeSheet();return;}
if(b.id==="crewAccess"){go("crew");return;}
if(b.id==="helpMapScan"){
 $("#modal").close();go("map");
 const scanner=$("#mapScanPanel");
 if(scanner.hidden)$("#openMapScan").click();
 scanner.scrollIntoView?.({behavior:"auto",block:"nearest"});
 return;
}
if(b.dataset.craftSelect){state.craftSelected=b.dataset.craftSelect;save();renderCraftPanel();return;}
if(b.dataset.craftView){state.craftSelected=b.dataset.craftView;save();if($("#modal").open)$("#modal").close();go("craft");return;}
if(b.dataset.craftMap){
 const drawer=$("#mapKeyDisclosure");if(drawer)drawer.open=false;
 state.craftFocus=b.dataset.craftMap==="all"?null:b.dataset.craftMap;
 state.mapKind=state.craftFocus?"part":"all";state.selected=null;
 if(state.craftFocus)state.craftSelected=state.craftFocus;
 save();go("map");zoom=1;panX=0;panY=0;renderMapMarkers();applyTransform();return;
}
if(b.dataset.craftLocate){
 const [id,idx]=b.dataset.craftLocate.split(":");
 showCraftOnMap(id,Number(idx));return;
}
if(b.dataset.craftBench){showCraftOnMap(b.dataset.craftBench,null,true);return;}
if(b.dataset.mapKey){const drawer=$("#mapKeyDisclosure");if(drawer)drawer.open=false;state.craftFocus=null;state.mapKind=b.dataset.mapKey;state.selected=null;save();renderMap();return;}
if(b.dataset.mapMore){if(!isAccidentalMapClick(e))context("more:"+b.dataset.mapMore);return;}
if(b.dataset.mapItem){context(b.dataset.mapItem);return;}
if(b.dataset.mapMode){state.mapMode=b.dataset.mapMode;state.mapFilters=MAP_MODES[state.mapMode].slice();save();renderMap();return;}
if(b.dataset.filter){const id=b.dataset.filter;state.mapFilters=state.mapFilters.includes(id)?state.mapFilters.filter(x=>x!==id):state.mapFilters.concat(id);state.mapMode="custom";save();renderMap();return;}
if(b.dataset.atlasFilter){state.atlasFilter=b.dataset.atlasFilter;save();renderAtlas();return;}
if(b.dataset.quickFind!==undefined){state.atlasFilter="all";$("#atlasSearch").value=b.dataset.quickFind;save();renderAtlas();$("#atlasSearch").focus?.();return;}
if(b.dataset.zoneTab){state.zone=b.dataset.zoneTab;state.floor=0;save();renderZones();return;}
if(b.dataset.floor){state.floor=Number(b.dataset.floor);save();renderZones();return;}
if(b.dataset.showItem){showItem(b.dataset.showItem);return;}
if(b.dataset.findOnMap){
 const item=D.items.find(i=>i.id===b.dataset.findOnMap);
 if(item&&item.mapMode==="site-callout"){
  $("#modal").close();
  if(item.buildId){state.craftSelected=item.buildId;state.craftFocus=item.buildId;state.mapKind="part";state.selected=item.id;}
  else{state.craftFocus=null;state.mapKind=item.type;state.selected="group:"+item.zone+"|"+item.type;}
  go("map");
 }return;
}
if(b.dataset.toggleItem){state.found[b.dataset.toggleItem]=!state.found[b.dataset.toggleItem];save();if($("#modal").open)$("#modal").close();renderMap();renderZones();renderAtlas();return;}
if(b.dataset.openZone){if($("#modal").open)$("#modal").close();selectZone(b.dataset.openZone);return;}
if(b.dataset.searchZone){state.atlasFilter="all";$("#atlasSearch").value=zone(b.dataset.searchZone).name;go("atlas");return;}
if(b.dataset.side){state.side=b.dataset.side;save();renderQuest();return;}
if(b.dataset.questDone!==undefined){const k=state.side+":"+b.dataset.questDone;state.done[k]=!state.done[k];save();renderQuest();return;}
if(b.dataset.questZone){state.craftFocus=null;state.mapKind="all";state.selected="zone:"+b.dataset.questZone;go("map");return;}
if(b.dataset.part){
 state.parts[b.dataset.part]=!state.parts[b.dataset.part];save();
 renderCrew();renderCraftPanel();if(state.view==="map")renderMap();return;
}
if(b.dataset.room){const label=$("#roomNotice");if(label)label.textContent=b.dataset.room+" · This conceptual room is not an exact floor plan.";return;}
if(b.dataset.group){if(!isAccidentalMapClick(e))context("group:"+b.dataset.group);return;}
if(b.dataset.item){if(!isAccidentalMapClick(e))context(b.dataset.item);return;}
if(b.dataset.zone){if(!isAccidentalMapClick(e))context("zone:"+b.dataset.zone);return;}
if(b.id==="resetSession"){modal("Reset this match?",'<p>This will clear quest checks, collected parts, marked doors/items and assignments on this phone. Your player names will remain.</p><div class="actions"><button class="button danger" id="confirmReset">Yes, reset progress</button><button class="button ghost" id="cancelReset">Cancel</button></div>');return;}
if(b.id==="confirmReset"){state.done={};state.parts={};state.found={};state.assign={};state.selected=null;save();$("#modal").close();renderCrew();renderCraftPanel();return;}
if(b.id==="cancelReset"||b.id==="closeModal"){$("#modal").close();return;}
if(b.id==="helpBtn"){help();return;}
if(b.id==="globalFind"){state.atlasFilter="all";$("#atlasSearch").value="";go("atlas");$("#atlasSearch").focus?.();return;}
if(b.id==="zoneOnMap"){state.selected="zone:"+state.zone;go("map");return;}
if(b.id==="resetMap"){resetMap();return;}
if(b.id==="closeMapContext"){closeMapContext();return;}
if(b.id==="mapFullScreen"){setMapExpanded(!$("#interactiveMap").classList.contains("map-expanded"));return;}
if(b.id==="mapExit"){setMapExpanded(false);return;}
if(b.id==="zoomIn"){setZoom(zoom*1.3);return;}
if(b.id==="zoomOut"){setZoom(zoom/1.3);return;}
});
document.addEventListener("keydown",e=>{
 if(e.key!=="Escape")return;
 if($("#modal").open){$("#modal").close();return;}
 if(sheetView){closeSheet();return;}
 if($("#mapKeyDisclosure")?.open){$("#mapKeyDisclosure").open=false;return;}
 if(!$("#mapContext").hidden){closeMapContext();return;}
 if($("#interactiveMap").classList.contains("map-expanded"))setMapExpanded(false);
});
document.addEventListener("change",e=>{if(e.target.dataset.assignment!==undefined){const stepNumber=e.target.dataset.assignment;state.assign[state.side+":"+stepNumber]=e.target.value;save();renderQuestCrewSummary();const step=e.target.closest?.(".quest-step");const status=step?.querySelector?.(".step-count");if(status)status.textContent=e.target.value!==""?"Assigned: "+state.crew[Number(e.target.value)]:"No player assigned";}
if(e.target.id==="zoneSelect"){state.zone=e.target.value;state.floor=0;save();renderZones();}});
document.addEventListener("input",e=>{if(e.target.id==="atlasSearch")renderAtlas();if(e.target.dataset.crew!==undefined){state.crew[Number(e.target.dataset.crew)]=e.target.value||"Player "+(Number(e.target.dataset.crew)+1);save();if(state.view==="quest")renderQuest();}});
$("#worldMap").addEventListener("keydown",e=>{if((e.key==="Enter"||e.key===" ")&&e.target.matches("[data-zone],[data-item],[data-group],[data-map-more]")){e.preventDefault();e.target.dispatchEvent(new MouseEvent("click",{bubbles:true}));}});
const vp=$("#mapViewport");
function moveCamera(dx,dy){
 const wasX=panX,wasY=panY;
 panX+=dx;panY+=dy;
 clampMap();
 if(Math.abs(panX-wasX)+Math.abs(panY-wasY)>0.0001){
  panChanged++;
  requestMapFrame();
 }else panAtBoundary++;
}
function pinchCamera(oldMid,nextMid,oldSpan,newSpan){
 const oldZoom=zoom;
 const wx=(oldMid.x-panX)/zoom,wy=(oldMid.y-panY)/zoom;
 if(oldSpan>1)zoom=Math.min(4,Math.max(1,zoom*newSpan/oldSpan));
 const oldX=panX,oldY=panY;
 panX=nextMid.x-wx*zoom;panY=nextMid.y-wy*zoom;
 clampMap();
 if(Math.abs(zoom-oldZoom)+Math.abs(panX-oldX)+Math.abs(panY-oldY)>0.0001){
  panChanged++;
  requestMapFrame();
 }else panAtBoundary++;
}
function captureDrag(e){
 try{if(!vp.hasPointerCapture?.(e.pointerId))vp.setPointerCapture?.(e.pointerId)}catch(_){}
}
// Native touch streams are more reliable than pointer capture in iOS Home Screen apps.
// They are processed separately; synthetic/desktop PointerEvents remain a fallback.
function nativePoint(t){
 return {id:t.identifier,...pointerToMap(t),clientX:t.clientX,clientY:t.clientY};
}
function nativeTouchStart(e){
 nativeTouchSeen=true;
 pointers.clear();
 if(!nativeTouches.size){refreshMapMetrics();nativeDrag=false;}
 const incoming=Array.from(e.touches||[]).map(nativePoint);
 if(!nativeTouches.size)gestureStarts++;
 if(incoming.length>1)nativeDrag=true;
 const prior=nativeTouches;
 nativeTouches=new Map(incoming.map(t=>{
  const old=prior.get(t.id);
  return [t.id,{...t,startX:old?.startX??t.x,startY:old?.startY??t.y}];
 }));
}
function nativeTouchMove(e){
 if(!nativeTouchSeen||!nativeTouches.size)return;
 if(e.cancelable)e.preventDefault();
 const incoming=Array.from(e.touches||[]).map(nativePoint);
 if(!incoming.length)return;
 nativeTouchHandled++;
 if(incoming.length===1){
  const at=incoming[0],old=nativeTouches.get(at.id);
  if(!old)return;
  if(!nativeDrag&&Math.hypot(at.x-old.startX,at.y-old.startY)>3)nativeDrag=true;
  if(nativeDrag)moveCamera(at.x-old.x,at.y-old.y);
 }else{
  const first=incoming[0],second=incoming[1];
  const oldA=nativeTouches.get(first.id),oldB=nativeTouches.get(second.id);
  if(oldA&&oldB){
   nativeDrag=true;
   const before=Math.hypot(oldA.x-oldB.x,oldA.y-oldB.y);
   const after=Math.hypot(first.x-second.x,first.y-second.y);
   pinchCamera(
    {x:(oldA.x+oldB.x)/2,y:(oldA.y+oldB.y)/2},
    {x:(first.x+second.x)/2,y:(first.y+second.y)/2},
    before,after
   );
  }
 }
 nativeTouches=new Map(incoming.map(t=>{
  const old=nativeTouches.get(t.id);
  return [t.id,{...t,startX:old?.startX??t.x,startY:old?.startY??t.y}];
 }));
}
function nativeTouchEnd(e){
 if(!nativeTouchSeen)return;
 const previousDrag=nativeDrag;
 const remaining=Array.from(e.touches||[]).map(nativePoint);
 nativeTouches=new Map(remaining.map(t=>[t.id,{...t,startX:t.x,startY:t.y}]));
 if(!remaining.length){
  if(previousDrag){
   const t=Array.from(e.changedTouches||[])[0];
   lastDrag=Date.now();
   if(t)lastDragPoint={x:t.clientX,y:t.clientY};
  }
  nativeDrag=false;
  if(mapRaf)flushMapFrame();
 }
}
vp.addEventListener("touchstart",nativeTouchStart,{passive:true});
vp.addEventListener("touchmove",nativeTouchMove,{passive:false});
vp.addEventListener("touchend",nativeTouchEnd,{passive:true});
vp.addEventListener("touchcancel",nativeTouchEnd,{passive:true});
vp.addEventListener("gesturestart",e=>{if(e.cancelable)e.preventDefault();},{passive:false});
// Desktop/mouse and PointerEvent-only devices retain direct dragging and pinching.
vp.addEventListener("pointerdown",e=>{
 if(nativeTouchSeen&&e.pointerType==="touch")return;
 if(!pointers.size)refreshMapMetrics();
 const at=pointerToMap(e);
 pointers.set(e.pointerId,{x:at.x,y:at.y,startX:at.x,startY:at.y});
 if(pointers.size>=2){dragged=true;captureDrag(e);}
 else{dragged=false;gestureStarts++;}
});
vp.addEventListener("pointermove",e=>{
 if(nativeTouchSeen&&e.pointerType==="touch")return;
 if(!pointers.has(e.pointerId))return;
 gestureEvents++;pointerHandled++;
 const prev=pointers.get(e.pointerId),at=pointerToMap(e);
 if(pointers.size===1){
  if(!dragged&&Math.hypot(at.x-prev.startX,at.y-prev.startY)>3){dragged=true;captureDrag(e);}
  if(dragged)moveCamera(at.x-prev.x,at.y-prev.y);
 }else{
  const other=[...pointers].find(([id])=>id!==e.pointerId)?.[1];
  if(other){
   dragged=true;captureDrag(e);
   pinchCamera(
    {x:(prev.x+other.x)/2,y:(prev.y+other.y)/2},
    {x:(at.x+other.x)/2,y:(at.y+other.y)/2},
    Math.hypot(prev.x-other.x,prev.y-other.y),
    Math.hypot(at.x-other.x,at.y-other.y)
   );
  }
 }
 pointers.set(e.pointerId,{...prev,x:at.x,y:at.y});
});
function finishMapGesture(e){
 if(nativeTouchSeen&&e.pointerType==="touch")return;
 if(!pointers.has(e.pointerId))return;
 if(e.type==="lostpointercapture")pointerCaptureLost++;
 if(dragged){lastDrag=Date.now();lastDragPoint={x:e.clientX,y:e.clientY};}
 pointers.delete(e.pointerId);
 if(!pointers.size){dragged=false;if(mapRaf)flushMapFrame();}
}
vp.addEventListener("pointerup",finishMapGesture);
vp.addEventListener("pointercancel",finishMapGesture);
vp.addEventListener("lostpointercapture",finishMapGesture);
vp.addEventListener("wheel",e=>{
 e.preventDefault();
 setZoom(zoom*(e.deltaY<0?1.15:1/1.15),pointerToMap(e));
},{passive:false});
window.addEventListener("resize",()=>{refreshMapMetrics();clampMap();requestMapFrame();});
$("#modal").addEventListener("click",e=>{if(e.target===$("#modal"))$("#modal").close();});
// Read-only diagnostic view; excludes player names, saved match progress and all private data.
window.TZ_MAP_TELEMETRY=(light=false)=>({
 zoom:Number(zoom.toFixed(3)),panX:Number(panX.toFixed(1)),panY:Number(panY.toFixed(1)),
 cameraFrames,overlayRefreshes,gestureEvents,nativeTouchHandled,pointerHandled,panChanged,panAtBoundary,gestureStarts,pointerCaptureLost,
 markers:light?undefined:document.querySelectorAll("#mapPins [data-world-x]").length,
 labels:light?undefined:document.querySelectorAll("#mapLabels [data-world-x]").length,
 expanded:light?undefined:document.getElementById("interactiveMap").classList.contains("map-expanded")
});
function network(){const b=$("#networkStatus");b.textContent=navigator.onLine?"CACHE PENDING":"OFFLINE MODE";b.classList.toggle("warn",!navigator.onLine);}
window.addEventListener("online",network);window.addEventListener("offline",network);network();
if("serviceWorker" in navigator&&location.protocol==="https:"){navigator.serviceWorker.register("./sw.js").then(()=>navigator.serviceWorker.ready).then(()=>{$("#networkStatus").textContent=navigator.onLine?"OFFLINE READY":"OFFLINE MODE";}).catch(()=>{$("#networkStatus").textContent="ONLINE ONLY";$("#networkStatus").classList.add("warn")});}else if(location.protocol!=="https:"){$("#networkStatus").textContent="HTTPS REQUIRED";}
renderNav();renderMap();renderZones();renderQuest();renderAtlas();renderCraftPanel();renderCrew();
})();