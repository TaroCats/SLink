import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Unlock from './pages/Unlock';
import Login from './pages/Login';
import Dashboard from './pages/admin/Dashboard';
import Links from './pages/admin/Links';
import LinkStats from './pages/admin/LinkStats';
import Domains from './pages/admin/Domains';
import Layout from './components/Layout';
import { useAuthStore, useUIStore } from './store';
import { useTranslation } from 'react-i18next';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  return isAuthenticated ? children : <Navigate to="/admin" />;
};

function App() {
  const { theme, lang } = useUIStore();
  const { i18n } = useTranslation();

  useEffect(() => {
    // Initial theme setup
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  useEffect(() => {
    i18n.changeLanguage(lang);
  }, [lang, i18n]);

  return (
    <Router>
      <div className="min-h-screen relative overflow-hidden bg-[#f5f5f7] dark:bg-[#000000] text-gray-900 dark:text-white transition-colors duration-300">
        {/* Global Liquid Background Blobs */}
        <div className="fixed top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-indigo-300/40 to-purple-300/40 dark:from-indigo-600/20 dark:to-purple-900/20 blur-[100px] pointer-events-none z-0" />
        <div className="fixed bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tl from-blue-300/40 to-cyan-300/40 dark:from-blue-800/20 dark:to-cyan-900/20 blur-[100px] pointer-events-none z-0" />
        
        <div className="relative z-10 w-full h-full min-h-screen overflow-y-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/unlock/:code" element={<Unlock />} />
            <Route path="/admin" element={<Login />} />
            <Route path="/admin/*" element={
              <PrivateRoute>
                <Layout>
                  <Routes>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="links" element={<Links />} />
                    <Route path="links/:id/stats" element={<LinkStats />} />
                    <Route path="domains" element={<Domains />} />
                  </Routes>
                </Layout>
              </PrivateRoute>
            } />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;