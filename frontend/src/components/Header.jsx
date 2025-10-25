// src/components/Header.jsx
import { theme } from '../config/theme';

const Header = () => {
  return (
    <header style={styles.header}>
      <div style={styles.logo}>
        <span style={styles.logoText}>SQLRunner</span>
      </div>
      <div style={styles.subtitle}>Online SQL Editor</div>
    </header>
  );
};

const styles = {
  header: {
    backgroundColor: theme.colors.secondary,
    padding: `${theme.spacing.md} ${theme.spacing.lg}`,
    borderBottom: `1px solid ${theme.colors.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  logoText: {
    fontSize: '20px',
    fontWeight: '600',
    color: theme.colors.accent,
    fontFamily: theme.fonts.primary,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: '14px',
    fontFamily: theme.fonts.primary,
  },
};

export default Header;
