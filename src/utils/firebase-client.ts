import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { userAPI } from "../api/userAPI";

// الكونفيج ده بتجيبه من إعدادات مشروعك في Firebase (Project Settings -> General)
// ده غير ملف الـ JSON بتاع الباك اند، دي المفاتيح العامة
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_apikey as string,
  authDomain: import.meta.env.VITE_authDomain,
  projectId: import.meta.env.VITE_FIREBASE_projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_appId
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

// الدالة دي هتستدعيها أول ما المستخدم يسجل دخول أو يفتح التطبيق
export const requestNotificationPermission = async (userId: number) => {
  try {
    console.log("Requesting notification permission...");
    const permission = await Notification.requestPermission();
    
    if (permission === "granted") {
      // 1. توليد التوكن
      const currentToken = await getToken(messaging, { 
        // الـ vapidKey بتجيبه من Firebase -> Project Settings -> Cloud Messaging -> Web configuration
        vapidKey: "BDSMcNqTXN6hByLTFNVGXr4lLRcbuYC3yDwMl-j5cZRKEWp5hD6jD8m3rhPHPF3oxpeXAYuyKqzX_g3b5sbkyAc" 
      });

      if (currentToken) {
        console.log("FCM Token generated:", currentToken);
        
        // 2. هنا بنستخدم الـ API اللي عملناها في الخطوة التالتة!
        await userAPI.updateFcmToken({
          userId: userId,
          fcmToken: currentToken
        });
        
        console.log("Token sent to backend successfully.");
      }
    } else {
      console.log("Notification permission denied.");
    }
  } catch (error) {
    console.error("Error getting notification permission:", error);
  }
};

// 3. الاستماع للإشعارات والتطبيق مفتوح (Foreground)
export const listenForForegroundMessages = () => {
  onMessage(messaging, (payload) => {
    console.log("Message received in foreground:", payload);
    
    // تشغيل ملف صوتي
    const audio = new Audio('/notification-sound.mp3'); // مسار ملف الصوت في الـ public فولدر
    audio.play().catch(e => console.log("Audio play blocked by browser:", e));

    // إظهار الإشعار المرئي (Toast أو Notification عادي)
    new Notification(payload.notification?.title || "إشعار جديد", {
      body: payload.notification?.body,
      silent:true,
      icon: "/pwa-192.png",
    });
  });
};