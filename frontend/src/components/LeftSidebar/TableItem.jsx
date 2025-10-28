import { useState } from 'react';
import { theme } from '../../config/theme';

const TableItem = ({ tableName, columns, onTableClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header} onClick={handleToggle}>
        <span style={styles.icon}>{isExpanded ? '▼' : '▶'}</span>
        <span
          style={styles.tableName}
          onClick={(e) => {
            e.stopPropagation();
            onTableClick(tableName);
          }}
        >
          {tableName}
        </span>
      </div>

      {isExpanded && columns && (
        <div style={styles.columnList}>
          {columns.map((col, idx) => (
            <div key={idx} style={styles.columnItem}>
              <span style={styles.columnName}>{col.name}</span>
              <span style={styles.columnType}>{col.type}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    marginBottom: theme.spacing.xs,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing.sm,
    cursor: 'pointer',
    borderRadius: theme.borderRadius.sm,
    transition: 'background-color 0.2s',
  },
  icon: {
    color: theme.colors.textMuted,
    fontSize: '10px',
    marginRight: theme.spacing.sm,
    width: '12px',
  },
  tableName: {
    color: theme.colors.textPrimary,
    fontSize: '14px',
    fontFamily: theme.fonts.primary,
    flex: 1,
  },
  columnList: {
    marginLeft: theme.spacing.lg,
    paddingLeft: theme.spacing.sm,
    borderLeft: `1px solid ${theme.colors.border}`,
  },
  columnItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    fontSize: '12px',
  },
  columnName: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.mono,
  },
  columnType: {
    color: theme.colors.textMuted,
    fontSize: '11px',
    fontFamily: theme.fonts.mono,
  },
};

export default TableItem;
