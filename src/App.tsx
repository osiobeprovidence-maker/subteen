import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Home } from './pages/Home';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

const ArticlePage = lazy(() => import('./pages/ArticlePage').then((m) => ({ default: m.ArticlePage })));
const GameHub = lazy(() => import('./pages/GameHub').then((m) => ({ default: m.GameHub })));
const AdminCMS = lazy(() => import('./pages/AdminCMS').then((m) => ({ default: m.AdminCMS })));
const AuthorProfile = lazy(() => import('./pages/AuthorProfile').then((m) => ({ default: m.AuthorProfile })));
const CategoryPage = lazy(() => import('./pages/CategoryPage').then((m) => ({ default: m.CategoryPage })));
const PidginPage = lazy(() => import('./pages/PidginPage').then((m) => ({ default: m.PidginPage })));
const UserProfile = lazy(() => import('./pages/UserProfile').then((m) => ({ default: m.UserProfile })));
const Bookmarks = lazy(() => import('./pages/Bookmarks').then((m) => ({ default: m.Bookmarks })));
const ReadingHistory = lazy(() => import('./pages/History').then((m) => ({ default: m.ReadingHistory })));
const EditorStudio = lazy(() => import('./pages/EditorStudio').then((m) => ({ default: m.EditorStudio })));
const AdminPanel = lazy(() => import('./pages/AdminPanel').then((m) => ({ default: m.AdminPanel })));
const ArticleEditor = lazy(() => import('./pages/ArticleEditor').then((m) => ({ default: m.ArticleEditor })));
const NewsAutomation = lazy(() => import('./pages/NewsAutomation').then((m) => ({ default: m.NewsAutomation })));
const Auth = lazy(() => import('./pages/Auth').then((m) => ({ default: m.Auth })));
const Onboarding = lazy(() => import('./pages/Onboarding').then((m) => ({ default: m.Onboarding })));
const Forbidden = lazy(() => import('./pages/Forbidden').then((m) => ({ default: m.Forbidden })));

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const Fallback = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-[#B8FF4D] border-t-transparent rounded-full animate-spin" />
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
      <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5] selection:bg-[#B8FF4D] selection:text-black">
        <ScrollToTop />
        <Navbar />
        <main>
          <Suspense fallback={<Fallback />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/article/:slug" element={<ArticlePage />} />
              <Route path="/game/:id" element={<GameHub />} />
              <Route path="/author/:id" element={<AuthorProfile />} />
              <Route path="/category/:category" element={<CategoryPage />} />
              <Route path="/pidgin" element={<PidginPage />} />
              <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
              <Route path="/bookmarks" element={<ProtectedRoute><Bookmarks /></ProtectedRoute>} />
              <Route path="/history" element={<ProtectedRoute><ReadingHistory /></ProtectedRoute>} />
              <Route path="/editor/new" element={<ProtectedRoute roles={['editor', 'admin', 'super_admin']}><ArticleEditor /></ProtectedRoute>} />
              <Route path="/editor/edit/:id" element={<ProtectedRoute roles={['editor', 'admin', 'super_admin']}><ArticleEditor /></ProtectedRoute>} />
              <Route path="/editor/*" element={<ProtectedRoute roles={['editor', 'admin', 'super_admin']}><EditorStudio /></ProtectedRoute>} />
              <Route path="/admin/automation/*" element={<ProtectedRoute roles={['editor', 'admin', 'super_admin']}><NewsAutomation /></ProtectedRoute>} />
              <Route path="/admin/*" element={<ProtectedRoute roles={['admin', 'super_admin']}><AdminPanel /></ProtectedRoute>} />
              <Route path="/signin" element={<Auth />} />
              <Route path="/signup" element={<Auth />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/403" element={<Forbidden />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
