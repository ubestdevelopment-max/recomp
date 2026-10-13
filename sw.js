const V='recomp-v4';
const CORE=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-maskable.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET')return;
  if(r.mode==='navigate'){ // network first so updates arrive, cache when offline
    e.respondWith(fetch(r).then(res=>{const c=res.clone();caches.open(V).then(x=>x.put('./index.html',c));return res;}).catch(()=>caches.match('./index.html')));return;}
  e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(res=>{const c=res.clone();caches.open(V).then(x=>x.put(r,c));return res;}).catch(()=>hit)));
});
self.addEventListener('notificationclick',e=>{e.notification.close();
  const id=(e.notification.data||{}).id,act=e.action;
  e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(cs=>{
    if(act&&id){ if(cs.length){cs[0].postMessage({type:'recomp-action',id,action:act});return act==='done'&&id==='train'?cs[0].focus():null;}
      return clients.openWindow('./?act='+act+'&id='+encodeURIComponent(id)); }
    return cs.length?cs[0].focus():clients.openWindow('./');}));});
