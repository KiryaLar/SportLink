import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Loader } from './components/common/Loader';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { useAuthStore } from './store/auth.store';

// Lazy load pages
const RegisterPage = React.lazy(() => import('./pages/RegisterPage').then(module => ({ default: module.RegisterPage })));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage').then(module => ({ default: module.ProfilePage })));
const MatchesPage = React.lazy(() => import('./pages/MatchesPage').then(module => ({ default: module.MatchesPage })));
const MatchCreatePage = React.lazy(() => import('./pages/MatchCreatePage').then(module => ({ default: module.MatchCreatePage })));
const MatchDetailPage = React.lazy(() => import('./pages/MatchDetailPage').then(module => ({ default: module.MatchDetailPage })));
const PlacesPage = React.lazy(() => import('./pages/PlacesPage').then(module => ({ default: module.PlacesPage })));
const PlayersPage = React.lazy(() => import('./pages/PlayersPage').then(module => ({ default: module.PlayersPage })));
const ChatsPage = React.lazy(() => import('./pages/ChatsPage').then(module => ({ default: module.ChatsPage })));
const NotificationsPage = React.lazy(() => import('./pages/NotificationsPage').then(module => ({ default: module.NotificationsPage })));
const AdminPage = React.lazy(() => import('./pages/AdminPage').then(module => ({ default: module.AdminPage })));
const ReviewsPage = React.lazy(() => import('./pages/ReviewsPage').then(module => ({ default: module.ReviewsPage })));

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

export const App: React.FC = () => {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout>
                    <HomePage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ProfilePage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/matches"
              element={
                <ProtectedRoute>
                  <Layout>
                    <MatchesPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/matches/create"
              element={
                <ProtectedRoute>
                  <Layout>
                    <MatchCreatePage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/matches/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <MatchDetailPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/places"
              element={
                <ProtectedRoute>
                  <Layout>
                    <PlacesPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/players"
              element={
                <ProtectedRoute>
                  <Layout>
                    <PlayersPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/chats"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ChatsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <Layout>
                    <NotificationsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/reviews/:userId"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ReviewsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <Layout>
                    <AdminPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
    </ThemeProvider>
  );
};

export default App;
