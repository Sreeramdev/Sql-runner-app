// src/App.jsx
import { useState, useEffect } from 'react';
import { theme } from './config/theme';
import logger from './utils/logger';
import Header from './components/Header';
import TableList from './components/LeftSidebar/TableList';
import EditorPanel from './components/QueryEditor/EditorPanel';
import TablePreview from './components/RightSidebar/TablePreview';

function App() {
  const [selectedTable, setSelectedTable] = useState(null);

  useEffect(() => {
    // Log application initialization
    logger.info('Application Initialized', {
      type: 'APP_LIFECYCLE',
      action: 'MOUNT',
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      theme: 'dark',
    });

    // Log any unhandled errors
    const errorHandler = (event) => {
      logger.error('Unhandled Error', {
        type: 'UNHANDLED_ERROR',
        error: event.error?.message || 'Unknown error',
        stack: event.error?.stack,
      });
    };

    // Log unhandled promise rejections
    const rejectionHandler = (event) => {
      logger.error('Unhandled Promise Rejection', {
        type: 'UNHANDLED_REJECTION',
        reason: event.reason?.message || event.reason,
      });
    };

    window.addEventListener('error', errorHandler);
    window.addEventListener('unhandledrejection', rejectionHandler);

    // Cleanup
    return () => {
      logger.info('Application Unmounting', {
        type: 'APP_LIFECYCLE',
        action: 'UNMOUNT',
      });
      
      window.removeEventListener('error', errorHandler);
      window.removeEventListener('unhandledrejection', rejectionHandler);
    };
  }, []);

  const handleTableClick = (tableName) => {
    logger.logUserAction('TABLE_SELECTED', {
      tableName,
      previousTable: selectedTable,
    });
    
    setSelectedTable(tableName);
  };

  return (
    <div style={styles.app}>
      <Header />
      <div style={styles.mainContent}>
        {/* Left Sidebar */}
        <div style={styles.leftSidebar}>
          <TableList onTableClick={handleTableClick} />
        </div>

        {/* Center Panel */}
        <div style={styles.centerPanel}>
          <EditorPanel />
        </div>

        {/* Right Sidebar */}
        <div style={styles.rightSidebar}>
          <TablePreview tableName={selectedTable} />
        </div>
      </div>
    </div>
  );
}

const styles = {
  app: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.colors.primary,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.primary,
  },
  mainContent: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
  },
  leftSidebar: {
    width: '280px',
    backgroundColor: theme.colors.secondary,
    borderRight: `1px solid ${theme.colors.border}`,
    overflow: 'hidden',
  },
  centerPanel: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  rightSidebar: {
    width: '320px',
    backgroundColor: theme.colors.secondary,
    borderLeft: `1px solid ${theme.colors.border}`,
    overflow: 'hidden',
  },
};

export default App;