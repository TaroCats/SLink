import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Unlock from './pages/Unlock';
import Login from './pages/Login';
import Dashboard from './pages/admin/Dashboard';
import Links from './pages/admin/Links';
import LinkStats from './pages/admin/LinkStats';
import Domains from './pages/admin/Domains';
import Settings from './pages/admin/Settings';
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
      <div className="min-h-screen relative overflow-hidden bg-[#f2f2f7] dark:bg-[#050505] text-gray-900 dark:text-white transition-colors duration-700 ease-apple">
        
        {/* Elegant Apple-style Mesh Gradient Background */}
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-[-50%] animate-rotateMesh opacity-60 dark:opacity-90">
            <div className="absolute top-[20%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-accent-cyan mix-blend-normal blur-[100px] sm:blur-[140px] opacity-40 dark:opacity-25" />
            <div className="absolute top-[40%] right-[20%] w-[45vw] h-[45vw] rounded-full bg-accent-blue mix-blend-normal blur-[100px] sm:blur-[140px] opacity-40 dark:opacity-25" />
            <div className="absolute bottom-[20%] left-[40%] w-[60vw] h-[60vw] rounded-full bg-accent-purple mix-blend-normal blur-[120px] sm:blur-[160px] opacity-30 dark:opacity-15" />
          </div>
          
          {/* Extremely subtle noise overlay for premium texture (drastically reduced in dark mode) */}
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.015] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'1.2\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>
        </div>
        
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
                    <Route path="settings" element={<Settings />} />
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
