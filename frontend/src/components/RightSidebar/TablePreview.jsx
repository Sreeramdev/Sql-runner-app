// src/components/RightSidebar/TablePreview.jsx
import { useState, useEffect } from 'react';
import { getTableDetails } from '../../services/api';
import { theme } from '../../config/theme';

const TablePreview = ({ tableName }) => {
  const [tableData, setTableData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (tableName) {
      loadTableData();
    }
  }, [tableName]);

  const loadTableData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getTableDetails(tableName);

      if (response.success) {
        setTableData(response);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!tableName) {
    return (
      <div style={styles.container}>
        <div style={styles.placeholder}>
          Select a table from the left sidebar to view its details
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.placeholder}>Loading table details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>Error: {error}</div>
      </div>
    );
  }

  if (!tableData) {
    return null;
  }

  const columns = tableData.sample_data.length > 0
    ? Object.keys(tableData.sample_data[0])
    : [];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.tableName}>{tableName}</span>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>Schema</div>
        <div style={styles.schemaList}>
          {tableData.columns.map((col, idx) => (
            <div key={idx} style={styles.schemaItem}>
              <span style={styles.columnName}>{col.name}</span>
              <span style={styles.columnType}>{col.type}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>Sample Data</div>
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
              {tableData.sample_data.map((row, idx) => (
                <tr key={idx}>
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
    </div>
  );
};

const styles = {
  container: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
  },
  header: {
    padding: theme.spacing.md,
    borderBottom: `1px solid ${theme.colors.border}`,
  },
  tableName: {
    fontSize: '16px',
    fontWeight: '600',
    color: theme.colors.accent,
    fontFamily: theme.fonts.primary,
  },
  section: {
    padding: theme.spacing.md,
    borderBottom: `1px solid ${theme.colors.border}`,
  },
  sectionTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
    fontFamily: theme.fonts.primary,
  },
  schemaList: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.xs,
  },
  schemaItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: theme.spacing.xs,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.sm,
  },
  columnName: {
    color: theme.colors.textSecondary,
    fontSize: '13px',
    fontFamily: theme.fonts.mono,
  },
  columnType: {
    color: theme.colors.textMuted,
    fontSize: '12px',
    fontFamily: theme.fonts.mono,
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '12px',
    fontFamily: theme.fonts.mono,
  },
  th: {
    backgroundColor: theme.colors.primary,
    color: theme.colors.textPrimary,
    padding: theme.spacing.sm,
    textAlign: 'left',
    borderBottom: `1px solid ${theme.colors.border}`,
    fontWeight: '600',
  },
  td: {
    padding: theme.spacing.sm,
    color: theme.colors.textSecondary,
    borderBottom: `1px solid ${theme.colors.border}`,
  },
  placeholder: {
    padding: theme.spacing.xl,
    color: theme.colors.textMuted,
    textAlign: 'center',
    fontFamily: theme.fonts.primary,
    fontSize: '14px',
  },
  error: {
    padding: theme.spacing.md,
    color: theme.colors.error,
    textAlign: 'center',
    fontFamily: theme.fonts.primary,
  },
};

export default TablePreview;
