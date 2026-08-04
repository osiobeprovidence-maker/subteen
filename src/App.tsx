import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Home } from './pages/Home';
import { ArticlePage } from './pages/ArticlePage';
import { GameHub } from './pages/GameHub';
import { AdminCMS } from './pages/AdminCMS';
import { AuthorProfile } from './pages/AuthorProfile';
import { CategoryPage } from './pages/CategoryPage';
import { UserProfile } from './pages/UserProfile';
import { Bookmarks } from './pages/Bookmarks';
import { ReadingHistory } from './pages/History';
import { EditorStudio } from './pages/EditorStudio';
import { AdminPanel } from './pages/AdminPanel';
import { ArticleEditor } from './pages/ArticleEditor';
import { Auth } from './pages/Auth';
import { Onboarding } from './pages/Onboarding';
import { Forbidden } from './pages/Forbidden';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
      <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5] selection:bg-[#B8FF4D] selection:text-black">
        <ScrollToTop />
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/article/:slug" element={<ArticlePage />} />
            <Route path="/game/:id" element={<GameHub />} />
            <Route path="/author/:id" element={<AuthorProfile />} />
            <Route path="/category/:category" element={<CategoryPage />} />
            <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
            <Route path="/bookmarks" element={<ProtectedRoute><Bookmarks /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><ReadingHistory /></ProtectedRoute>} />
            <Route path="/editor/new" element={<ProtectedRoute roles={['editor', 'admin', 'super_admin']}><ArticleEditor /></ProtectedRoute>} />
            <Route path="/editor/edit/:id" element={<ProtectedRoute roles={['editor', 'admin', 'super_admin']}><ArticleEditor /></ProtectedRoute>} />
            <Route path="/editor/*" element={<ProtectedRoute roles={['editor', 'admin', 'super_admin']}><EditorStudio /></ProtectedRoute>} />
            <Route path="/admin/*" element={<ProtectedRoute roles={['admin', 'super_admin']}><AdminPanel /></ProtectedRoute>} />
            <Route path="/signin" element={<Auth />} />
            <Route path="/signup" element={<Auth />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/403" element={<Forbidden />} />
          </Routes>
        </main>
        <Footer />
      </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
