import { useState } from 'react';
import { executeQuery } from '../../services/api';
import { theme } from '../../config/theme';
import { queryHistoryManager } from '../../utils/queryHistory';
import Toolbar from './Toolbar';
import QueryInput from './QueryInput';
import ResultsDisplay from './ResultsDisplay';

const EditorPanel = () => {
  const [query, setQuery] = useState('SELECT * FROM Customers LIMIT 5;');
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rowCount, setRowCount] = useState(null);
  const [queryType, setQueryType] = useState(null);

  const handleRunQuery = async () => {
    if (!query.trim()) {
      setError('Please enter a SQL query');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResults(null);
      setRowCount(null);
      setQueryType(null);

      const trimmedQuery = query.trim().toUpperCase();
      let detectedType = 'SELECT';

      if (trimmedQuery.startsWith('INSERT')) detectedType = 'INSERT';
      else if (trimmedQuery.startsWith('UPDATE')) detectedType = 'UPDATE';
      else if (trimmedQuery.startsWith('DELETE')) detectedType = 'DELETE';
      else if (trimmedQuery.startsWith('CREATE')) detectedType = 'CREATE';
      else if (trimmedQuery.startsWith('DROP')) detectedType = 'DROP';
      else if (trimmedQuery.startsWith('ALTER')) detectedType = 'ALTER';

      const response = await executeQuery(query);

      if (response.success) {
        setResults(response.data);
        setRowCount(response.rowcount);
        setQueryType(detectedType);
        
        queryHistoryManager.addQuery(query);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError(err.message || 'An error occurred while executing the query');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.inputSection}>
        <Toolbar onRunQuery={handleRunQuery} loading={loading} />
        <div style={styles.inputWrapper}>
          <QueryInput
            value={query}
            onChange={setQuery}
            placeholder="-- Enter your SQL query here
-- Example: SELECT * FROM Customers;"
          />
        </div>
      </div>

      <div style={styles.resultsSection}>
        <ResultsDisplay
          data={results}
          error={error}
          loading={loading}
          rowCount={rowCount}
          queryType={queryType}
        />
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
  inputSection: {
    height: '40%',
    display: 'flex',
    flexDirection: 'column',
    borderBottom: `2px solid ${theme.colors.border}`,
  },
  inputWrapper: {
    flex: 1,
    overflow: 'hidden',
  },
  resultsSection: {
    flex: 1,
    overflow: 'hidden',
  },
};

export default EditorPanel;
