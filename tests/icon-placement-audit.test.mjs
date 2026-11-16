import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const sandbox={window:{}};vm.runInNewContext(read('data.js'),sandbox);
const D=sandbox.window.TZ_DATA,areas=new Set(D.zones.map(z=>z.id));
const at=(name)=>D.items.find(i=>i.name===name);
test('placement audit covers exactly 130 entries with unique IDs and no missing precision',()=>{
 assert.equal(D.items.length,130);
 assert.equal(D.zones.length,10);
 assert.equal(new Set(D.items.map(i=>i.id)).size,D.items.length);
 for(const i of D.items){
  assert.ok(areas.has(i.zone),i.name);
  assert.ok(['site-callout','index-only'].includes(i.mapMode),i.name);
  assert.ok(i.placementPrecision&&i.mapReason&&i.placementEvidence,i.name);
  assert.ok(i.alternateZones.every(z=>areas.has(z)&&z!==i.zone),i.name);
 }
 assert.equal(D.items.filter(i=>i.mapMode==='site-callout').length,91);
 assert.equal(D.items.filter(i=>i.mapMode==='index-only').length,39);
});
test('ten source-aligned site anchors and five real bus stops are unique',()=>{
 const keys=D.zones.map(z=>z.x+":"+z.y);
 assert.equal(new Set(keys).size,D.zones.length);
 assert.deepEqual(Array.from(D.zones.filter(z=>z.stop).sort((a,b)=>a.stop-b.stop),z=>z.id),['depot','diner','farm','power','town']);
 for(const z of D.zones){assert.ok(z.x>=0&&z.x<=720);assert.ok(z.y>=0&&z.y<=580);}
});
test('moving and map-wide references do not masquerade as stationary pickup icons',()=>{
 assert.equal(at('B23R').mapMode,'index-only');
 for(const item of D.items.filter(i=>i.name.startsWith('Achievement:')||i.name.startsWith('Persistent ')))
  assert.equal(item.mapMode,'index-only',item.name);
 assert.equal(at('Denizen portal').mapMode,'index-only');
 for(const item of D.items.filter(i=>i.name==='Streetlight / possible EMP target'))
  assert.equal(item.mapMode,'index-only',item.zone);
});
test('six game-mode perk machines remain in the correct site, never a guessed room coordinate',()=>{
 const names={'Quick Revive':'depot','Speed Cola':'diner','Double Tap Root Beer':'farm','Tombstone Soda':'power','Juggernog':'town','Stamin-Up':'town'};
 const list=D.items.filter(i=>i.type==='perk');
 assert.equal(list.length,6);
 for(const i of list){assert.equal(i.zone,names[i.name]);assert.equal(i.mapMode,'site-callout');assert.match(i.placementPrecision,/unmeasured/);}
});
test('doors are room-specific references, not invented world coordinates',()=>{
 for(const t of ['paid','turbine','special']){
  for(const i of D.items.filter(i=>i.type===t)){
   assert.equal(i.mapMode,'site-callout',i.name);
   assert.ok(i.room,i.name);
  }
 }
});
test('multi-site NAV components show alternatives instead of false single spawn',()=>{
 const expectLocations={
  'NAV radio':['nacht','diner'],
  'NAV wooden board':['tunnel','power'],
  'NAV electrical box':['farm','town','depot']
 };
 for(const [name,expected] of Object.entries(expectLocations)){
  const item=at(name);assert.ok(item,name);
  assert.deepEqual([item.zone,...item.alternateZones],expected);
  assert.equal(item.placementPrecision,'multiple possible sites');
 }
});
test('item categories tether to sites, not arbitrary sorted slots',()=>{
 const app=read('app.js'),html=read('index.html');
 assert.doesNotMatch(app,/MAP_SLOTS|function markerSpot\(/);
 assert.match(app,/function isInMappedSite\(/);
 assert.match(app,/function placedItems\(/);
 assert.match(app,/data-group/);
 assert.match(app,/calloutSpot\(/);
 assert.match(app,/const leader=svgEl\("line"/);
 assert.match(html,/not exact indoor positions/);
});
test('full 130-row audit ledger is versioned',()=>{
 const doc=read('AUDIT_ICON_PLACEMENT.md');
 assert.match(doc,/NOT 100% EXACT-CERTIFIED/);
 assert.match(doc,/all 130 data entries|all 130/i);
 assert.match(doc,/user-supplied/i);
 for(const i of D.items)assert.ok(doc.includes(i.name),i.name);
});
