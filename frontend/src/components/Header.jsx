import { theme } from '../config/theme';

const Header = ({ onHistoryToggle, showHistory }) => {
  return (
    <header style={styles.header}>
      <div style={styles.logo}>
        <span style={styles.logoText}>SQLRunner</span>
      </div>
      <div style={styles.rightSection}>
        <div style={styles.subtitle}>Online SQL Editor</div>
        <button 
          style={{
            ...styles.historyButton,
            ...(showHistory ? styles.historyButtonActive : {})
          }}
          onClick={onHistoryToggle}
        >
          History
        </button>
      </div>
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
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: '14px',
    fontFamily: theme.fonts.primary,
  },
  historyButton: {
    backgroundColor: theme.colors.primary,
    color: theme.colors.textSecondary,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.sm,
    padding: `${theme.spacing.xs} ${theme.spacing.md}`,
    fontSize: '13px',
    fontFamily: theme.fonts.primary,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  historyButtonActive: {
    backgroundColor: theme.colors.accent,
    color: '#ffffff',
    borderColor: theme.colors.accent,
  },
};

export default Header;