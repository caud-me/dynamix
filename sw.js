/* sw.js - service worker for dynamix offline cache and auto-refresh */

/* constants */
const CACHE_NAME = "dynamix-v8";
const CACHE_RECENT_MS = 120000;
const CORE_ASSETS = [
    "./",
    "./index.html",
    "./manifest.json",
    "./components/style.css",
    "./components/responsive-experimental.css",
    "./components/distortion-wave.css",
    "./components/distortion-wave.js",
    "./components/components.js",
    "./css/dynamix-ext.css",
    "./js/decks.js",
    "./js/sound.js",
    "./js/storage.js",
    "./js/engine.js",
    "./js/components/home.js",
    "./js/components/deck.js",
    "./js/components/game.js",
    "./js/components/settings.js",
    "./js/app.js",
    "./assets/fonts/SegoeIcons.ttf",
    "./assets/icons/dynamix.svg",
    "./assets/icons/icon.svg",
    "./assets/icons/icon-192.png",
    "./assets/icons/icon-512.png"
];

let lastCacheRefreshTime = Date.now();

/* install: precache all core assets */
self.addEventListener("install", function (event) {
    const installTask = caches.open(CACHE_NAME).then(function (cache) {
        return cache.addAll(CORE_ASSETS);
    }).then(function () {
        return self.skipWaiting();
    });
    event.waitUntil(installTask);
});

/* activate: remove old caches and take control */
self.addEventListener("activate", function (event) {
    const activateTask = caches.keys().then(function (keys) {
        const deletions = [];
        for (let i = 0; i < keys.length; i += 1) {
            const key = keys[i];
            if (key !== CACHE_NAME) {
                const delPromise = caches.delete(key);
                deletions.push(delPromise);
            }
        }
        return Promise.all(deletions);
    }).then(function () {
        return self.clients.claim();
    });
    event.waitUntil(activateTask);
});

/* fetch: network-first for manifest/sw, stale-while-revalidate for assets */
self.addEventListener("fetch", function (event) {
    if (event.request.method !== "GET") {
        return;
    }
    const url = new URL(event.request.url);
    const isHttp = url.protocol.startsWith("http");
    if (!isHttp) {
        return;
    }

    const isNavigate = event.request.mode === "navigate";
    if (isNavigate) {
        // ive looked up on the internet on this one, navigate fallback return cached index page when offline
        const navTask = fetch(event.request).then(function (netRes) {
            if (netRes && netRes.status === 200) {
                const cloneRes = netRes.clone();
                caches.open(CACHE_NAME).then(function (cache) {
                    cache.put("./index.html", cloneRes);
                });
            }
            return netRes;
        }).catch(function () {
            return caches.open(CACHE_NAME).then(function (cache) {
                return cache.match("./index.html").then(function (pageRes) {
                    if (pageRes) {
                        return pageRes;
                    }
                    return cache.match("./");
                });
            });
        });
        event.respondWith(navTask);
        return;
    }

    const isManifest = url.pathname.endsWith("manifest.json");
    const isSw = url.pathname.endsWith("sw.js");
    if (isManifest || isSw) {
        const netFirst = fetch(event.request).then(function (netRes) {
            if (netRes && netRes.status === 200) {
                const cloneRes = netRes.clone();
                caches.open(CACHE_NAME).then(function (cache) {
                    cache.put(event.request, cloneRes);
                });
            }
            return netRes;
        }).catch(function () {
            return caches.match(event.request);
        });
        event.respondWith(netFirst);
        return;
    }

    const swrTask = caches.open(CACHE_NAME).then(function (cache) {
        return cache.match(event.request).then(function (cachedRes) {
            const netFetch = fetch(event.request).then(function (netRes) {
                if (netRes && netRes.status === 200 && netRes.type === "basic") {
                    const cloneRes = netRes.clone();
                    cache.put(event.request, cloneRes);
                }
                return netRes;
            }).catch(function () {
                return cachedRes;
            });
            return cachedRes || netFetch;
        });
    });
    event.respondWith(swrTask);
});

/* message bridge for manual and online cache refresh */
self.addEventListener("message", function (event) {
    if (!event.data) {
        return;
    }
    const msgType = event.data.type;

    if (msgType === "REFRESH_CACHE") {
        caches.open(CACHE_NAME).then(function (cache) {
            const tasks = [];
            for (let i = 0; i < CORE_ASSETS.length; i += 1) {
                const asset = CORE_ASSETS[i];
                const fetchTask = fetch(asset, { cache: "reload" }).then(function (res) {
                    if (res && res.status === 200) {
                        return cache.put(asset, res);
                    }
                    return null;
                }).catch(function () {
                    return null;
                });
                tasks.push(fetchTask);
            }
            return Promise.all(tasks).then(function () {
                lastCacheRefreshTime = Date.now();
                return self.clients.matchAll();
            }).then(function (clients) {
                for (let j = 0; j < clients.length; j += 1) {
                    clients[j].postMessage({
                        type: "CACHE_STATUS",
                        refreshed: true,
                        timestamp: lastCacheRefreshTime
                    });
                }
            });
        });
        return;
    }

    if (msgType === "CHECK_CACHE") {
        const elapsed = Date.now() - lastCacheRefreshTime;
        const isRecent = elapsed < CACHE_RECENT_MS;
        if (event.source) {
            event.source.postMessage({
                type: "CACHE_STATUS",
                refreshed: isRecent,
                timestamp: lastCacheRefreshTime
            });
        }
    }
});
