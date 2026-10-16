import { useEffect } from "react";
import { AuthProvider } from "./context/AuthProvider";
import { AppRouter } from "./app/router";
import { ToastProvider } from "./context/ToastProvider";
import { PharmacyProvider } from "./context/PharmacyProvider";
import { LanguageProvider } from "./context/LanguageProvider";
import { ThemeProvider } from "./context/ThemeContext";
import { NotificationsProvider } from "./context/NotificationsProvider";
import { useAuth } from "./context/AuthContext";

function AppContent() {
  const { user } = useAuth();
  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;
    let active = true;
    let unsubscribe: (() => void) | undefined;

    void import("./utils/firebase-client").then(({ listenForForegroundMessages }) => {
      if (active) unsubscribe = listenForForegroundMessages();
    }).catch((error: unknown) => console.error("Failed to initialize foreground notifications:", error));

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [userId]);

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
