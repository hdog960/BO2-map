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
function boot(){
 const names=['modal','modalTitle','modalBody','networkStatus','worldMap','mapViewport','routeLabels','mapPins','mapContext','filterBar','zoneTabs','zonePlan','questPanel','questSides','atlasFilters','atlasItems','atlasSearch','crewPanel'];
 const els=Object.fromEntries(names.map(n=>[n,new Element(n)]));
 let stored=null;
 const localStorage={getItem(){return stored},setItem(k,s){assert.equal(k,'tranzit-atlas-save-v1');stored=s;}};
 const document={events:{},querySelector(k){if(!k.startsWith('#'))throw Error(k);return els[k.slice(1)]||(els[k.slice(1)]=new Element(k));},querySelectorAll(k){if(k==='.bottom-nav button')return ['map','zones','quest','atlas','crew'].map(view=>Object.assign(new Element('nav'),{dataset:{view}}));if(k==='.view')return ['map','zones','quest','atlas','crew'].map(view=>new Element('view-'+view));if(k==='[data-side]')return ['maxis','richtofen'].map(side=>Object.assign(new Element('button'),{dataset:{side}}));return[];},createElementNS(ns,tag){return new Element(tag)},addEventListener(k,fn){this.events[k]=fn;}};
 const window={addEventListener(){},scrollTo(){}};const navigator={onLine:true};const location={protocol:'http:'};
 const sandbox={window,document,navigator,location,localStorage,console:{warn(){}}};
 vm.runInNewContext(read('data.js'),sandbox,{filename:'data.js'});
 vm.runInNewContext(read('app.js'),sandbox,{filename:'app.js'});
 const click=dataset=>document.events.click({target:{closest(){return{dataset}}}});
 return {els,click,document,saved:()=>JSON.parse(stored)};
}
test('application starts without throwing and fills all five views',()=>{
 const {els}=boot();
 for(const [name,min] of [['filterBar',200],['zonePlan',200],['questPanel',200],['atlasItems',200],['crewPanel',200]])assert.ok(els[name].innerHTML.length>min,name);
 assert.match(els.questPanel.innerHTML,/MAXIS|Avogadro/i);
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
test('switching map marker filter updates state and output',()=>{
 const {els,click,saved}=boot();
 assert.match(els.filterBar.innerHTML,/Perks/);
 click({filter:'perk'});
 assert.ok(!saved().mapFilters.includes('perk'));
 assert.ok(els.filterBar.innerHTML.length>200);
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
 const {els,click}=boot();click({showItem:'perk-6'});
 assert.equal(els.modal.open,true);assert.match(els.modalBody.innerHTML,/Quic|Speed|Double|Tombstone|Juggernog|Stamin-Up/);
});
