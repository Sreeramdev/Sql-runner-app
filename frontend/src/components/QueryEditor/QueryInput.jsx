// src/components/QueryEditor/QueryInput.jsx
import { theme } from '../../config/theme';

const QueryInput = ({ value, onChange, placeholder }) => {
  return (
    <textarea
      style={styles.textarea}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      spellCheck="false"
    />
  );
};

const styles = {
  textarea: {
    width: '100%',
    height: '100%',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    color: theme.colors.textPrimary,
    border: 'none',
    outline: 'none',
    resize: 'none',
    fontFamily: theme.fonts.mono,
    fontSize: '14px',
    lineHeight: '1.6',
  },
};

export default QueryInput;
