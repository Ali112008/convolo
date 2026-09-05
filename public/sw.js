/* Convolo PWA shell and best-effort local reminder worker. */
const CACHE_NAME = "convolo-shell-v1";
const APP_SHELL = [
  "/",
  "/app",
  "/app/plan",
  "/app/practice",
  "/app/vocabulary",
  "/app/progress",
  "/app/settings",
];
const REMINDER_DB = "convolo-pwa-preferences-v1";
const REMINDER_STORE = "preferences";
const REMINDER_KEY = "review-reminder";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await Promise.allSettled(APP_SHELL.map((path) => cache.add(path)));
      await self.skipWaiting();
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          void caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(
          async () =>
            (await caches.match(request)) ||
            (await caches.match("/app")) ||
            (await caches.match("/")) ||
            new Response("Convolo is offline. Reconnect to continue.", {
              status: 503,
              headers: { "Content-Type": "text/plain; charset=utf-8" },
            })
        )
    );
    return;
  }

  if (
    url.pathname.startsWith("/_next/") ||
    url.pathname === "/icon.svg" ||
    url.pathname === "/icon-192.png" ||
    url.pathname === "/icon-512.png"
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request)
          .then((response) => {
            if (response.ok) {
              const copy = response.clone();
              void caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            }
            return response;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
  }
});

self.addEventListener("message", (event) => {
  const message = event.data;
  if (!message || typeof message !== "object") return;

  if (message.type === "CONVOLO_REMINDER_PREFERENCE") {
    event.waitUntil(saveReminderPreference(message.preference));
  }

  if (message.type === "CONVOLO_TEST_REMINDER") {
    event.waitUntil(
      self.registration.showNotification("Convolo review reminder", {
        body: "Your next useful phrase is ready for a quick recall.",
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        tag: "convolo-test-reminder",
        renotify: true,
        data: { url: "/app/vocabulary" },
      })
    );
  }
});

self.addEventListener("periodicsync", (event) => {
  if (event.tag === "convolo-review-reminder") {
    event.waitUntil(showScheduledReminderIfNeeded());
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(self.clients.openWindow(event.notification.data?.url || "/app/vocabulary"));
});

function openReminderDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(REMINDER_DB, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(REMINDER_STORE)) {
        request.result.createObjectStore(REMINDER_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveReminderPreference(preference) {
  const database = await openReminderDatabase();
  await new Promise((resolve, reject) => {
    const transaction = database.transaction(REMINDER_STORE, "readwrite");
    transaction.objectStore(REMINDER_STORE).put(preference, REMINDER_KEY);
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
  });
  database.close();
}

async function readReminderPreference() {
  const database = await openReminderDatabase();
  const preference = await new Promise((resolve, reject) => {
    const transaction = database.transaction(REMINDER_STORE, "readonly");
    const request = transaction.objectStore(REMINDER_STORE).get(REMINDER_KEY);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
  database.close();
  return preference;
}

function localDayKey(date) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
}

async function showScheduledReminderIfNeeded() {
  const preference = await readReminderPreference();
  if (!preference?.enabled || typeof preference.preferredTime !== "string") return;

  const now = new Date();
  const [hour, minute] = preference.preferredTime.split(":").map(Number);
  const scheduledTime = new Date(now);
  scheduledTime.setHours(hour, minute, 0, 0);
  const today = localDayKey(now);
  if (now < scheduledTime || preference.lastShownDate === today) return;

  await self.registration.showNotification("Time for a Convolo review", {
    body: "A short recall now makes tomorrow’s conversation easier.",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag: "convolo-review-reminder",
    data: { url: "/app/vocabulary" },
  });
  await saveReminderPreference({ ...preference, lastShownDate: today });
}
