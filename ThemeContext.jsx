import React, { createContext, useContext, useState, useEffect } from 'react';

const THEME_KEY = 'bookie_theme';

// Theme definitions
export const themes = {
  dark: {
    name: 'dark',
    bg: '#0a0a0f',
    bgSecondary: '#1a1a2e',
    bgTertiary: '#12121f',
    text: '#fff',
    textSecondary: '#9ca3af',
    textMuted: '#6b7280',
    border: '#333',
    accent: '#00D4FF',
    success: '#00FF88',
    warning: '#FFD700',
    error: '#FF4444'
  },
  light: {
    name: 'light',
    bg: '#f5f5f7',
    bgSecondary: '#ffffff',
    bgTertiary: '#e8e8ed',
    text: '#1a1a2e',
    textSecondary: '#4b5563',
    textMuted: '#6b7280',
    border: '#d1d5db',
    accent: '#0099cc',
    success: '#00aa55',
    warning: '#cc9900',
    error: '#cc3333'
  }
};

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [themeName, setThemeName] = useState(() => {
    try {
      return localStorage.getItem(THEME_KEY) || 'dark';
    } catch {
      return 'dark';
    }
  });

  const theme = themes[themeName] || themes.dark;

  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, themeName);
    } catch {
      // Ignore
    }
    // Update CSS variables for global access
    document.documentElement.style.setProperty('--bg', theme.bg);
    document.documentElement.style.setProperty('--bg-secondary', theme.bgSecondary);
    document.documentElement.style.setProperty('--bg-tertiary', theme.bgTertiary);
    document.documentElement.style.setProperty('--text', theme.text);
    document.documentElement.style.setProperty('--text-secondary', theme.textSecondary);
    document.documentElement.style.setProperty('--border', theme.border);
    document.documentElement.style.setProperty('--accent', theme.accent);
  }, [themeName, theme]);

  const toggleTheme = () => {
    setThemeName(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const setTheme = (name) => {
    if (themes[name]) {
      setThemeName(name);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, themeName, toggleTheme, setTheme, isDark: themeName === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    // Return default theme if not in provider
    return { theme: themes.dark, themeName: 'dark', toggleTheme: () => {}, isDark: true };
  }
  return context;
};

// Theme toggle button component
export const ThemeToggle = ({ style = {} }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      style={{
        padding: '8px 12px',
        backgroundColor: 'transparent',
        border: '1px solid var(--border, #333)',
        borderRadius: '8px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        color: 'var(--text-secondary, #9ca3af)',
        fontSize: '13px',
        transition: 'all 0.2s',
        ...style
      }}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span style={{ fontSize: '16px' }}>{isDark ? '☀️' : '🌙'}</span>
      <span>{isDark ? 'Light' : 'Dark'}</span>
    </button>
  );
};

export default ThemeContext;
