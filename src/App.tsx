import { useEffect } from "react";
import { AuthProvider } from "./context/AuthProvider";
import { AppRouter } from "./app/router";
import { ToastProvider } from "./context/ToastProvider";
import { PharmacyProvider } from "./context/PharmacyProvider";
import { LanguageProvider } from "./context/LanguageProvider";
import { ThemeProvider } from "./context/ThemeContext";
import { NotificationsProvider } from "./context/NotificationsProvider";
import { listenForForegroundMessages } from "./utils/firebase-client";
import { useAuth } from "./context/AuthContext";

function AppContent() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div
        className="min-h-screen bg-slate-950 bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: "url('/mujeeb-splashscreen.jfif')" }}
      >
        <div className="absolute inset-0 bg-slate-950/35" />
        <img src="/mujeeb-navbar-ldark.png" alt="Mujeeb" className="relative w-72 max-w-[80vw]" />
      </div>
    );
  }

  return (
    <NotificationsProvider>
      <PharmacyProvider>
        <LanguageProvider>
          <AppRouter />
        </LanguageProvider>
      </PharmacyProvider>
    </NotificationsProvider>
  );
}

function App() {
  useEffect(()=>{
    listenForForegroundMessages();
  },[])
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;

