/* TranZit Field Atlas — offline, no accounts, no game-state access. */
(function(){
"use strict";
const D=window.TZ_DATA;if(!D){document.body.textContent="TranZit atlas data failed to load.";return;}
const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
const KEY="tranzit-atlas-save-v1";
const defaults={view:"map",side:"maxis",done:{},parts:{},found:{},crew:["Player 1","Player 2","Player 3","Player 4"],assign:{},mapFilters:["stop","perk","bench","goal"],atlasFilter:"all",zone:"depot",floor:0,selected:null};
let state;
try{state=Object.assign({},defaults,JSON.parse(localStorage.getItem(KEY)||"{}"));}catch(e){state=Object.assign({},defaults);}
if(!Array.isArray(state.mapFilters))state.mapFilters=defaults.mapFilters.slice();
if(!Array.isArray(state.crew)||state.crew.length!==4)state.crew=defaults.crew.slice();
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){console.warn("Progress storage unavailable",e)}};
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const zone=id=>D.zones.find(x=>x.id===id);
const markPrice=v=>v?'<span class="meta">'+esc(v)+(v==="Turbine"||v==="Grenade"||v==="Power or Turbine"||v==="Remote Turbine"?"":" pts")+"</span>":"";
function category(type){return D.types[type]||D.types.secret}
function modal(title,body){$("#modalTitle").textContent=title;$("#modalBody").innerHTML=body;const d=$("#modal");if(!d.open)d.showModal();}
function renderNav(){ $$(".bottom-nav button").forEach(b=>b.classList.toggle("selected",b.dataset.view===state.view));$$(".view").forEach(v=>v.classList.toggle("active",v.id==="view-"+state.view));}
function go(view){state.view=view;save();renderNav();if(view==="map")renderMap();if(view==="zones")renderZones();if(view==="quest")renderQuest();if(view==="atlas")renderAtlas();if(view==="crew")renderCrew();window.scrollTo({top:0,behavior:"instant"});}
function selectZone(id){state.zone=id;state.floor=0;save();go("zones");}
function showItem(id){const item=D.items.find(x=>x.id===id);if(!item)return;const z=zone(item.zone);modal(item.name,'<div class="kicker">'+esc(category(item.type).name)+" · "+esc(z.name)+'</div><p>'+esc(item.detail||"Reference point on the TranZit map.")+'</p><div class="info"><b>Where:</b> '+esc(item.room||z.description||z.name)+(item.price?"<br><b>Requirement / price:</b> "+esc(item.price):"")+'</div><div class="actions"><button class="button" data-open-zone="'+esc(item.zone)+'">Explore location</button><button class="button ghost" data-toggle-item="'+esc(item.id)+'">'+(state.found[id]?"✓ Marked found":"Mark found / opened")+'</button></div><p class="footer-note">Pins give an approximate area, not a measured coordinate. Part spawns can vary between matches.</p>');}
function drawFilters(){const box=$("#filterBar");box.innerHTML=Object.entries(D.types).map(([id,t])=>'<button class="chip '+(state.mapFilters.includes(id)?"on":"")+'" type="button" data-filter="'+id+'"><span class="dot" style="background:'+t.color+'"></span>'+esc(t.name)+'</button>').join("");}
const svgNS="http://www.w3.org/2000/svg";let zoom=1,panX=0,panY=0,pointers=new Map(),dragged=false,lastDrag=0;
function applyTransform(){const svg=$("#worldMap");svg.style.transform="translate("+panX+"px,"+panY+"px) scale("+zoom+")";}
function clampMap(){const vp=$("#mapViewport"),w=vp.clientWidth,h=vp.clientHeight;panX=Math.max(-w*(zoom-1)-w*.15,Math.min(w*.15,panX));panY=Math.max(-h*(zoom-1)-h*.15,Math.min(h*.15,panY));}
function setZoom(next){const old=zoom;zoom=Math.min(3.6,Math.max(1,next));const vp=$("#mapViewport"),x=vp.clientWidth/2,y=vp.clientHeight/2;panX=x-(x-panX)*zoom/old;panY=y-(y-panY)*zoom/old;clampMap();applyTransform();}
function resetMap(){zoom=1;panX=0;panY=0;applyTransform();}
function renderMap(){
drawFilters();
const labels=$("#routeLabels"),pins=$("#mapPins");labels.textContent="";pins.textContent="";
D.zones.forEach((z,i)=>{
let label=document.createElementNS(svgNS,"text");label.setAttribute("x",z.x);label.setAttribute("y",z.y+36);label.setAttribute("text-anchor","middle");label.setAttribute("class",z.stop?"map-label":"map-mini");label.textContent=z.short+(z.stop?" · "+z.stop:"");label.dataset.zone=z.id;label.style.cursor="pointer";labels.appendChild(label);
let group=document.createElementNS(svgNS,"g");group.setAttribute("class","pin");group.dataset.zone=z.id;group.setAttribute("role","button");group.setAttribute("tabindex","0");group.setAttribute("aria-label",z.name);
let c=document.createElementNS(svgNS,"circle");c.setAttribute("cx",z.x);c.setAttribute("cy",z.y);c.setAttribute("r",z.stop?"18":"12");c.setAttribute("fill",z.stop?"#e7b969":"#628c88");c.setAttribute("class","pin-core");
let t=document.createElementNS(svgNS,"text");t.setAttribute("x",z.x);t.setAttribute("y",z.y+5);t.setAttribute("font-size",z.stop?"14":"11");t.setAttribute("font-weight","900");t.setAttribute("text-anchor","middle");t.setAttribute("fill","#102023");t.textContent=z.stop?String(z.stop):"•";group.append(c,t);pins.appendChild(group);
});
const counts={};
D.items.filter(x=>x.type!=="stop"&&state.mapFilters.includes(x.type)).forEach(item=>{
const z=zone(item.zone);const n=counts[z.id]||0;counts[z.id]=n+1;
const angle=(n*137.507+24)*Math.PI/180;const radius=47+Math.floor(n/8)*31;const x=Math.max(20,Math.min(980,z.x+Math.cos(angle)*radius));const y=Math.max(34,Math.min(728,z.y+Math.sin(angle)*radius));
let group=document.createElementNS(svgNS,"g");group.classList.add("pin");group.dataset.item=item.id;group.setAttribute("role","button");group.setAttribute("tabindex","0");group.setAttribute("aria-label",item.name+" in "+z.name);
const a=document.createElementNS(svgNS,"circle");a.setAttribute("cx",x);a.setAttribute("cy",y);a.setAttribute("r","12");a.setAttribute("fill",state.found[item.id]?"#669789":category(item.type).color);a.setAttribute("class","pin-core");
const b=document.createElementNS(svgNS,"text");b.setAttribute("x",x);b.setAttribute("y",y+4);b.setAttribute("font-size","11");b.setAttribute("font-weight","900");b.setAttribute("text-anchor","middle");b.setAttribute("fill","#101b22");b.textContent=state.found[item.id]?"✓":category(item.type).short;
group.append(a,b);pins.appendChild(group);
});
if(state.selected)context(state.selected);else $("#mapContext").innerHTML='<div class="context-empty"><strong>Choose a marker</strong><span>Tap any stop, perk, part, or objective. Use filters to declutter the route.</span></div>';
}
function context(key){
if(key.startsWith("zone:")){const z=zone(key.slice(5));if(!z)return;state.selected=key;$("#mapContext").innerHTML='<div class="kicker">'+(z.stop?"BUS STOP "+z.stop:"OFF-ROUTE LANDMARK")+'</div><h3>'+esc(z.name)+'</h3><p>'+esc(z.description)+'</p><div class="actions"><button class="button" data-open-zone="'+z.id+'">Explore interiors</button><button class="button ghost" data-search-zone="'+z.id+'">All items here</button></div>';}
else{const i=D.items.find(x=>x.id===key);if(!i)return;state.selected=key;$("#mapContext").innerHTML='<div class="kicker">'+esc(category(i.type).name)+" · "+esc(zone(i.zone).name)+'</div><h3>'+esc(i.name)+'</h3><p>'+esc(i.room)+" — "+esc(i.detail)+'</p>'+markPrice(i.price)+'<div class="actions"><button class="button" data-show-item="'+i.id+'">Details</button><button class="button ghost" data-open-zone="'+i.zone+'">Explore location</button><button class="button ghost" data-toggle-item="'+i.id+'">'+(state.found[i.id]?"✓ Tracked":"Mark found")+'</button></div>';}
save();
}
function roomSvg(rooms){
return '<div class="zone-art"><svg viewBox="0 0 610 355" role="img" aria-label="Conceptual room-adjacency diagram"><g stroke="#9f9575" stroke-width="3" opacity=".6" stroke-dasharray="6 8"><path d="M10 336 H600"/></g>'+rooms.map((r,i)=>'<g data-room="'+esc(r.name)+'" style="cursor:pointer"><rect class="room-shape '+(i%2?"alt":"")+'" x="'+r.x+'" y="'+r.y+'" width="'+r.w+'" height="'+r.h+'" rx="5"/><text class="room-text" x="'+(r.x+r.w/2)+'" y="'+(r.y+r.h/2)+'">'+esc(r.name.length>24?r.name.slice(0,21)+"…":r.name)+'</text></g>').join("")+'</svg><div id="roomNotice" class="footer-note">Tap a room to highlight its name. Diagram is not a measured footprint or verified doorway layout.</div></div>';
}
function renderZones(){
$("#zoneTabs").innerHTML=D.zones.map(z=>'<button class="chip '+(state.zone===z.id?"on":"")+'" data-zone-tab="'+z.id+'">'+esc(z.name)+'</button>').join("");
const z=zone(state.zone)||D.zones[0];const plan=D.plans[z.id];const all=D.items.filter(i=>i.zone===z.id && i.type!=="stop");
let html='<div class="card"><div class="kicker">'+(z.stop?"BUS STOP "+z.stop:"OFF-ROUTE")+'</div><h3>'+esc(z.name)+'</h3><p>'+esc(z.description)+'</p></div>';
if(plan){const floor=plan.floors[Math.max(0,Math.min(state.floor,plan.floors.length-1))];html+='<div class="floor-toggle">'+plan.floors.map((f,i)=>'<button data-floor="'+i+'" class="'+(i===state.floor?"on":"")+'">'+esc(f.name)+'</button>').join("")+'</div>'+roomSvg(floor.rooms);}
else html+='<div class="info">Off-route site: item locations below are in-game area descriptions. No invented interior walls are shown.</div>';
for(const [type,t] of Object.entries(D.types)){const arr=all.filter(i=>i.type===type);if(!arr.length)continue;html+='<div class="location-group"><h3><span style="color:'+t.color+'">●</span> '+t.name+' · '+arr.length+'</h3>'+arr.map(i=>'<div class="row-item"><div class="left"><strong>'+esc(i.name)+'</strong><small>'+esc(i.room)+(i.price?" · "+esc(i.price):"")+'</small></div><button class="button ghost" data-show-item="'+i.id+'">Details</button></div>').join("")+'</div>';}
$("#zonePlan").innerHTML=html;
}
function renderQuest(){
$$("[data-side]").forEach(b=>b.classList.toggle("on",b.dataset.side===state.side));
const steps=D.quests[state.side],completed=steps.filter((_,i)=>state.done[state.side+":"+i]).length;const next=steps.findIndex((_,i)=>!state.done[state.side+":"+i]);
let html='<div class="warning"><b>Before you start:</b> Select Original difficulty (NOT Easy), confirm quest-side persistence from prior games, and coordinate which player is Samuel for Richtofen. Checkmarks are manual—this app cannot detect game events.</div><div class="stats"><div class="stat"><strong>'+completed+'/'+steps.length+'</strong><span>STEPS</span></div><div class="stat"><strong>4</strong><span>PLAYERS</span></div><div class="stat"><strong>'+D.builds.length+'</strong><span>BUILDABLES</span></div></div><div class="progress-track"><div class="progress-bar" style="width:'+(completed/steps.length*100)+'%"></div></div>';
if(next>=0){const s=steps[next];html+='<div class="next"><div class="num">WHAT DO WE DO NEXT? · STEP '+(next+1)+'</div><h3>'+esc(s.title)+'</h3><p>'+esc(s.note)+'</p><div class="actions"><button class="button" data-quest-zone="'+s.zone+'">Explore '+esc(zone(s.zone).name)+'</button><button class="button ghost" data-quest-done="'+next+'">✓ Mark step done</button></div></div>';}else html+='<div class="next"><h3>All steps checked</h3><p>Confirm the in-game audio cue and achievement. Completion here reflects your own checklist only.</p></div>';
steps.forEach((s,i)=>{const key=state.side+":"+i,who=state.assign[key]||"";html+='<div class="step '+(state.done[key]?"done":"")+'"><div class="step-top"><button class="tick '+(state.done[key]?"checked":"")+'" data-quest-done="'+i+'" aria-label="Mark '+esc(s.title)+' complete">'+(state.done[key]?"✓":i+1)+'</button><div><strong>'+esc(s.title)+'</strong><p>'+esc(s.note)+'</p></div></div><div class="step-extra"><div class="flex between"><span class="pill">'+esc(zone(s.zone).name)+'</span><button class="button ghost" data-quest-zone="'+s.zone+'">Locate</button></div><label class="small muted">Assigned player<br><select class="assign" data-assignment="'+i+'"><option value="">Unassigned</option>'+state.crew.map((name,j)=>'<option value="'+j+'" '+(who===String(j)?"selected":"")+'>'+esc(name)+'</option>').join("")+'</select></label></div></div>';});
$("#questPanel").innerHTML=html;
}
function renderAtlas(){
const active=state.atlasFilter;
$("#atlasFilters").innerHTML='<button class="chip '+(active==="all"?"on":"")+'" data-atlas-filter="all">All</button>'+Object.entries(D.types).map(([k,t])=>'<button class="chip '+(active===k?"on":"")+'" data-atlas-filter="'+k+'">'+esc(t.name)+'</button>').join("");
const term=$("#atlasSearch").value.trim().toLowerCase();const arr=D.items.filter(i=>(active==="all"||i.type===active)&&(!term||[i.name,i.room,i.detail,zone(i.zone).name,i.price,category(i.type).name].join(" ").toLowerCase().includes(term)));
$("#atlasItems").innerHTML=arr.map(i=>{const t=category(i.type);return '<button type="button" class="atlas-item" data-show-item="'+i.id+'"><span class="symbol" style="background:'+t.color+'">'+esc(t.short)+'</span><span><strong>'+esc(i.name)+'</strong><small>'+esc(zone(i.zone).name)+' · '+esc(i.room)+'</small></span><span class="arr">'+(state.found[i.id]?"✓":"›")+'</span></button>';}).join("")||'<div class="empty">Nothing matches this search. Try a different word or category.</div>';
}
function renderCrew(){
const done=Object.values(state.done).filter(Boolean).length,parts=Object.values(state.parts).filter(Boolean).length;
let html='<div class="crew-grid">'+state.crew.map((name,i)=>'<div class="crew-card"><label>OPERATOR 0'+(i+1)+'</label><input type="text" maxlength="24" autocomplete="off" data-crew="'+i+'" value="'+esc(name)+'" aria-label="Player '+(i+1)+' name"></div>').join("")+'</div><div class="info">Names and assignments are stored locally on this iPhone. Friends do not see updates automatically; there is no network sync or account.</div><div class="stats"><div class="stat"><strong>4</strong><span>OPERATORS</span></div><div class="stat"><strong>'+done+'</strong><span>QUEST CHECKS</span></div><div class="stat"><strong>'+parts+'</strong><span>PARTS FOUND</span></div></div><div class="section-head" style="margin-top:20px"><div><span class="eyebrow">MATCH INVENTORY</span><h2 style="font-size:23px">Buildable trackers</h2></div></div>';
D.builds.forEach(b=>{const complete=b.parts.filter((_,i)=>state.parts[b.id+":"+i]).length;html+='<div class="card"><div class="flex between"><strong>'+esc(b.name)+'</strong><span class="pill">'+complete+'/'+b.parts.length+'</span></div><p>Bench: '+esc(b.location)+' · '+esc(zone(b.zone).name)+'</p>'+b.parts.map((part,i)=>'<div class="row-item"><div class="left"><strong>'+esc(part[0])+'</strong><small>'+esc(part[1])+'</small></div><button class="tick '+(state.parts[b.id+":"+i]?"checked":"")+'" data-part="'+b.id+":"+i+'" aria-label="Track '+esc(part[0])+'">'+(state.parts[b.id+":"+i]?"✓":"○")+'</button></div>').join("")+'<div class="actions"><button class="button ghost" data-open-zone="'+b.zone+'">View area</button></div></div>';});
html+='<div class="card"><h3>Session controls</h3><p>Reset for a new match without deleting the app. This clears checked objectives, marked map items, tracked parts and assignments; it keeps player names.</p><button class="button danger" id="resetSession">Reset match progress</button></div><div class="card"><h3>References & accuracy</h3><p>We cross-referenced map locations, item lists, doors and the quest against community guides. Map art and floor diagrams are authored schematics; neither location pins nor room boundaries are precise game-file coordinates.</p>'+D.references.map(r=>'<div class="row-item"><a class="source-link" href="'+esc(r.url)+'" target="_blank" rel="noopener noreferrer">'+esc(r.name)+'</a></div>').join("")+'<p class="footer-note">Unofficial fan utility. Not affiliated with Activision or Treyarch. No third-party game art is included. Offline caching requires one successful load on HTTPS.</p></div>';
$("#crewPanel").innerHTML=html;
}
function help(){modal("Using the field atlas",'<div class="stack"><p><b>Map:</b> drag and pinch to zoom. Tap a named stop, or switch on marker categories, then tap an icon.</p><p><b>Interiors:</b> select a zone and a floor. Room diagrams are approximate navigation aids; item descriptions specify known in-game areas.</p><p><b>Quest:</b> choose Maxis or Richtofen; tick each step, assign your four players and tap "Locate".</p><p><b>Crew:</b> track each buildable part and player name. Progress saves on this phone only.</p><p><b>Install:</b> in Safari use Share → Add to Home Screen. Open once online to cache files for offline play. The app does not connect to your BO2 session.</p><p><b>Safety:</b> Pay attention to zombies, fog Denizens, and lava; the map does not represent real-time enemy positions.</p></div>');}
document.addEventListener("click",e=>{
const b=e.target.closest("button,[data-zone],[data-room],[data-item]");
if(!b)return;
if(b.dataset.view){go(b.dataset.view);return;}
if(b.dataset.filter){const id=b.dataset.filter;state.mapFilters=state.mapFilters.includes(id)?state.mapFilters.filter(x=>x!==id):state.mapFilters.concat(id);save();renderMap();return;}
if(b.dataset.atlasFilter){state.atlasFilter=b.dataset.atlasFilter;save();renderAtlas();return;}
if(b.dataset.zoneTab){state.zone=b.dataset.zoneTab;state.floor=0;save();renderZones();return;}
if(b.dataset.floor){state.floor=Number(b.dataset.floor);save();renderZones();return;}
if(b.dataset.showItem){showItem(b.dataset.showItem);return;}
if(b.dataset.toggleItem){state.found[b.dataset.toggleItem]=!state.found[b.dataset.toggleItem];save();if($("#modal").open)$("#modal").close();renderMap();renderZones();renderAtlas();return;}
if(b.dataset.openZone){if($("#modal").open)$("#modal").close();selectZone(b.dataset.openZone);return;}
if(b.dataset.searchZone){state.atlasFilter="all";$("#atlasSearch").value=zone(b.dataset.searchZone).name;go("atlas");return;}
if(b.dataset.side){state.side=b.dataset.side;save();renderQuest();return;}
if(b.dataset.questDone!==undefined){const k=state.side+":"+b.dataset.questDone;state.done[k]=!state.done[k];save();renderQuest();return;}
if(b.dataset.questZone){selectZone(b.dataset.questZone);return;}
if(b.dataset.part){state.parts[b.dataset.part]=!state.parts[b.dataset.part];save();renderCrew();return;}
if(b.dataset.room){const label=$("#roomNotice");if(label)label.textContent=b.dataset.room+" · This conceptual room is not an exact floor plan.";return;}
if(b.dataset.item&&Date.now()-lastDrag>350){context(b.dataset.item);return;}
if(b.dataset.zone&&Date.now()-lastDrag>350){context("zone:"+b.dataset.zone);return;}
if(b.id==="resetSession"){modal("Reset this match?",'<p>This will clear quest checks, collected parts, marked doors/items and assignments on this phone. Your player names will remain.</p><div class="actions"><button class="button danger" id="confirmReset">Yes, reset progress</button><button class="button ghost" id="cancelReset">Cancel</button></div>');return;}
if(b.id==="confirmReset"){state.done={};state.parts={};state.found={};state.assign={};state.selected=null;save();$("#modal").close();renderCrew();return;}
if(b.id==="cancelReset"||b.id==="closeModal"){$("#modal").close();return;}
if(b.id==="helpBtn"){help();return;}
if(b.id==="resetMap"){resetMap();return;}
if(b.id==="zoomIn"){setZoom(zoom*1.3);return;}
if(b.id==="zoomOut"){setZoom(zoom/1.3);return;}
});
document.addEventListener("change",e=>{if(e.target.dataset.assignment!==undefined){state.assign[state.side+":"+e.target.dataset.assignment]=e.target.value;save();}});
document.addEventListener("input",e=>{if(e.target.id==="atlasSearch")renderAtlas();if(e.target.dataset.crew!==undefined){state.crew[Number(e.target.dataset.crew)]=e.target.value||"Player "+(Number(e.target.dataset.crew)+1);save();}});
$("#worldMap").addEventListener("keydown",e=>{if((e.key==="Enter"||e.key===" ")&&e.target.matches("[data-zone],[data-item]")){e.preventDefault();e.target.dispatchEvent(new MouseEvent("click",{bubbles:true}));}});
const vp=$("#mapViewport");
vp.addEventListener("pointerdown",e=>{pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});dragged=false;try{vp.setPointerCapture(e.pointerId)}catch(_){}});
vp.addEventListener("pointermove",e=>{
if(!pointers.has(e.pointerId))return;const prev=pointers.get(e.pointerId);if(Math.abs(e.clientX-prev.x)+Math.abs(e.clientY-prev.y)>3)dragged=true;
if(pointers.size===1){panX+=e.clientX-prev.x;panY+=e.clientY-prev.y;}else if(pointers.size===2){const other=[...pointers].find(([id])=>id!==e.pointerId)?.[1];if(other){const before=Math.hypot(prev.x-other.x,prev.y-other.y),after=Math.hypot(e.clientX-other.x,e.clientY-other.y);if(before>3){const old=zoom;zoom=Math.min(3.6,Math.max(1,zoom*after/before));const rect=vp.getBoundingClientRect(),cx=(e.clientX+other.x)/2-rect.left,cy=(e.clientY+other.y)/2-rect.top;panX=cx-(cx-panX)*zoom/old;panY=cy-(cy-panY)*zoom/old;}}}
pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});clampMap();applyTransform();
});
const end=e=>{if(dragged)lastDrag=Date.now();pointers.delete(e.pointerId);};
vp.addEventListener("pointerup",end);vp.addEventListener("pointercancel",end);vp.addEventListener("lostpointercapture",end);
vp.addEventListener("wheel",e=>{e.preventDefault();setZoom(zoom*(e.deltaY<0?1.15:1/1.15));},{passive:false});
$("#modal").addEventListener("click",e=>{if(e.target===$("#modal"))$("#modal").close();});
function network(){const b=$("#networkStatus");b.textContent=navigator.onLine?"CACHE PENDING":"OFFLINE MODE";b.classList.toggle("warn",!navigator.onLine);}
window.addEventListener("online",network);window.addEventListener("offline",network);network();
if("serviceWorker" in navigator&&location.protocol==="https:"){navigator.serviceWorker.register("./sw.js").then(()=>navigator.serviceWorker.ready).then(()=>{$("#networkStatus").textContent=navigator.onLine?"OFFLINE READY":"OFFLINE MODE";}).catch(()=>{$("#networkStatus").textContent="ONLINE ONLY";$("#networkStatus").classList.add("warn")});}else if(location.protocol!=="https:"){$("#networkStatus").textContent="HTTPS REQUIRED";}
renderNav();renderMap();renderZones();renderQuest();renderAtlas();renderCrew();
})();