// src/App.jsx
import { useState } from 'react';
import { theme } from './config/theme';
import Header from './components/Header';
import TableList from './components/LeftSidebar/TableList';
import EditorPanel from './components/QueryEditor/EditorPanel';
import TablePreview from './components/RightSidebar/TablePreview';

function App() {
  const [selectedTable, setSelectedTable] = useState(null);

  const handleTableClick = (tableName) => {
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
