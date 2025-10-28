import { theme } from '../../config/theme';

const Toolbar = ({ onRunQuery, loading }) => {
  return (
    <div style={styles.toolbar}>
      <div style={styles.leftSection}>
        <span style={styles.label}>Input</span>
      </div>
      <div style={styles.rightSection}>
        <button
          style={{
            ...styles.button,
            ...(loading ? styles.buttonDisabled : {}),
          }}
          onClick={onRunQuery}
          disabled={loading}
        >
          {loading ? 'Running...' : 'Run SQL'}
        </button>
      </div>
    </div>
  );
};

const styles = {
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    backgroundColor: theme.colors.secondary,
    borderBottom: `1px solid ${theme.colors.border}`,
  },
  leftSection: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  label: {
    color: theme.colors.textPrimary,
    fontSize: '14px',
    fontWeight: '600',
    fontFamily: theme.fonts.primary,
  },
  rightSection: {
    display: 'flex',
    gap: theme.spacing.sm,
  },
  button: {
    padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
    backgroundColor: theme.colors.accent,
    color: 'white',
    border: 'none',
    borderRadius: theme.borderRadius.sm,
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: theme.fonts.primary,
    transition: 'background-color 0.2s',
  },
  buttonDisabled: {
    backgroundColor: theme.colors.borderLight,
    cursor: 'not-allowed',
  },
};

export default Toolbar;
