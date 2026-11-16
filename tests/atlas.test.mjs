import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const context={window:{}};vm.runInNewContext(read('data.js'),context,{filename:'data.js'});
const D=context.window.TZ_DATA;
const zones=new Set(D.zones.map(z=>z.id));
test('exactly five distinct bus stops in correct order',()=>{
 const stops=D.zones.filter(z=>z.stop).sort((a,b)=>a.stop-b.stop);
 assert.deepEqual(Array.from(stops,z=>z.id),['depot','diner','farm','power','town']);
 assert.deepEqual(Array.from(stops,z=>z.stop),[1,2,3,4,5]);
});
test('map has ten real sites and valid x/y coordinates',()=>{
 assert.equal(D.zones.length,10);
 for(const z of D.zones){assert.ok(z.x>=0&&z.x<=1000);assert.ok(z.y>=0&&z.y<=760);}
});
test('every catalog item has unique key and valid site and category',()=>{
 const ids=D.items.map(i=>i.id);assert.equal(new Set(ids).size,ids.length);
 for(const i of D.items){assert.ok(zones.has(i.zone),i.id);assert.ok(D.types[i.type],i.type);assert.ok(i.name&&i.detail!==undefined);}
});
test('all six perks with expected area',()=>{
 const perks=D.items.filter(i=>i.type==='perk');
 assert.equal(perks.length,6);
 const mapping=Object.fromEntries(perks.map(i=>[i.name,i.zone]));
 for(const [perk,z] of [['Quick Revive','depot'],['Speed Cola','diner'],['Double Tap Root Beer','farm'],['Tombstone Soda','power'],['Juggernog','town'],['Stamin-Up','town']])assert.equal(mapping[perk],z);
});
test('paid, Turbine, and special door groups remain separate',()=>{
 assert.ok(D.items.filter(i=>i.type==='paid').length>=9);
 assert.ok(D.items.filter(i=>i.type==='turbine').length>=6);
 assert.ok(D.items.filter(i=>i.type==='special').length>=4);
});
test('all buildables have unique part slots and valid benches',()=>{
 const ids=D.builds.map(x=>x.id);assert.equal(new Set(ids).size,ids.length);
 assert.equal(D.builds.length,9);
 for(const b of D.builds){assert.ok(zones.has(b.zone));assert.ok(b.parts.length>=2,b.id);assert.ok(b.parts.every(x=>x.length===3&&x[0]&&x[1]&&Array.isArray(x[2])&&x[2].length>=1));}
 const jet=D.builds.find(x=>x.id==='jet');assert.equal(jet.parts.length,4);
});
test('main Easter egg branches cover different requirements',()=>{
 assert.equal(D.quests.maxis.length,6);assert.equal(D.quests.richtofen.length,8);
 for(const side of Object.keys(D.quests))for(const step of D.quests[side]){assert.ok(zones.has(step.zone));assert.ok(step.title&&step.note);}
 assert.match(D.quests.maxis.map(s=>s.note).join(' '),/Avogadro/);
 assert.match(D.quests.richtofen.map(s=>s.note).join(' '),/EMP/);
});
test('all ten achievements are indexed',()=>{
 assert.equal(D.items.filter(i=>i.name.startsWith('Achievement:')).length,10);
});
test('all five detailed floor plan groups remain available',()=>{
 for(const z of ['depot','diner','farm','power','town']){assert.ok(D.plans[z]);assert.ok(D.plans[z].floors.length>0);}
});
test('JavaScript files are syntactically valid',()=>{
 for(const p of ['app.js','data.js','diagnostics.js','sw.js'])assert.doesNotThrow(()=>new vm.Script(read(p),{filename:p}),p);
});
test('PWA resources referenced by service worker exist',()=>{
 const sw=read('sw.js');const m=sw.match(/const ASSETS=\[([^\]]+)\]/);assert.ok(m,'ASSETS precache array');
 for(const p of Array.from(m[1].matchAll(/'\.\/([^']+)'/g),m=>m[1]))assert.ok(fs.existsSync(new URL('../'+p,import.meta.url)),p);
});
test('PWA manifest launches from project relative URL',()=>{
 const m=JSON.parse(read('manifest.webmanifest'));assert.equal(m.start_url,'./');assert.equal(m.scope,'./');assert.equal(m.display,'standalone');
});
test('top navigation matches actual view elements',()=>{
 const html=read('index.html');
 for(const view of ['map','quest','craft']){assert.ok(html.includes('id="view-'+view+'"'));assert.ok(html.includes('data-view="'+view+'"'));}
 for(const view of ['zones','atlas','crew'])assert.ok(html.includes('id="view-'+view+'"'));
 assert.equal((html.match(/data-view="/g)||[]).length,3);assert.match(html,/id="auxSheet"/);
});
test('all script resources are local to the repository',()=>{
 const html=read('index.html');
 assert.ok(html.includes('src="./data.js"'));assert.ok(html.includes('src="./app.js"'));
 assert.doesNotMatch(html,/<script[^>]*src="https?:/);
});
test('data references include original-era quest / door evidence',()=>{
 assert.ok(D.references.some(r=>r.url.includes('tranzit-easter-egg')));
 assert.ok(D.references.some(r=>r.url.includes('neoseeker')));
});

test('world map uses the supplied-reference geometry and separate art layer',()=>{
 const html=read('index.html');
 assert.match(html,/id="worldMap" viewBox="0 0 720 580"/);
 assert.match(html,/href="\.\/world-art\.svg"/);
 const art=read('world-art.svg');
 assert.match(art,/<svg[^>]*viewBox="0 0 720 580"/);
 const app=read('app.js');
 for(const text of ['FARM','DINER / GARAGE','TOWN CENTER','BUS DEPOT','POWER STATION','THE TUNNEL','OBELISK / PYLON','PROTOTYPE / NACHT','CABIN','BRIDGE']){
  assert.ok(app.includes(text),'fixed-overlay label: '+text);
 }
 assert.match(html,/id="mapWorld"/);
 assert.match(html,/id="mapLabels"/);
 assert.doesNotMatch(art,/<text\\b/,'labels must not be baked into zooming terrain');
 assert.match(art,/class="route-surface"/);
 assert.match(art,/class="lamp"/);
});
test('reference zones match the uploaded image geography',()=>{
 const p=Object.fromEntries(D.zones.map(z=>[z.id,z]));
 assert.ok(p.farm.x < p.diner.x,'Farm should be west of Diner');
 assert.ok(p.farm.y < p.town.y,'Farm should be north of Town');
 assert.ok(p.diner.y < p.depot.y,'Diner should be north of Depot');
 assert.ok(p.power.x < p.town.x,'Power should be west of Town');
 assert.ok(p.power.y > p.farm.y,'Power should be south of Farm');
 assert.ok(p.town.x < p.depot.x,'Town should be west of Bus Depot');
 assert.ok(p.nacht.x < p.pylon.x,'Prototype lies across road, west of Obelisk');
 assert.match(p.nacht.name,/Prototype/);
 for(const z of D.zones){assert.ok(z.x>=0&&z.x<=720,z.id);assert.ok(z.y>=0&&z.y<=580,z.id);}
});
test('map category badges are tethered to known sites, never arbitrary item coordinates',()=>{
 const app=read('app.js'),html=read('index.html');
 assert.match(app,/function calloutSpot\(/);
 assert.match(app,/const leader=svgEl\("line"/);
 assert.match(app,/data-group/);
 assert.doesNotMatch(app,/MAP_SLOTS|function markerSpot\(/);
 assert.match(html,/not exact indoor positions/);
});
test('world atlas exposes a visible icon key and separate Easter Egg tab',()=>{
 const html=read('index.html');
 for(const view of ['map','quest','craft'])assert.ok(html.includes('data-view="'+view+'"'),view);
 for(const view of ['atlas','zones','crew'])assert.ok(html.includes('id="view-'+view+'"'),view);
 assert.match(html,/id="crewAccess"/);assert.match(html,/id="closeSheet"/);
 for(const node of ['interactiveMap','mapLegend','mapContext','mapViewport','mapFullScreen','mapExit','questPanel'])assert.ok(html.includes('id="'+node+'"'),node);
 assert.match(html,/MAP KEY/);
 assert.match(html,/EASTER EGG/);
 assert.match(html,/Easter Egg Walkthrough/);
 assert.doesNotMatch(html,/id="mapModeBar"|id="mapMission"/);
});

test('mobile styles include minimum touch sizes, adaptive layout and reduced motion',()=>{
 const css=read('styles.css');
 assert.match(css,/\.bottom-nav button\{[^}]*min-height:57px/);
 assert.match(css,/\.tick\{[^}]*min-width:44px/);
 assert.match(css,/@media\(max-width:390px\)/);
 assert.match(css, /prefers-reduced-motion:reduce/);
});
test('map pointer camera waits for motion before dragging a one-finger tap',()=>{
 const code=read('app.js');
 assert.match(code,/pointerdown",e=>\{/);
 assert.match(code,/pointers\.set\(e\.pointerId/);
 assert.match(code,/pointermove",e=>\{/);
 assert.match(code,/if\(!dragged&&Math\.hypot\(/);
 assert.match(code,/captureDrag\(e\)/);
 assert.match(code,/function finishMapGesture\(/);
});

test('tap information and category key are directly wired to map markers',()=>{
 const app=read('app.js');
 assert.match(app,/function drawMapKey\(/);
 assert.match(app,/function renderMapMarkers\(/);
 assert.match(app,/function context\(/);
 assert.match(app,/function closeMapContext\(/);
 assert.match(app,/data-map-key/);
 assert.match(app,/data-map-item/);
 assert.match(app,/data-find-on-map/);
 assert.match(app,/data-quest-zone/);
});

test('zoom scales the terrain only and not the icon/text overlays',()=>{
 const app=read('app.js'),css=read('styles.css'),html=read('index.html');
 assert.match(html,/<g id="mapWorld">/);
 assert.match(html,/<g id="mapLabels">/);
 assert.match(app,/function positionMapOverlays\(/);
 assert.match(app,/function mapPixelScale\(/);
 assert.match(app,/function pointerToMap\(/);
 assert.match(app,/function applyTransform\(/);
 assert.match(app,/\$\("#mapWorld"\)\.setAttribute\("transform"/);
 assert.match(app,/data-world-x/);
 assert.match(app,/positionMapOverlays\(\)/);
 assert.match(css,/#worldMap\{transform:none!important/);
 assert.match(css,/#mapLabels .fixed-world-label/);
});
test('pinch and drag use bounded camera-space deltas and retain desktop fallback',()=>{
 const app=read('app.js');
 assert.match(app,/function moveCamera\(/);
 assert.match(app,/panX\+=dx/);
 assert.match(app,/panY\+=dy/);
 assert.match(app,/function pinchCamera\(/);
 assert.match(app,/function clampMap\(/);
 assert.match(app,/pointercancel/);
 assert.match(app,/wheel",e=>/);
});
test('Map Diagnostics is accessible through Help and remains offline precached',()=>{
 const html=read('index.html'),sw=read('sw.js'),js=read('diagnostics.js');
 for(const id of ['openMapScan','mapScanPanel','startMapScan','stopMapScan','copyMapScan','mapScanReport'])
  assert.ok(html.includes('id="'+id+'"'),id);
 assert.match(html,/src="\.\/diagnostics\.js"/);
 assert.match(sw,/'\.\/diagnostics\.js'/);
 assert.match(read('app.js'),/id==="helpMapScan"/);
 assert.match(js,/TRANZIT MAP PERFORMANCE SCAN v2/);
 assert.match(js,/requestAnimationFrame/);
 assert.match(js,/pointermove/);
 assert.match(js,/recordMapWork/);
 assert.match(js,/navigator\.clipboard/);
 assert.match(js,/does not access your location|No game saves, account data, GPS location/);
});
test('Map scanner is opt-in and does not silently upload reports',()=>{
 const code=read('diagnostics.js');
 assert.match(code,/scan\.active=false/);
 assert.match(code,/copyMapScan/);
 assert.doesNotMatch(code,/\bfetch\(|XMLHttpRequest|sendBeacon\(|WebSocket\(/);
 assert.match(read('app.js'),/window\.TZ_MAP_TELEMETRY/);
});

test('iPhone uses native touch streams instead of brittle pointer capture',()=>{
 const app=read('app.js');
 assert.match(app,/vp\.addEventListener\("touchstart",nativeTouchStart,\{passive:true\}\)/);
 assert.match(app,/vp\.addEventListener\("touchmove",nativeTouchMove,\{passive:false\}\)/);
 assert.match(app,/vp\.addEventListener\("touchend",nativeTouchEnd/);
 assert.match(app,/nativeTouchSeen&&e\.pointerType==="touch"/);
 assert.match(app,/function moveCamera\(/);
 assert.match(app,/function pinchCamera\(/);
 assert.match(app,/e\.preventDefault\(\)/);
});
test('initial map allows panning and reports blocked camera input separately',()=>{
 const app=read('app.js'),diag=read('diagnostics.js');
 assert.match(app,/let zoom=1\.7,panX=-252,panY=-203/);
 for(const key of ['nativeTouchHandled','pointerHandled','panChanged','panAtBoundary','cameraFrames','pointerCaptureLost'])
  assert.ok(app.includes(key)&&diag.includes(key),key);
 assert.match(diag,/Camera movement blocked by edge/);
});
