const CACHE="ersen-prim-v16";
const ASSETS=["./","index.html","manifest.webmanifest"];
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener("activate",e=>e.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(k=>k.startsWith("ersen-prim-")&&k!==CACHE).map(k=>caches.delete(k)));
  await self.clients.claim();
  const clients=await self.clients.matchAll({type:"window"});
  await Promise.all(clients.map(async client=>{
    const url=new URL(client.url);
    if(url.origin===self.location.origin&&url.pathname.startsWith(new URL(self.registration.scope).pathname)&&url.searchParams.get("appVersion")!=="16"){
      url.searchParams.set("appVersion","16");
      await client.navigate(url.href).catch(()=>{});
    }
  }));
})()));
self.addEventListener("fetch",e=>{
  if(e.request.mode==="navigate"){
    e.respondWith(fetch(e.request,{cache:"no-store"}).then(r=>{const c=r.clone();caches.open(CACHE).then(cache=>cache.put(e.request,c));return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match("./"))));
    return;
  }
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(resp=>{const copy=resp.clone();caches.open(CACHE).then(cache=>cache.put(e.request,copy));return resp})));
});
