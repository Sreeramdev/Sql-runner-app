import { theme } from '../../config/theme';

const ResultsDisplay = ({ data, error, loading, rowCount, queryType }) => {
  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.message}>Executing query...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }

  if (queryType && ['INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'ALTER'].includes(queryType)) {
    return (
      <div style={styles.container}>
        {renderModificationMessage(queryType, rowCount)}
      </div>
    );
  }

  if (!data || data.length === 0) {
    if (rowCount === 0 && queryType === 'SELECT') {
      return (
        <div style={styles.container}>
          <div style={styles.info}>
            <strong>Query executed successfully</strong>
            <div style={styles.infoDetail}>No rows returned</div>
          </div>
        </div>
      );
    }

    return (
      <div style={styles.container}>
        <div style={styles.message}>Run a query to see results</div>
      </div>
    );
  }

  const columns = Object.keys(data[0]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.headerLabel}>Output</span>
        {rowCount !== null && rowCount !== undefined && (
          <span style={styles.rowCount}>{rowCount} row(s) returned</span>
        )}
      </div>
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col} style={styles.th}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx} style={idx % 2 === 0 ? styles.trEven : styles.trOdd}>
                {columns.map((col) => (
                  <td key={col} style={styles.td}>
                    {row[col] !== null ? String(row[col]) : 'NULL'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const renderModificationMessage = (queryType, rowCount) => {
  const count = rowCount || 0;

  let icon = '✓';
  let message = '';
  let detail = '';
  let isWarning = false;

  switch (queryType) {
    case 'INSERT':
      if (count === 0) {
        icon = '⚠';
        message = 'Insert executed but no rows were inserted';
        detail = 'This might indicate a constraint violation was silently handled or a trigger prevented the insert';
        isWarning = true;
      } else if (count === 1) {
        message = 'Row inserted successfully';
        detail = `${count} row inserted`;
      } else {
        message = 'Rows inserted successfully';
        detail = `${count} rows inserted`;
      }
      break;

    case 'UPDATE':
      if (count === 0) {
        icon = '⚠';
        message = 'Update executed but no rows were affected';
        detail = 'No rows matched the WHERE condition, or the new values were identical to existing values';
        isWarning = true;
      } else if (count === 1) {
        message = 'Row updated successfully';
        detail = `${count} row updated`;
      } else {
        message = 'Rows updated successfully';
        detail = `${count} rows updated`;
      }
      break;

    case 'DELETE':
      if (count === 0) {
        icon = '⚠';
        message = 'Delete executed but no rows were removed';
        detail = 'No rows matched the WHERE condition';
        isWarning = true;
      } else if (count === 1) {
        message = 'Row deleted successfully';
        detail = `${count} row deleted`;
      } else {
        message = 'Rows deleted successfully';
        detail = `${count} rows deleted`;
      }
      break;

    case 'CREATE':
      message = 'Object created successfully';
      detail = 'Table, index, or view has been created';
      break;

    case 'DROP':
      message = 'Object dropped successfully';
      detail = 'Table, index, or view has been removed';
      break;

    case 'ALTER':
      message = 'Table altered successfully';
      detail = 'Table structure has been modified';
      break;

    default:
      message = 'Query executed successfully';
      detail = count > 0 ? `${count} row(s) affected` : 'No rows affected';
  }

  const containerStyle = isWarning ? styles.warning : styles.success;

  return (
    <div style={containerStyle}>
      <strong>
        {icon} {message}
      </strong>
      {detail && <div style={styles.statusDetail}>{detail}</div>}
    </div>
  );
};

const styles = {
  container: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.colors.secondary,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    borderBottom: `1px solid ${theme.colors.border}`,
  },
  headerLabel: {
    color: theme.colors.textPrimary,
    fontSize: '14px',
    fontWeight: '600',
    fontFamily: theme.fonts.primary,
  },
  rowCount: {
    color: theme.colors.textMuted,
    fontSize: '12px',
    fontFamily: theme.fonts.primary,
  },
  tableWrapper: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontFamily: theme.fonts.mono,
    fontSize: '13px',
  },
  th: {
    backgroundColor: theme.colors.tertiary,
    color: theme.colors.textPrimary,
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    textAlign: 'left',
    borderBottom: `2px solid ${theme.colors.border}`,
    fontWeight: '600',
    position: 'sticky',
    top: 0,
  },
  td: {
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    color: theme.colors.textSecondary,
    borderBottom: `1px solid ${theme.colors.border}`,
  },
  trEven: {
    backgroundColor: theme.colors.secondary,
  },
  trOdd: {
    backgroundColor: theme.colors.primary,
  },
  message: {
    padding: theme.spacing.xl,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontFamily: theme.fonts.primary,
    fontSize: '14px',
  },
  error: {
    padding: theme.spacing.md,
    margin: theme.spacing.md,
    backgroundColor: `${theme.colors.error}20`,
    border: `1px solid ${theme.colors.error}`,
    borderRadius: theme.borderRadius.md,
    color: theme.colors.error,
    fontFamily: theme.fonts.primary,
    fontSize: '14px',
    lineHeight: '1.5',
  },
  success: {
    padding: theme.spacing.md,
    margin: theme.spacing.md,
    backgroundColor: '#10b98120',
    border: '1px solid #10b981',
    borderRadius: theme.borderRadius.md,
    color: '#10b981',
    fontFamily: theme.fonts.primary,
    fontSize: '14px',
    lineHeight: '1.5',
  },
  warning: {
    padding: theme.spacing.md,
    margin: theme.spacing.md,
    backgroundColor: '#f59e0b20',
    border: '1px solid #f59e0b',
    borderRadius: theme.borderRadius.md,
    color: '#f59e0b',
    fontFamily: theme.fonts.primary,
    fontSize: '14px',
    lineHeight: '1.5',
  },
  info: {
    padding: theme.spacing.md,
    margin: theme.spacing.md,
    backgroundColor: '#3b82f620',
    border: '1px solid #3b82f6',
    borderRadius: theme.borderRadius.md,
    color: '#3b82f6',
    fontFamily: theme.fonts.primary,
    fontSize: '14px',
    lineHeight: '1.5',
  },
  statusDetail: {
    marginTop: theme.spacing.xs,
    fontSize: '13px',
    opacity: 0.9,
  },
  infoDetail: {
    marginTop: theme.spacing.xs,
    fontSize: '13px',
    opacity: 0.9,
  },
};

export default ResultsDisplay;
