import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
class Element{
 constructor(id){this.id=id;this.dataset={};this.style={};this.innerHTML='';this.textContent='';this.value='';this.clientWidth=375;this.clientHeight=385;this.open=false;this.events={};this.attributes={};this.classList={toggle(){},add(){},remove(){}};}
 setAttribute(k,v){this.attributes[k]=v;}appendChild(){}append(){}addEventListener(k,fn){this.events[k]=fn;}
 getBoundingClientRect(){return{left:0,top:0}}showModal(){this.open=true}close(){this.open=false}
}
function boot(seed=null){
 const names=['modal','modalTitle','modalBody','networkStatus','worldMap','mapViewport','routeLabels','mapPins','mapContext','filterBar','zoneTabs','zonePlan','questPanel','questSides','atlasFilters','atlasItems','atlasSearch','crewPanel'];
 const els=Object.fromEntries(names.map(n=>[n,new Element(n)]));
 let stored=seed;
 const localStorage={getItem(){return stored},setItem(k,s){assert.equal(k,'tranzit-atlas-save-v1');stored=s;}};
 const document={events:{},querySelector(k){if(!k.startsWith('#'))throw Error(k);return els[k.slice(1)]||(els[k.slice(1)]=new Element(k));},querySelectorAll(k){if(k==='.bottom-nav button')return ['map','zones','quest','atlas','crew'].map(view=>Object.assign(new Element('nav'),{dataset:{view}}));if(k==='.view')return ['map','zones','quest','atlas','crew'].map(view=>new Element('view-'+view));if(k==='[data-side]')return ['maxis','richtofen'].map(side=>Object.assign(new Element('button'),{dataset:{side}}));return[];},createElementNS(ns,tag){return new Element(tag)},addEventListener(k,fn){this.events[k]=fn;}};
 const window={addEventListener(){},scrollTo(){}};const navigator={onLine:true};const location={protocol:'http:'};
 const sandbox={window,document,navigator,location,localStorage,console:{warn(){}}};
 vm.runInNewContext(read('data.js'),sandbox,{filename:'data.js'});
 vm.runInNewContext(read('app.js'),sandbox,{filename:'app.js'});
 const click=(dataset,id='')=>document.events.click({target:{closest(){return{dataset,id}}}});
 return {els,click,document,saved:()=>JSON.parse(stored)};
}
test('application starts with interactive map key and all other screens intact',()=>{
 const {els}=boot();
 for(const [name,min] of [['mapLegend',300],['zonePlan',200],['questPanel',200],['atlasItems',200],['crewPanel',200]])assert.ok(els[name].innerHTML.length>min,name);
 assert.match(els.mapLegend.innerHTML,/Perks/);
 assert.match(els.mapLegend.innerHTML,/Turbine doors/);
 assert.match(els.questPanel.innerHTML,/Avogadro|MAXIS/i);
});

test('selecting Richtofen switches to its eight-step quest path',()=>{
 const {els,click,saved}=boot();click({side:'richtofen'});
 assert.match(els.questPanel.innerHTML,/Four-player simultaneous EMP throw/);
 assert.equal(saved().side,'richtofen');
});
test('quest checkbox is persistent',()=>{
 const {els,click,saved}=boot();
 click({questDone:'0'});
 assert.equal(saved().done['maxis:0'],true);
 assert.match(els.questPanel.innerHTML,/1\/6/);
});
test('map key focuses a category and restores overview',()=>{
 const {els,click,saved}=boot();
 click({mapKey:'perk'});
 assert.equal(saved().mapKind,'perk');
 assert.match(els.mapLegend.innerHTML,/aria-pressed="true"/);
 click({mapKey:'all'});
 assert.equal(saved().mapKind,'all');
});

test('tracking buildable parts persists and reset clears progress',()=>{
 const {els,click,saved}=boot();
 click({part:'jet:0'});assert.equal(saved().parts['jet:0'],true);
 click({view:'crew'});assert.match(els.crewPanel.innerHTML,/Jet Gun/);
});
test('interiors switch to upper floor without crashing',()=>{
 const {els,click,saved}=boot();click({zoneTab:'diner'});click({floor:'1'});
 assert.equal(saved().zone,'diner');assert.equal(saved().floor,1);
 assert.match(els.zonePlan.innerHTML,/Diner roof/);
});
test('in-app details dialog opens and closes',()=>{
 const {els,click}=boot();click({showItem:'perk-depot-quick-revive-depot-hall-hallway-near-main-door'});
 assert.equal(els.modal.open,true);assert.equal(els.modalTitle.textContent,"Quick Revive");assert.match(els.modalBody.innerHTML,/Depot hall/);
});

test('tapping map item listings reveals their real names and rooms',()=>{
 const {els,click,saved}=boot();
 click({mapMore:'town'});
 assert.match(els.mapContext.innerHTML,/Juggernog/);
 assert.match(els.mapContext.innerHTML,/Stamin-Up/);
 assert.equal(saved().selected,'more:town');
 click({mapItem:'perk-town-juggernog-burning-building-upper-floor'});
 assert.match(els.mapContext.innerHTML,/2500/);
 assert.match(els.mapContext.innerHTML,/Burning building upper floor/);
});

test('map key is always populated; the walkthrough is a separate screen',()=>{
 const {els,click,saved}=boot();
 assert.match(els.mapLegend.innerHTML,/All/);
 assert.match(els.zoneSelect.innerHTML,/Bus stops/);
 assert.match(els.atlasCount.textContent,/130 results/);
 click({view:'quest'});
 assert.equal(saved().view,'quest');
 assert.match(els.questPanel.innerHTML,/Your next objective/i);
});

test('key offers paid and Turbine door visibility without mode menus',()=>{
 const {click,saved,els}=boot();
 click({mapKey:'paid'});
 assert.equal(saved().mapKind,'paid');
 assert.match(els.mapLegend.innerHTML,/Paid doors/);
 click({mapKey:'turbine'});
 assert.equal(saved().mapKind,'turbine');
 click({mapKey:'all'});
 assert.equal(saved().mapKind,'all');
});

test('Easter Egg Locate links directly back to correct map landmark',()=>{
 const {click,els,saved}=boot();
 click({view:'quest'});click({questZone:'power'});
 assert.equal(saved().view,'map');
 assert.match(els.mapContext.innerHTML,/Power Station/);
 assert.equal(saved().selected,'zone:power');
});

test('quick find searches names and returns a visible count',()=>{
 const {click,els,saved}=boot();
 click({quickFind:'Jet Gun'});
 assert.equal(els.atlasSearch.value,'Jet Gun');
 assert.match(els.atlasCount.textContent,/results for "Jet Gun"/);
 assert.match(els.atlasItems.innerHTML,/Jet Gun/);
 assert.equal(saved().atlasFilter,'all');
});
test('global search navigates to FIND without losing progress',()=>{
 const {click,saved,els}=boot();
 click({questDone:'0'});click({},'globalFind');
 assert.equal(saved().view,'atlas');
 assert.equal(saved().done['maxis:0'],true);
 assert.match(els.atlasItems.innerHTML,/Quick Revive/);
});
test('site picker changes location and opens a floor guide',()=>{
 const {document,els,saved}=boot();
 document.events.change({target:{id:'zoneSelect',value:'town',dataset:{}}});
 assert.equal(saved().zone,'town');
 assert.match(els.zonePlan.innerHTML,/Bank/);
 assert.match(els.zoneSelect.innerHTML,/Town/);
});
test('compact crew view retains all nine expandable buildable checklists',()=>{
 const {els}=boot();
 assert.equal((els.crewPanel.innerHTML.match(/class="build-card"/g)||[]).length,9);
 assert.match(els.crewPanel.innerHTML,/Jet Gun/);
 assert.match(els.crewPanel.innerHTML,/Turbine/);
 assert.match(els.crewPanel.innerHTML,/PLAYER 4/);
});
test('old saved quest and item checkmarks are preserved on map rebuild',()=>{
 const old=JSON.stringify({mapFilters:['perk','bench'],done:{'maxis:1':true},view:'map',found:{'door-temp':true}});
 const {click,saved}=boot(old);
 click({mapKey:'perk'});
 assert.equal(saved().mapKind,'perk');
 assert.equal(saved().done['maxis:1'],true);
 assert.equal(saved().found['door-temp'],true);
 assert.deepEqual(Array.from(saved().mapFilters),['perk','bench']);
});

test('reset match clears progress but retains the four operator names',()=>{
 const {click,saved}=boot();
 click({part:'jet:0'});click({questDone:'0'});
 click({},'resetSession');click({},'confirmReset');
 assert.deepEqual(Object.keys(saved().parts),[]);
 assert.deepEqual(Object.keys(saved().done),[]);
 assert.equal(saved().crew[0],'Player 1');
});

test('map information sheet can be dismissed without clearing game progress',()=>{
 const {els,click,saved}=boot();
 click({view:'quest'});click({questDone:'0'});
 click({zone:'diner'});
 assert.match(els.mapContext.innerHTML,/Diner/);
 assert.equal(els.mapContext.hidden,false);
 click({},'closeMapContext');
 assert.equal(els.mapContext.hidden,true);
 assert.equal(saved().done['maxis:0'],true);
});
test('Find can send a selected item back to the map',()=>{
 const {els,click,saved}=boot();
 click({showItem:'perk-depot-quick-revive-depot-hall-hallway-near-main-door'});
 assert.match(els.modalBody.innerHTML,/Show on map/);
 click({findOnMap:'perk-depot-quick-revive-depot-hall-hallway-near-main-door'});
 assert.equal(saved().view,'map');
 assert.equal(saved().mapKind,'perk');
 assert.match(els.mapContext.innerHTML,/Quick Revive/);
});
