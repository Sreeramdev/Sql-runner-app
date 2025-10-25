// src/config/theme.js
export const theme = {
  colors: {
    // Main background colors
    primary: '#1a1d29',
    secondary: '#252936',
    tertiary: '#2d3142',

    // Accent colors
    accent: '#4f7cff',
    accentHover: '#6b8fff',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',

    // Text colors
    textPrimary: '#e5e7eb',
    textSecondary: '#9ca3af',
    textMuted: '#6b7280',

    // Border colors
    border: '#374151',
    borderLight: '#4b5563',

    // Syntax highlighting
    syntaxKeyword: '#c678dd',
    syntaxString: '#98c379',
    syntaxNumber: '#d19a66',
    syntaxComment: '#5c6370',
    syntaxFunction: '#61afef',
  },

  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },

  fonts: {
    primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: '"Fira Code", "Cascadia Code", Consolas, Monaco, monospace',
  },

  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
  },

  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.4)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
  }
};
