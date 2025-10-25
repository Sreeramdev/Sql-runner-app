// src/components/LeftSidebar/TableList.jsx
import { useState, useEffect } from 'react';
import { getAllTables, getTableDetails } from '../../services/api';
import { theme } from '../../config/theme';
import TableItem from './TableItem';

const TableList = ({ onTableClick }) => {
  const [tables, setTables] = useState([]);
  const [tableDetails, setTableDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      setLoading(true);
      const response = await getAllTables();
      if (response.success) {
        setTables(response.tables);
        // Load details for all tables
        response.tables.forEach(loadTableDetails);
      } else {
        setError('Failed to load tables');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadTableDetails = async (tableName) => {
    try {
      const response = await getTableDetails(tableName);
      if (response.success) {
        setTableDetails(prev => ({
          ...prev,
          [tableName]: response.columns
        }));
      }
    } catch (err) {
      console.error(`Failed to load details for ${tableName}:`, err);
    }
  };

  if (loading) {
    return <div style={styles.message}>Loading tables...</div>;
  }

  if (error) {
    return <div style={styles.error}>Error: {error}</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.icon}>📊</span>
        <span style={styles.title}>Available Tables</span>
      </div>
      <div style={styles.tableList}>
        {tables.map((table) => (
          <TableItem
            key={table}
            tableName={table}
            columns={tableDetails[table]}
            onTableClick={onTableClick}
          />
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    padding: theme.spacing.md,
    borderBottom: `1px solid ${theme.colors.border}`,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  icon: {
    fontSize: '16px',
  },
  title: {
    fontSize: '14px',
    fontWeight: '600',
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.primary,
  },
  tableList: {
    flex: 1,
    overflowY: 'auto',
    padding: theme.spacing.sm,
  },
  message: {
    padding: theme.spacing.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontFamily: theme.fonts.primary,
  },
  error: {
    padding: theme.spacing.md,
    color: theme.colors.error,
    textAlign: 'center',
    fontFamily: theme.fonts.primary,
  },
};

export default TableList;
