importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: "AIzaSyDs5rLsYRJO14PZcA8uEXcv_Zc76-bYmFU",
  authDomain: "nexus-escolar-efe32.firebaseapp.com",
  projectId: "nexus-escolar-efe32",
  storageBucket: "nexus-escolar-efe32.firebasestorage.app",
  messagingSenderId: "448993774577",
  appId: "1:448993774577:web:5aeaced71ababa66e09250"
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification

  self.registration.showNotification(title, {
    body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
  })
})