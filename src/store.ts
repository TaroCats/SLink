import { create } from 'zustand';

interface AuthState {
  token: string | null;
  setToken: (token: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem('token'),
  setToken: (token: string) => {
    localStorage.setItem('token', token);
    set({ token });
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ token: null });
  },
  isAuthenticated: () => !!get().token,
}));

interface UIState {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  lang: string;
  setLang: (lang: string) => void;
}

const getSystemTheme = () => 
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

export const useUIStore = create<UIState>((set) => ({
  theme: (localStorage.getItem('slink-theme') as any) || 'system',
  setTheme: (theme) => {
    localStorage.setItem('slink-theme', theme);
    set({ theme });
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    if (theme === 'system') {
      root.classList.add(getSystemTheme());
    } else {
      root.classList.add(theme);
    }
  },
  lang: localStorage.getItem('slink-lang') || 'zh',
  setLang: (lang) => {
    localStorage.setItem('slink-lang', lang);
    set({ lang });
  }
}));
