import { defaultCache } from "@serwist/next/worker";
import { NetworkFirst } from "serwist";

// This is a basic service worker that will be expanded upon.
const revision = self.__SW_MANIFEST;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(defaultCache).then((cache) => {
      return cache.addAll(
        revision
          .filter((r) => r.url.startsWith("/_next/static"))
          .map((r) => r.url)
      );
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      new NetworkFirst({
        cacheName: "navigations",
      }).handle(event)
    );
  }
});
