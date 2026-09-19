// firebase-messaging-sw.js
importScripts("https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js");

firebase.initializeApp({
 apiKey: "AIzaSyC1bL-zEcs8FxKj_xpqnKgwE_v4V8e-1kY",
  authDomain: "studio-8376500433-f045d.firebaseapp.com",
  projectId: "studio-8376500433-f045d",
  storageBucket: "studio-8376500433-f045d.firebasestorage.app",
  messagingSenderId: "811584914377",
  appId: "1:811584914377:web:788ec1393b438e1790de18"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log("Message received in background:", payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/logo.png" // مسار اللوجو بتاعك
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});