import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('../sw.js',import.meta.url),'utf8');
const scope='https://hdog960.github.io/BO2-map/';
const resolve=request=>new URL(typeof request==='string'?request:request.url,scope).href;

function simulatedWorker({initial=[],networkOnline=true}={}){
 const handlers=new Map(),stores=new Map(),deleted=[];
 const response=(body,ok=true)=>({body,ok,clone(){return response(body,ok)}});
 for(const name of initial)stores.set(name,new Map([['https://hdog960.github.io/unrelated-sentinel',response('sibling data')]]));
 const cacheAPI={
  async keys(){return [...stores.keys()]},
  async delete(name){deleted.push(name);return stores.delete(name)},
  async open(name){
   if(!stores.has(name))stores.set(name,new Map());
   const entries=stores.get(name);
   return {
    async addAll(paths){for(const p of paths)entries.set(resolve(p),response('cached '+p))},
    async put(request,value){entries.set(resolve(request),value)},
    async match(request){return entries.get(resolve(request))}
   };
  },
  async match(request){
   for(const entries of stores.values()){const v=entries.get(resolve(request));if(v)return v;}
  }
 };
 let skipWaiting=0,claimed=0;
 const self={
  location:{origin:'https://hdog960.github.io'},
  clients:{async claim(){claimed++}},
  async skipWaiting(){skipWaiting++},
  addEventListener(name,handler){handlers.set(name,handler)}
 };
 const network=async request=>{if(!networkOnline)throw Error('OFFLINE');return response('fresh '+resolve(request))};
 vm.runInNewContext(source,{caches:cacheAPI,self,fetch:network,URL,Response:{error:()=>response('error',false)}},{filename:'sw.js'});
 const dispatch=async (name,request)=>{
  let promise;
  const event={
   request,
   waitUntil(work){promise=work},
   respondWith(work){promise=work}
  };
  assert.ok(handlers.has(name),'worker must implement '+name);
  handlers.get(name)(event);
  if(name==='fetch'&&!promise)return undefined; // Cross-origin requests are intentionally unclaimed.
  assert.ok(promise,'worker '+name+' must wait for async work');
  return await promise;
 };
 return {stores,deleted,cacheAPI,dispatch,gets:{get skipWaiting(){return skipWaiting},get claimed(){return claimed}}};
}

test('M16.5A worker version and assets are self-owned, with PNG cache fallback',()=>{
 assert.match(source,/const CACHE='tranzit-atlas-v15'/);
 assert.match(source,/const OWNED_CACHE_PREFIX='tranzit-atlas-'/);
 assert.match(source,/key\.startsWith\(OWNED_CACHE_PREFIX\)&&key!==CACHE/);
 for(const asset of ['index.html','styles.css','app.js','diagnostics.js','data.js','manifest.webmanifest','world-art.svg','icon.svg','apple-touch-icon.png'])
  assert.ok(source.includes("'./"+asset+"'"),asset+' must be in offline precache');
 assert.doesNotMatch(source,/keys\.filter\(key=>key!==CACHE\)/);
});

test('M16.5A installation populates only TranZit v15 and activates without deleting sibling caches',async()=>{
 const sw=simulatedWorker({initial:['tranzit-atlas-v14','tranzit-atlas-v13','tranzit-atlas-v8','mythwrought-assets-v4','runegrave-offline-v3','unwritten-company-cache','tranzit-field-atlas-custom']});
 await sw.dispatch('install');
 assert.equal(sw.gets.skipWaiting,1);
 assert.ok(sw.stores.get('tranzit-atlas-v15')?.has(scope+'apple-touch-icon.png'));
 assert.ok(sw.stores.get('tranzit-atlas-v15')?.has(scope+'index.html'));
 await sw.dispatch('activate');
 assert.equal(sw.gets.claimed,1);
 assert.deepEqual(sw.deleted.sort(),['tranzit-atlas-v13','tranzit-atlas-v14','tranzit-atlas-v8']);
 for(const sibling of ['mythwrought-assets-v4','runegrave-offline-v3','unwritten-company-cache','tranzit-field-atlas-custom'])
  assert.equal(sw.stores.get(sibling)?.get('https://hdog960.github.io/unrelated-sentinel')?.body,'sibling data',sibling);
 assert.ok(sw.stores.has('tranzit-atlas-v15'));
});

test('M16.5A existing v15 cache remains while older same-prefix caches are retired',async()=>{
 const sw=simulatedWorker({initial:['tranzit-atlas-v15','tranzit-atlas-v14','tranzit-atlas-v13','mythwrought-v1']});
 await sw.dispatch('activate');
 assert.deepEqual(sw.deleted,['tranzit-atlas-v14','tranzit-atlas-v13']);
 assert.ok(sw.stores.has('tranzit-atlas-v15'));
 assert.ok(sw.stores.has('mythwrought-v1'));
});

test('M16.5A cached index and artwork remain readable during offline navigation',async()=>{
 const sw=simulatedWorker({networkOnline:false,initial:['mythwrought-offline']});
 await sw.dispatch('install');
 await sw.dispatch('activate');
 const index=await sw.dispatch('fetch',{url:scope+'page?reload=1',method:'GET',mode:'navigate'});
 assert.equal(index.body,'cached ./index.html');
 const image=await sw.dispatch('fetch',{url:scope+'world-art.svg',method:'GET',mode:'no-cors'});
 assert.equal(image.body,'cached ./world-art.svg');
 const png=await sw.dispatch('fetch',{url:scope+'apple-touch-icon.png',method:'GET',mode:'no-cors'});
 assert.equal(png.body,'cached ./apple-touch-icon.png');
});

test('M16.5A online fetch refreshes current cache but never claims external requests',async()=>{
 const sw=simulatedWorker();
 await sw.dispatch('install');
 const url=scope+'styles.css';
 const refreshed=await sw.dispatch('fetch',{url,method:'GET',mode:'no-cors'});
 assert.equal(refreshed.body,'fresh '+url);
 const latest=await sw.stores.get('tranzit-atlas-v15').get(url);
 assert.equal(latest.body,'fresh '+url);
 const keysBefore=[...sw.stores.get('tranzit-atlas-v15').keys()];
 const outside={url:'https://example.com/style.css',method:'GET',mode:'no-cors'};
 const skipped=await sw.dispatch('fetch',outside).catch(e=>e);
 assert.equal(skipped,undefined,'foreign requests must not be intercepted');
 assert.deepEqual([...sw.stores.get('tranzit-atlas-v15').keys()],keysBefore);
});
