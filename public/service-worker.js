const CACHE_NAME = 'calculate-competition-v3';
const BASE_PATH = '/calculate-competition';

const urlsToCache = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/css/style.css`,
  `${BASE_PATH}/css/competition.css`,
  `${BASE_PATH}/js/main.js`,
  `${BASE_PATH}/js/select-user.js`,
  `${BASE_PATH}/js/practice.js`,
  `${BASE_PATH}/js/calendar.js`,
  `${BASE_PATH}/js/stats.js`,
  `${BASE_PATH}/js/competition-setup.js`,
  `${BASE_PATH}/js/competition-play.js`,
  `${BASE_PATH}/js/competition-records.js`,
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Cache installation failed:', error);
      })
  );
  self.skipWaiting();
});

// // Fetch event - serve from cache, fallback to network
// self.addEventListener('fetch', (event) => {
//   const requestUrl = new URL(event.request.url);
  
//   // 跳过所有 API 请求，直接从网络获取
//   if (requestUrl.pathname.includes('/api/')) {
//     event.respondWith(fetch(event.request));
//     return;
//   }
  
//   event.respondWith(
//     caches.match(event.request)
//       .then((response) => {
//         // Cache hit - return response
//         if (response) {
//           return response;
//         }

//         // Clone the request
//         const fetchRequest = event.request.clone();

//         return fetch(fetchRequest).then((response) => {
//           // Check if valid response
//           if (!response || response.status !== 200 || response.type !== 'basic') {
//             return response;
//           }

//           // Clone the response
//           const responseToCache = response.clone();

//           // Only cache GET requests (excluding API calls)
//           if (event.request.method === 'GET') {
//             caches.open(CACHE_NAME)
//               .then((cache) => {
//                 cache.put(event.request, responseToCache);
//               });
//           }

//           return response;
//         }).catch((error) => {
//           console.error('Fetch failed:', error);
//           // You could return a custom offline page here
//         });
//       })
//   );
// });

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});
