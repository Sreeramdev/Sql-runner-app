// src/components/QueryEditor/EditorPanel.jsx
import { useState, useEffect } from 'react';
import { executeQuery } from '../../services/api';
import { theme } from '../../config/theme';
import logger from '../../utils/logger';
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

  useEffect(() => {
    logger.logComponentMount('EditorPanel');
    
    return () => {
      logger.logComponentUnmount('EditorPanel');
    };
  }, []);

  const handleRunQuery = async () => {
    if (!query.trim()) {
      const errorMsg = 'Please enter a SQL query';
      setError(errorMsg);
      
      logger.warn('Empty Query Submission', {
        type: 'VALIDATION_ERROR',
        component: 'EditorPanel',
      });
      
      return;
    }

    const startTime = Date.now();
    
    try {
      setLoading(true);
      setError(null);
      setResults(null);
      setRowCount(null);
      setQueryType(null);

      // Detect query type
      const trimmedQuery = query.trim().toUpperCase();
      let detectedType = 'SELECT';

      if (trimmedQuery.startsWith('INSERT')) detectedType = 'INSERT';
      else if (trimmedQuery.startsWith('UPDATE')) detectedType = 'UPDATE';
      else if (trimmedQuery.startsWith('DELETE')) detectedType = 'DELETE';
      else if (trimmedQuery.startsWith('CREATE')) detectedType = 'CREATE';
      else if (trimmedQuery.startsWith('DROP')) detectedType = 'DROP';
      else if (trimmedQuery.startsWith('ALTER')) detectedType = 'ALTER';

      logger.logUserAction('RUN_QUERY', {
        queryType: detectedType,
        queryLength: query.length,
      });

      const response = await executeQuery(query);
      const duration = Date.now() - startTime;

      if (response.success) {
        setResults(response.data);
        setRowCount(response.rowcount);
        setQueryType(detectedType);
        
        logger.info('Query Results Displayed', {
          type: 'QUERY_RESULT',
          queryType: detectedType,
          rowCount: response.rowcount,
          hasData: response.data && response.data.length > 0,
          duration_ms: duration,
        });
      } else {
        setError(response.error);
        
        logger.warn('Query Returned Error', {
          type: 'QUERY_ERROR',
          queryType: detectedType,
          error: response.error,
          duration_ms: duration,
        });
      }
    } catch (err) {
      const duration = Date.now() - startTime;
      const errorMessage = err.message || 'An error occurred while executing the query';
      setError(errorMessage);
      
      logger.error('Query Execution Exception', {
        type: 'EXCEPTION',
        component: 'EditorPanel',
        error: errorMessage,
        duration_ms: duration,
      });
    } finally {
      setLoading(false);
      
      logger.logPerformance('QUERY_EXECUTION', Date.now() - startTime);
    }
  };

  const handleQueryChange = (newQuery) => {
    setQuery(newQuery);
    
    // Log significant query changes (debounced in real scenario)
    if (Math.abs(newQuery.length - query.length) > 50) {
      logger.debug('Query Modified', {
        type: 'USER_INPUT',
        component: 'EditorPanel',
        previousLength: query.length,
        newLength: newQuery.length,
      });
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.inputSection}>
        <Toolbar onRunQuery={handleRunQuery} loading={loading} />
        <div style={styles.inputWrapper}>
          <QueryInput
            value={query}
            onChange={handleQueryChange}
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