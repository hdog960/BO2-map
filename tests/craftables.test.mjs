import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const read=p=>fs.readFileSync(new URL("../"+p,import.meta.url),"utf8");
const sandbox={window:{}};
vm.runInNewContext(read("data.js"),sandbox,{filename:"data.js"});
const D=sandbox.window.TZ_DATA;
const getBuild=id=>D.builds.find(b=>b.id===id);
test("nine buildables have unique colors and readable short labels",()=>{
 assert.equal(D.builds.length,9);
 assert.equal(new Set(D.builds.map(b=>b.id)).size,9);
 assert.equal(new Set(D.builds.map(b=>b.code)).size,9);
 assert.equal(new Set(D.builds.map(b=>b.color)).size,9);
 for(const b of D.builds){
  assert.match(b.color,/^#[a-f0-9]{6}$/i,b.id);
  assert.ok(b.code.length>=2&&b.code.length<=3,b.id);
  assert.ok(b.note&&b.location,b.id);
 }
});
test("all 27 part and 8 bench catalog entries have a parent buildable",()=>{
 const parts=D.items.filter(i=>i.type==="part"),benches=D.items.filter(i=>i.type==="bench");
 assert.equal(parts.length,27);assert.equal(benches.length,8);
 for(const i of [...parts,...benches])assert.ok(getBuild(i.buildId),i.id);
 for(const b of D.builds)for(const [index,part] of b.parts.entries()){
  assert.equal(part.length,3,b.id+":"+index);
  assert.ok(part[2].length>0,b.id+":"+index);
  for(const ref of part[2])assert.ok(D.items.some(i=>i.id===ref&&i.buildId===b.id&&i.type==="part"),ref);
 }
});
test("Jet Gun maps four independent component sites and the Town workbench",()=>{
 const b=getBuild("jet");
 assert.equal(b.code,"JG");
 assert.deepEqual(Array.from(b.parts,part=>D.items.find(i=>i.id===part[2][0]).zone),["tunnel","power","nacht","cabin"]);
 assert.equal(D.items.find(i=>i.id===b.benchItemId).zone,"town");
 assert.deepEqual(Array.from(b.parts,part=>part[0]),["Jet engine","Wires","Handbrake","Pressure gauge"]);
});
test("Pack-a-Punch parts share one area reference; no invented individual coordinates",()=>{
 const b=getBuild("pap");
 const ids=b.parts.flatMap(part=>part[2]);
 assert.equal(new Set(ids).size,1);
 assert.equal(D.items.find(i=>i.id===ids[0]).zone,"town");
});
test("bus upgrades have four alternate candidate sites but no invented fixed bench",()=>{
 const b=getBuild("bus");assert.equal(b.benchItemId,null);
 for(const part of b.parts){
  assert.equal(part[2].length,4);
  assert.deepEqual(Array.from(part[2],ref=>D.items.find(i=>i.id===ref).zone),["depot","diner","farm","town"]);
 }
});
test("NAV Table source candidates include alternative zones",()=>{
 const b=getBuild("nav");
 assert.equal(D.items.find(i=>i.id===b.benchItemId).zone,"pylon");
 const expected=[["depot"],["nacht","diner"],["tunnel","power"],["farm","town","depot"]];
 for(let i=0;i<b.parts.length;i++){
  const item=D.items.find(x=>x.id===b.parts[i][2][0]);
  assert.deepEqual([item.zone,...item.alternateZones],expected[i]);
 }
});
test("map and craft UI link specific parts to one shared saved checklist",()=>{
 const app=read("app.js"),html=read("index.html");
 for(const term of ["function renderCraftPanel","function renderCraftMapStrip","function buildMarkersAtSite","data-craft-map","data-craft-locate","data-craft-bench","data-part","craftFocus"])
  assert.ok(app.includes(term),term);
 assert.match(html,/id="view-craft"/);
 assert.match(html,/id="craftMapStrip"/);
 assert.match(html,/data-view="craft"/);
 assert.match(app,/state\.parts\[chosen\.id\+":"\+i\]/);
});
test("craftable map still preserves audited site-callout-only positioning",()=>{
 const app=read("app.js");
 assert.match(app,/isInMappedSite\(i,z\.id\)/);
 assert.match(app,/calloutSpot\(z,index\)/);
 assert.doesNotMatch(app,/MAP_SLOTS/);
});
