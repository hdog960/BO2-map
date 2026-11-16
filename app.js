/* TranZit Field Atlas — offline, no accounts, no game-state access. */
(function(){
"use strict";
const D=window.TZ_DATA;if(!D){document.body.textContent="TranZit atlas data failed to load.";return;}
const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
const KEY="tranzit-atlas-save-v1";
const defaults={view:"map",side:"maxis",done:{},parts:{},found:{},crew:["Player 1","Player 2","Player 3","Player 4"],assign:{},mapFilters:[],mapMode:"route",atlasFilter:"all",zone:"depot",floor:0,selected:null};
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
const markPrice=v=>v?'<span class="meta">'+esc(v)+(v==="Turbine"||v==="Grenade"||v==="Power or Turbine"||v==="Remote Turbine"?"":" pts")+"</span>":"";
function category(type){return D.types[type]||D.types.secret}
function modal(title,body){$("#modalTitle").textContent=title;$("#modalBody").innerHTML=body;const d=$("#modal");if(!d.open)d.showModal();}
function renderNav(){
 $$(".bottom-nav button").forEach(b=>{
  const active=b.dataset.view===state.view;
  b.classList.toggle("selected",active);
  if(active)b.setAttribute("aria-current","page");else b.removeAttribute?.("aria-current");
 });
 $$(".view").forEach(v=>v.classList.toggle("active",v.id==="view-"+state.view));
}
function go(view){state.view=view;save();renderNav();if(view==="map")renderMap();if(view==="zones")renderZones();if(view==="quest")renderQuest();if(view==="atlas")renderAtlas();if(view==="crew")renderCrew();window.scrollTo({top:0,behavior:"auto"});}
function selectZone(id){state.zone=id;state.floor=0;save();go("zones");}
function showItem(id){
 const item=D.items.find(x=>x.id===id);if(!item)return;
 const z=zone(item.zone);
 modal(item.name,'<div class="kicker">'+esc(category(item.type).name)+' · '+esc(z.name)+'</div><p>'+esc(item.detail||"Check the area described below.")+'</p><div class="info"><b>Where:</b> '+esc(item.room||z.description||z.name)+(item.price?"<br><b>Price / requirement:</b> "+esc(item.price):"")+'</div><div class="actions"><button type="button" class="button" data-find-on-map="'+esc(item.id)+'">⌖ Show on map</button><button type="button" class="button ghost" data-toggle-item="'+esc(item.id)+'">'+(state.found[id]?"✓ Tracked":"Mark found / opened")+'</button></div><p class="footer-note">Map icons locate the site or relevant room area; variable spawn locations are listed in the item notes.</p>');
}
/* Interactive atlas. Pins are anchored to known sites, not invented exact in-room coordinates. */
const svgNS="http://www.w3.org/2000/svg";
const MAP_SYMBOLS={perk:"P",weapon:"W",part:"+",bench:"⚒",paid:"$",turbine:"T",special:"!",box:"?",secret:"★",goal:"⚡"};
const MAP_LABELS={perk:"Perks",weapon:"Wall guns",part:"Parts",bench:"Workbenches",paid:"Paid doors",turbine:"Turbine doors",special:"Special access",box:"Mystery Box",secret:"Secrets",goal:"Easter egg"};
const MAP_PRIORITY={perk:0,goal:1,box:2,bench:3,turbine:4,paid:5,special:6,weapon:7,part:8,secret:9};
const MAP_SLOTS={
 depot:[[509,283],[629,287],[626,358],[505,358],[583,256],[676,314],[556,390]],
 diner:[[446,104],[539,103],[587,83],[439,46],[571,45],[488,117],[623,116]],
 farm:[[215,89],[217,128],[110,148],[205,162],[240,48],[78,83],[114,46]],
 town:[[291,162],[418,161],[409,257],[298,266],[351,284],[276,230],[432,219]],
 power:[[129,399],[166,435],[134,489],[37,486],[53,375],[182,478]],
 pylon:[[211,274],[278,238],[177,172],[283,196]],
 nacht:[[53,259],[89,260],[31,159]],
 tunnel:[[604,160],[671,198],[637,114]],
 cabin:[[281,322],[267,355],[216,365]],
 bridge:[[484,255],[541,248]]
};
// Start zoomed enough to actually explore the map with a finger; Reset still fits all.
let zoom=1.7,panX=-252,panY=-203,pointers=new Map(),dragged=false,lastDrag=0,lastDragPoint=null;
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
function drawMapKey(){
 const counts={};for(const type of Object.keys(MAP_SYMBOLS))counts[type]=D.items.filter(i=>i.type===type).length;
 const types=[["all","ALL","All",D.items.length],...Object.keys(MAP_SYMBOLS).map(type=>[type,MAP_SYMBOLS[type],MAP_LABELS[type],counts[type]])];
 $("#mapLegend").innerHTML=types.map(([kind,symbol,title,count])=>{
  const color=kind==="all"?"#ecd09a":category(kind).color,active=state.mapKind===kind;
  return '<button type="button" class="legend-button '+(active?"active":"")+'" data-map-key="'+kind+'" aria-pressed="'+active+'"><span class="legend-symbol" style="background:'+color+'">'+esc(symbol)+'</span><span class="legend-label">'+esc(title)+'</span><span class="legend-count">'+count+'</span></button>';
 }).join("");
}
function mapItemsFor(zoneId){
 const candidates=D.items.filter(item=>item.zone===zoneId&&item.type!=="stop"&&(state.mapKind==="all"||state.mapKind===item.type));
 candidates.sort((a,b)=>(MAP_PRIORITY[a.type]??10)-(MAP_PRIORITY[b.type]??10));
 const dense=zoom>1.6, mid=zoom>1.24;
 const limit=state.mapKind==="all"?(dense?8:mid?4:2):(dense?12:6);
 const selected=state.selected&&D.items.find(i=>i.id===state.selected);
 const picked=candidates.slice(0,limit);
 // Search results can always be highlighted directly on the map even when omitted from the overview.
 if(selected&&selected.zone===zoneId&&!picked.some(i=>i.id===selected.id)&&(state.mapKind==="all"||state.mapKind===selected.type)){
  if(picked.length===limit)picked.pop();picked.push(selected);
 }
 return {pins:picked,hidden:Math.max(0,candidates.length-picked.length),total:candidates.length};
}
function markerSpot(z,index){
 const slots=MAP_SLOTS[z.id]||[];
 if(index<slots.length)return slots[index];
 const extra=index-slots.length;
 const angle=extra*2.399963+0.5,r=55+Math.floor(extra/9)*19;
 return [Math.max(22,Math.min(699,z.x+Math.cos(angle)*r)),Math.max(26,Math.min(552,z.y+Math.sin(angle)*r))];
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
  const title=svgEl("title",{},z.name+" — tap to inspect all items");
  site.append(main,number,title);pins.appendChild(site);
  const data=mapItemsFor(z.id);
  data.pins.forEach((item,index)=>{
   const [x,y]=markerSpot(z,index),type=item.type,code=MAP_SYMBOLS[type];
   const group=pinGroup(x,y,{"data-item":item.id,"class":"pin atlas-pin item-pin","aria-label":item.name+" at "+z.name});
   const radius=14;
   group.append(svgEl("rect",{x:-radius,y:-radius,width:radius*2,height:radius*2,rx:7,fill:category(type).color,stroke:state.selected===item.id?"#fff":"#10202a","stroke-width":state.selected===item.id?3:1.8}));
   group.append(svgEl("text",{x:0,y:4.6,fill:"#0e2327","font-size":"14","font-weight":"900","text-anchor":"middle"},code));
   if(zoom>1.24||state.mapKind!=="all"){
    const short=item.name.length>17?item.name.slice(0,15)+"…":item.name;
    const right=x>525?false:true,anchor=right?"start":"end",lx=right?19:-19;
    const label=svgEl("text",{x:lx,y:3.5,"class":"item-map-label","text-anchor":anchor},short);
    group.append(label);
   }
   group.append(svgEl("title",{},item.name+" — "+item.room+" — Tap for details"));
   pins.appendChild(group);
  });
  if(data.hidden>0){
   const [x,y]=markerSpot(z,data.pins.length),g=pinGroup(x,y,{"data-map-more":z.id,"aria-label":data.hidden+" more map items near "+z.name});
   g.append(svgEl("rect",{x:-19,y:-12,width:38,height:24,rx:9,fill:"#172c36",stroke:"#f0c582","stroke-width":2}));
   g.append(svgEl("text",{x:0,y:4,"font-size":11,"font-weight":"850","text-anchor":"middle",fill:"#f6d69b"},"+"+data.hidden));
   g.append(svgEl("title",{},data.hidden+" more entries at "+z.name+" — tap to list all"));
   pins.appendChild(g);
  }
 });
 positionMapOverlays();lastMarkerBand=mapMarkerBand();
}
function renderMap(){
 drawMapKey();renderMapLabels();renderMapMarkers();applyTransform();
 if(state.selected)context(state.selected);else closeMapContext();
}
function closeMapContext(){
 const pop=$("#mapContext");pop.hidden=true;pop.innerHTML="";state.selected=null;save();
}
function mapCard(body,eyebrow,title){
 const pop=$("#mapContext");pop.hidden=false;
 pop.innerHTML='<div class="map-card-top"><span>'+esc(eyebrow)+'</span><button type="button" id="closeMapContext" aria-label="Close map information">✕</button></div><h3>'+esc(title)+'</h3>'+body;
}
function context(key){
 if(key.startsWith("zone:")){
  const z=zone(key.slice(5));if(!z)return;
  state.selected=key;
  const arr=D.items.filter(i=>i.zone===z.id&&i.type!=="stop");
  const notable=arr.slice().sort((a,b)=>(MAP_PRIORITY[a.type]??10)-(MAP_PRIORITY[b.type]??10)).slice(0,6);
  mapCard('<p>'+esc(z.description)+'</p><div class="map-card-items">'+notable.map(i=>'<button type="button" data-map-item="'+esc(i.id)+'"><span class="inline-pin" style="background:'+category(i.type).color+'">'+esc(MAP_SYMBOLS[i.type])+'</span>'+esc(i.name)+'</button>').join("")+'</div><div class="map-card-actions"><button type="button" class="button" data-map-more="'+z.id+'">All '+arr.length+' items here</button><button type="button" class="button ghost" data-open-zone="'+z.id+'">Room guide</button></div>',
   z.stop?"BUS STOP "+z.stop:"LANDMARK",z.name);
 }else if(key.startsWith("more:")||key.startsWith("group:")){
  const ref=key.slice(key.indexOf(":")+1),parts=ref.split("|"),z=zone(parts[0]);if(!z)return;
  const type=parts[1],arr=D.items.filter(i=>i.zone===z.id&&i.type!=="stop"&&(!type||i.type===type));
  state.selected=key;
  mapCard('<p>'+esc(z.name)+' — tap any entry for its price, location, requirements and notes.</p><div class="map-card-list">'+arr.map(i=>'<button type="button" data-map-item="'+esc(i.id)+'"><span class="inline-pin" style="background:'+category(i.type).color+'">'+esc(MAP_SYMBOLS[i.type])+'</span><span><strong>'+esc(i.name)+'</strong><small>'+esc(i.room)+'</small></span><span class="map-list-arrow">›</span></button>').join("")+'</div><div class="map-card-actions"><button type="button" class="button ghost" data-open-zone="'+z.id+'">Room guide</button></div>',
   "LOCATION INDEX",z.name+" · "+arr.length+" entries");
 }else{
  const item=D.items.find(i=>i.id===key);if(!item)return;
  state.selected=key;
  mapCard('<p><strong>Where:</strong> '+esc(item.room||zone(item.zone).description)+'</p>'+(item.price?'<div class="map-price">'+esc(item.price)+(isNaN(Number(item.price))?"":" points")+'</div>':"")+'<p>'+esc(item.detail||"See the location notes.")+'</p><div class="map-card-actions"><button type="button" class="button" data-toggle-item="'+esc(item.id)+'">'+(state.found[item.id]?"✓ Tracked":"Mark found / opened")+'</button><button type="button" class="button ghost" data-map-more="'+item.zone+'">More at '+esc(zone(item.zone).name)+'</button></div>',
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
 const k=Math.max(0.15,Math.min(width/MAP_W,height/MAP_H));
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
function mapMarkerBand(){return zoom>1.6?2:zoom>1.24?1:0;}
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
 // Allow a small drag at full overview scale. At higher zoom, bound the camera to
 // all four edges of the world so the full geography remains reachable.
 const slack=zoom<=1.001?110:0;
 panX=Math.max(MAP_W*(1-zoom)-slack,Math.min(slack,panX));
 panY=Math.max(MAP_H*(1-zoom)-slack,Math.min(slack,panY));
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
function renderQuest(){
 $$("[data-side]").forEach(b=>{const active=b.dataset.side===state.side;b.classList.toggle("on",active);b.setAttribute("aria-pressed",String(active));});
 const steps=D.quests[state.side],completed=steps.filter((_,i)=>state.done[state.side+":"+i]).length;
 const next=steps.findIndex((_,i)=>!state.done[state.side+":"+i]);
 let html='<details class="quest-prep"><summary>Before you start · Original difficulty required</summary><p>Choose Original, not Easy. Coordinate the four players and previous Easter egg completion state. The Richtofen route requires the Samuel player to hear the voice lines. All checkmarks are manual; nothing here can detect your live BO2 match.</p></details>';
 html+='<div class="stats quest-stats"><div class="stat"><strong>'+completed+'/'+steps.length+'</strong><span>STEPS DONE</span></div><div class="stat"><strong>'+Math.round(completed/steps.length*100)+'%</strong><span>PROGRESS</span></div><div class="stat"><strong>4</strong><span>PLAYERS</span></div></div>';
 html+='<div class="progress-track" aria-label="'+completed+' of '+steps.length+' objectives completed"><div class="progress-bar" style="width:'+(completed/steps.length*100)+'%"></div></div>';
 if(next>=0){
  const step=steps[next];
  html+='<div class="next"><div class="num">YOUR NEXT OBJECTIVE · STEP '+(next+1)+'</div><h3>'+esc(step.title)+'</h3><p>'+esc(step.note)+'</p><div class="actions"><button type="button" class="button" data-quest-zone="'+step.zone+'">⌖ '+esc(zone(step.zone).name)+'</button><button type="button" class="button ghost" data-quest-done="'+next+'">✓ Mark done</button></div></div>';
 }else html+='<div class="next"><div class="num">ALL CHECKLIST STEPS COMPLETE</div><h3>Confirm it in-game</h3><p>Listen for the matching character dialogue and confirm the in-game completion. These checkmarks are your own record.</p></div>';
 html+='<div class="site-diagram-heading"><strong>All steps</strong><span>Tap to expand instructions</span></div>';
 steps.forEach((step,i)=>{
  const key=state.side+":"+i,done=!!state.done[key],assigned=state.assign[key]||"";
  const who=assigned!==""?state.crew[Number(assigned)]:"";
  html+='<section class="step '+(done?"done":"")+'"><div class="step-top"><button class="tick '+(done?"checked":"")+'" type="button" data-quest-done="'+i+'" aria-label="'+(done?"Mark incomplete: ":"Mark complete: ")+esc(step.title)+'" aria-pressed="'+done+'">'+(done?"✓":i+1)+'</button><div><strong>'+esc(step.title)+'</strong><div class="step-count">'+esc(zone(step.zone).name)+(who?" · Assigned: "+esc(who):"")+(done?" · Done":"")+'</div></div></div>';
  html+='<details class="step-reveal" '+(i===next?"open":"")+'><summary>Instructions & player</summary><p>'+esc(step.note)+'</p><div class="step-extra"><div class="flex between"><span class="pill">'+esc(zone(step.zone).name)+'</span><button type="button" class="button ghost" data-quest-zone="'+step.zone+'">Show location</button></div><label class="small muted">Assign to player<br><select class="assign" data-assignment="'+i+'"><option value="">Unassigned</option>'+state.crew.map((name,j)=>'<option value="'+j+'" '+(assigned===String(j)?"selected":"")+'>'+esc(name)+'</option>').join("")+'</select></label></div></details></section>';
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
  const t=category(i.type);
  return '<button type="button" class="atlas-item" data-show-item="'+esc(i.id)+'" aria-label="'+esc(i.name)+' in '+esc(zone(i.zone).name)+'"><span class="symbol" style="background:'+t.color+'">'+esc(t.short)+'</span><span><strong>'+esc(i.name)+'</strong><small>'+esc(zone(i.zone).name)+' · '+esc(i.room)+'</small></span><span class="arr">'+(state.found[i.id]?"✓":"›")+'</span></button>';
 }).join("")||'<div class="empty"><strong>No matching locations</strong><p>Try another name, perk, door, or location; or clear your search.</p><button type="button" class="button ghost" data-quick-find="">Clear search</button></div>';
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
  html+='<details class="build-card" data-build="'+b.id+'" '+(isOpen?"open":"")+'><summary><span><strong>'+esc(b.name)+'</strong><small>'+esc(zone(b.zone).name)+' · '+esc(b.location)+'</small></span><span class="pill">'+complete+'/'+b.parts.length+'</span></summary><div class="build-content">'+
   b.parts.map((part,i)=>'<div class="row-item"><div class="left"><strong>'+esc(part[0])+'</strong><small>'+esc(part[1])+'</small></div><button class="tick '+(state.parts[b.id+":"+i]?"checked":"")+'" type="button" data-part="'+b.id+":"+i+'" aria-label="'+(state.parts[b.id+":"+i]?"Uncheck ":"Mark found ")+esc(part[0])+'" aria-pressed="'+!!state.parts[b.id+":"+i]+'">'+(state.parts[b.id+":"+i]?"✓":"○")+'</button></div>').join("")+
   '<div class="actions"><button class="button ghost" data-open-zone="'+b.zone+'">Show bench location</button></div></div></details>';
 });
 html+='<div class="card"><h3>New match?</h3><p>Reset checked objectives, parts, and item markers without removing your player names.</p><button class="button danger" id="resetSession" type="button">Reset this match</button></div>';
 html+='<details class="build-card reference-details"><summary><span><strong>Sources & accuracy notes</strong><small>Community guides and reference map</small></span></summary><div class="build-content"><p>World positions are reference-aligned; interiors and part markers remain schematic where not verified.</p>'+D.references.map(r=>'<div class="row-item"><a class="source-link" href="'+esc(r.url)+'" target="_blank" rel="noopener noreferrer">'+esc(r.name)+'</a></div>').join("")+'<p class="footer-note">Unofficial fan utility. No paid backend or live BO2 tracking. Offline caching requires one successful online load.</p></div></details>';
 panel.innerHTML=html;
 panel.dataset.ready="1";
}
function help(){
 modal("TranZit interactive map",'<div class="stack"><p><b>Map:</b> All major locations and important item icons appear directly on the geography. Tap a numbered stop, perk, weapon, part, bench or door marker to open its details. A <b>+number</b> marker lists the other items at that location.</p><p><b>Map key:</b> Each symbol has a color and meaning. Tap a category in the key to show more icons of that type, or <b>All</b> to restore the overview. Pinch to zoom, drag to pan, or expand the map.</p><p><b>Easter Egg:</b> The separate <b>EASTER EGG</b> tab contains the Maxis and Richtofen steps, progress checks and four-player assignments. A Locate button brings you back to the correct map site.</p><p><b>Sites, Find and Crew:</b> Room notes, searchable listings, buildable part checklists and names remain available without cluttering the main map.</p><p><b>Offline:</b> Safari Share → Add to Home Screen. Launch once online, then test airplane mode. Information is saved only on your phone, not synced with the game.</p><p><b>Accuracy:</b> Roads and buildings follow the supplied reference map; icons are site-level guides, not measured in-game pickup coordinates. Alternate spawns are listed in details.</p></div>');
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
if(b.dataset.mapKey){state.mapKind=b.dataset.mapKey;state.selected=null;save();renderMap();return;}
if(b.dataset.mapMore){if(!isAccidentalMapClick(e))context("more:"+b.dataset.mapMore);return;}
if(b.dataset.mapItem){context(b.dataset.mapItem);return;}
if(b.dataset.mapMode){state.mapMode=b.dataset.mapMode;state.mapFilters=MAP_MODES[state.mapMode].slice();save();renderMap();return;}
if(b.dataset.filter){const id=b.dataset.filter;state.mapFilters=state.mapFilters.includes(id)?state.mapFilters.filter(x=>x!==id):state.mapFilters.concat(id);state.mapMode="custom";save();renderMap();return;}
if(b.dataset.atlasFilter){state.atlasFilter=b.dataset.atlasFilter;save();renderAtlas();return;}
if(b.dataset.quickFind!==undefined){state.atlasFilter="all";$("#atlasSearch").value=b.dataset.quickFind;save();renderAtlas();$("#atlasSearch").focus?.();return;}
if(b.dataset.zoneTab){state.zone=b.dataset.zoneTab;state.floor=0;save();renderZones();return;}
if(b.dataset.floor){state.floor=Number(b.dataset.floor);save();renderZones();return;}
if(b.dataset.showItem){showItem(b.dataset.showItem);return;}
if(b.dataset.findOnMap){const item=D.items.find(i=>i.id===b.dataset.findOnMap);if(item){$("#modal").close();state.mapKind=item.type;state.selected=item.id;go("map");}return;}
if(b.dataset.toggleItem){state.found[b.dataset.toggleItem]=!state.found[b.dataset.toggleItem];save();if($("#modal").open)$("#modal").close();renderMap();renderZones();renderAtlas();return;}
if(b.dataset.openZone){if($("#modal").open)$("#modal").close();selectZone(b.dataset.openZone);return;}
if(b.dataset.searchZone){state.atlasFilter="all";$("#atlasSearch").value=zone(b.dataset.searchZone).name;go("atlas");return;}
if(b.dataset.side){state.side=b.dataset.side;save();renderQuest();return;}
if(b.dataset.questDone!==undefined){const k=state.side+":"+b.dataset.questDone;state.done[k]=!state.done[k];save();renderQuest();return;}
if(b.dataset.questZone){state.mapKind="all";state.selected="zone:"+b.dataset.questZone;go("map");return;}
if(b.dataset.part){state.parts[b.dataset.part]=!state.parts[b.dataset.part];save();renderCrew();return;}
if(b.dataset.room){const label=$("#roomNotice");if(label)label.textContent=b.dataset.room+" · This conceptual room is not an exact floor plan.";return;}
if(b.dataset.group){if(!isAccidentalMapClick(e))context("group:"+b.dataset.group);return;}
if(b.dataset.item){if(!isAccidentalMapClick(e))context(b.dataset.item);return;}
if(b.dataset.zone){if(!isAccidentalMapClick(e))context("zone:"+b.dataset.zone);return;}
if(b.id==="resetSession"){modal("Reset this match?",'<p>This will clear quest checks, collected parts, marked doors/items and assignments on this phone. Your player names will remain.</p><div class="actions"><button class="button danger" id="confirmReset">Yes, reset progress</button><button class="button ghost" id="cancelReset">Cancel</button></div>');return;}
if(b.id==="confirmReset"){state.done={};state.parts={};state.found={};state.assign={};state.selected=null;save();$("#modal").close();renderCrew();return;}
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
document.addEventListener("change",e=>{if(e.target.dataset.assignment!==undefined){state.assign[state.side+":"+e.target.dataset.assignment]=e.target.value;save();}
if(e.target.id==="zoneSelect"){state.zone=e.target.value;state.floor=0;save();renderZones();}});
document.addEventListener("input",e=>{if(e.target.id==="atlasSearch")renderAtlas();if(e.target.dataset.crew!==undefined){state.crew[Number(e.target.dataset.crew)]=e.target.value||"Player "+(Number(e.target.dataset.crew)+1);save();}});
$("#worldMap").addEventListener("keydown",e=>{if((e.key==="Enter"||e.key===" ")&&e.target.matches("[data-zone],[data-item],[data-group],[data-map-more]")){e.preventDefault();e.target.dispatchEvent(new MouseEvent("click",{bubbles:true}));}});
const vp=$("#mapViewport");
function captureDrag(e){
 try{if(!vp.hasPointerCapture?.(e.pointerId))vp.setPointerCapture?.(e.pointerId)}catch(_){}
}
vp.addEventListener("pointerdown",e=>{
 if(!pointers.size)refreshMapMetrics();
 const at=pointerToMap(e);
 pointers.set(e.pointerId,{x:at.x,y:at.y,startX:at.x,startY:at.y});
 if(pointers.size>=2){dragged=true;captureDrag(e);}
 else dragged=false;
});
vp.addEventListener("pointermove",e=>{
 if(!pointers.has(e.pointerId))return;
 gestureEvents++;
 const prev=pointers.get(e.pointerId),at=pointerToMap(e);
 if(pointers.size===1){
  if(!dragged&&Math.hypot(at.x-prev.startX,at.y-prev.startY)>6){dragged=true;captureDrag(e);}
  if(dragged){
   panX+=at.x-prev.x;panY+=at.y-prev.y;
   clampMap();requestMapFrame();
  }
 }else{
  const other=[...pointers].find(([id])=>id!==e.pointerId)?.[1];
  if(other){
   dragged=true;captureDrag(e);
   const previousSpan=Math.hypot(prev.x-other.x,prev.y-other.y);
   const newSpan=Math.hypot(at.x-other.x,at.y-other.y);
   const oldMid={x:(prev.x+other.x)/2,y:(prev.y+other.y)/2};
   const nextMid={x:(at.x+other.x)/2,y:(at.y+other.y)/2};
   const oldZoom=zoom;
   const worldX=(oldMid.x-panX)/oldZoom,worldY=(oldMid.y-panY)/oldZoom;
   if(previousSpan>1)zoom=Math.min(4,Math.max(1,oldZoom*newSpan/previousSpan));
   panX=nextMid.x-worldX*zoom;
   panY=nextMid.y-worldY*zoom;
   clampMap();
   requestMapFrame();
  }
 }
 pointers.set(e.pointerId,{...prev,x:at.x,y:at.y});
});
function finishMapGesture(e){
 if(!pointers.has(e.pointerId))return;
 if(dragged){lastDrag=Date.now();lastDragPoint={x:e.clientX,y:e.clientY};}
 pointers.delete(e.pointerId);
 if(!pointers.size){dragged=false;flushMapFrame();}
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
 cameraFrames,overlayRefreshes,gestureEvents,
 markers:light?undefined:document.querySelectorAll("#mapPins [data-world-x]").length,
 labels:light?undefined:document.querySelectorAll("#mapLabels [data-world-x]").length,
 expanded:light?undefined:document.getElementById("interactiveMap").classList.contains("map-expanded")
});
function network(){const b=$("#networkStatus");b.textContent=navigator.onLine?"CACHE PENDING":"OFFLINE MODE";b.classList.toggle("warn",!navigator.onLine);}
window.addEventListener("online",network);window.addEventListener("offline",network);network();
if("serviceWorker" in navigator&&location.protocol==="https:"){navigator.serviceWorker.register("./sw.js").then(()=>navigator.serviceWorker.ready).then(()=>{$("#networkStatus").textContent=navigator.onLine?"OFFLINE READY":"OFFLINE MODE";}).catch(()=>{$("#networkStatus").textContent="ONLINE ONLY";$("#networkStatus").classList.add("warn")});}else if(location.protocol!=="https:"){$("#networkStatus").textContent="HTTPS REQUIRED";}
renderNav();renderMap();renderZones();renderQuest();renderAtlas();renderCrew();
})();