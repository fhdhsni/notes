// # registering service worker
export default function () {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").then((reg) => {
      /* eslint-disable no-param-reassign, indent */
      reg.onupdatefound = function () {
        const installingWorker = reg.installing;

        installingWorker.onstatechange = function () {
          switch (installingWorker.state) {
          case "installed":
            if (navigator.serviceWorker.controller) {
              console.log("New or updated content is available.");
            } else {
              console.log("Content is now available offline!");
              const div = document.createElement("div");

              div.innerHTML =
                "<div class=\"offline-available\">Calc is now available for offline usage.</div>";
              document.body.appendChild(div);
              setTimeout(() => {
                div.remove();
              }, 2000);
            }
            break;
          case "redundant":
            console.error("The installing service worker became redundant.");
            break;
          default:
            console.log("¯\\_(ツ)_/¯");
          }
        };
      };
    }).catch((e) => {
      console.error("Error during service worker registration:", e);
    });
  }
}

// ########################################### implementing sw.js
const CACHE_NAME = "v2";
const urlsToCache = [
  "/",
  "/app.js",
  "/index.html",
];

self.addEventListener("install", event => {
  console.log("[ServiceWorker] Installed");
  event.waitUntil(                  // waitUntil takes a promise
    caches.open(CACHE_NAME)     // it returns a promise.
      .then(cache => {
        console.log("[ServiceWorker] Caching urlsToCache");

        return cache.addAll(urlsToCache); // it returns a promise.
      })
  );
});

self.addEventListener("fetch", event => {
  console.log("[ServiceWorker] Fetching", event.request.url);

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          console.log("[ServiceWorker] Found in cache", event.request.url);
          console.log(response);

          return response;
        }
        // return fetch(event.request); // fetch returns a promise
        const fetchRequest = event.request.clone();
        return fetch(fetchRequest)
          .then((response) => {
            if (!response ||    // in these situations we don't wan't to cache it
                response.status !== 200 ||
                response.type !== "basic") { // Make sure the response type is basic, which indicates that it's a request from our origin. This means that requests to third party assets aren't cached as well.
                return response;
            }
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
      })
  );
});


/*
  # There will be a point in time where your service worker will need updating. When that time comes, you'll need to follow these steps:

  * Update your service worker JavaScript file. When the user navigates to your site, the browser tries to redownload the script file that defined the service worker in the background. If there is even a byte's difference in the service worker file compared to what it currently has, it considers it new.

  * Your new service worker will be started and the install event will be fired.

  * At this point the old service worker is still controlling the current pages so the new service worker will enter a waiting state.

  * When the currently open pages of your site are closed, the old service worker will be killed and the new service worker will take control.

  * Once your new service worker takes control, its activate event will be fired.
  */

self.addEventListener("activate", e => { // 
  console.log("[ServiceWorker] Activated");

  e.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(cacheNames.map(thisCacheName => { // Promise.all takes an array of promises
        if (thisCacheName !== CACHE_NAME) {
          console.log("[ServiceWorker] Removing Cached Files from", thisCacheName);

          return caches.delete(thisCacheName);
        }
      }));
    })
  );
});
