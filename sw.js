/**
 * Service Worker for 日本縦断チャレンジ
 * オフライン対応とキャッシュ管理
 */

const CACHE_NAME = 'japan-journey-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/app.js',
  '/js/storage.js',
  '/js/routes.js',
  '/js/map.js',
  '/js/achievements.js',
  '/js/charts.js',
  '/js/calendar.js',
  '/js/goals.js',
  '/js/theme.js',
  '/js/i18n.js',
  '/js/extended-achievements.js',
  '/js/multi-routes.js',
  '/js/social.js',
  '/manifest.json'
];

// インストール時にキャッシュ
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching assets');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// アクティベート時に古いキャッシュを削除
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

// フェッチ時のキャッシュ戦略（Cache First, Network Fallback）
self.addEventListener('fetch', (event) => {
  // Chrome拡張機能のリクエストは無視
  if (event.request.url.startsWith('chrome-extension://')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // キャッシュがある場合はそれを返し、バックグラウンドで更新
          event.waitUntil(
            fetch(event.request)
              .then((response) => {
                if (response && response.status === 200) {
                  const responseClone = response.clone();
                  caches.open(CACHE_NAME)
                    .then((cache) => cache.put(event.request, responseClone));
                }
              })
              .catch(() => {})
          );
          return cachedResponse;
        }
        
        // キャッシュがない場合はネットワークから取得
        return fetch(event.request)
          .then((response) => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            const responseClone = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => cache.put(event.request, responseClone));
            
            return response;
          })
          .catch(() => {
            // オフラインでHTMLリクエストの場合はindex.htmlを返す
            if (event.request.headers.get('accept')?.includes('text/html')) {
              return caches.match('/index.html');
            }
          });
      })
  );
});

// プッシュ通知（将来の拡張用）
self.addEventListener('push', (event) => {
  const options = {
    body: event.data?.text() || '今日も記録しましょう！',
    icon: '/assets/icon-192.png',
    badge: '/assets/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      { action: 'record', title: '記録する' },
      { action: 'close', title: '閉じる' }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('🗾 日本縦断チャレンジ', options)
  );
});

// 通知クリック
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'record') {
    event.waitUntil(
      clients.openWindow('/#record')
    );
  } else {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
