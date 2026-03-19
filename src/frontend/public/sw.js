self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Farminder Reminder';
  const options = {
    body: data.body || 'You have fertilizer tasks today!',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'farminder-daily',
    renotify: true,
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, body } = event.data;
    self.registration.showNotification(title || 'Farminder Reminder', {
      body: body || 'You have fertilizer tasks today!',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'farminder-daily',
      renotify: true,
    });
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('/');
    })
  );
});
