const CACHE='tranzit-atlas-v14';
// Cache Storage is shared by all GitHub Pages projects on this origin.
// Delete only caches explicitly owned by TranZit; never sibling PWAs.
const OWNED_CACHE_PREFIX='tranzit-atlas-';
const ASSETS=['./','./index.html','./styles.css','./app.js','./diagnostics.js','./data.js','./manifest.webmanifest','./icon.svg','./apple-touch-icon.png','./world-art.svg'];
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith(OWNED_CACHE_PREFIX)&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
 event.respondWith(fetch(event.request).then(response=>{
   if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(event.request,copy)));}
   return response;
 }).catch(()=>caches.match(event.request).then(hit=>hit||((event.request.mode==='navigate')?caches.match('./index.html'):Response.error()))));
});