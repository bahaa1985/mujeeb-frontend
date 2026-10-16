import React, { lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import { useAuth } from "../context/AuthContext";

const LoginPage = lazy(() => import("../pages/Login").then((module) => ({ default: module.LoginPage })));
const DashboardPage = lazy(() => import("../pages/Dashboard").then((module) => ({ default: module.DashboardPage })));
const MessagesPage = lazy(() => import("../pages/Messages").then((module) => ({ default: module.MessagesPage })));
const UsersPage = lazy(() => import("../pages/Users").then((module) => ({ default: module.UsersPage })));
const UserPage = lazy(() => import("../pages/UserPage").then((module) => ({ default: module.UserPage })));
const InventoryPage = lazy(() => import("../pages/Inventory").then((module) => ({ default: module.InventoryPage })));
const NotificationsPage = lazy(() => import("../pages/Notifications"));
const AdminPharmacyPage = lazy(() => import("../pages/Pharmacy").then((module) => ({ default: module.PharmacyPage })));
const PharmacyPage = lazy(() => import("../pages/PharmacyPage").then((module) => ({ default: module.PharmacyPage })));
const SubscriptionsPage = lazy(() => import("../pages/Subscriptions").then((module) => ({ default: module.SubscriptionsPage })));
const NotFoundPage = lazy(() => import("../pages/NotFound").then((module) => ({ default: module.NotFoundPage })));

const RouteLoading: React.FC = () => (
  <div className="flex min-h-screen items-center justify-center" role="status" aria-label="Loading">
    <CircularProgress />
  </div>
);

/**
 * Protected route component
 * Redirects to login if user is not authenticated
 */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <RouteLoading />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

/**
 * App Router Configuration
 * Handles all routing and protected routes
 */
export const AppRouter: React.FC = () => {
  const { user } = useAuth();

  return (
    <Router>
      <Suspense fallback={<RouteLoading />}>
        <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route
          path="/users/:id"
          element={
            <ProtectedRoute>
              <UserPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        {user?.role_id === 1 && (
        <Route
            path="/pharmacies"
            element={
              <ProtectedRoute>
                <AdminPharmacyPage />
              </ProtectedRoute>
            }
          />
        )}
        <Route
          path="/pharmacy-settings"
          element={
            <ProtectedRoute>
              <PharmacyPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <MessagesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <UsersPage />
            </ProtectedRoute>
          }
        />
                <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory"
          element={
            <ProtectedRoute>
              <InventoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subscriptions"
          element={
            <ProtectedRoute>
              <SubscriptionsPage />
            </ProtectedRoute>
          }
        />

        {/* Fallback Routes */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </Router>
  );
};
