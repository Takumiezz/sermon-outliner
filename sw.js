/* sw placeholder */
var CACHE_NAME = 'sermon-v1';
self.addEventListener('install',function(e){e.waitUntil(caches.open(CACHE_NAME).then(function(c){return c.addAll(['./','./index.html','./styles.css','./manifest.json','./js/bible-data.js','./js/bible-text.js','./js/outline-generator.js','./js/app.js']);}));self.skipWaiting();});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(k){return Promise.all(k.filter(function(x){return x!==CACHE_NAME;}).map(function(x){return caches.delete(x);}));}));self.clients.claim();});
self.addEventListener('fetch',function(e){e.respondWith(caches.match(e.request).then(function(r){return r||fetch(e.request);}));});
