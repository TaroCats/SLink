import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/admin/Dashboard';
import Links from './pages/admin/Links';
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
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Login />} />
        <Route path="/admin/*" element={
          <PrivateRoute>
            <Layout>
              <Routes>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="links" element={<Links />} />
                <Route path="domains" element={<Domains />} />
              </Routes>
            </Layout>
          </PrivateRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;