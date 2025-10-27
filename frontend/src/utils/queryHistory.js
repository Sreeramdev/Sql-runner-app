export const MAX_HISTORY_QUERIES = 7;

export const queryHistoryManager = {
  /**
   * Get all query history from localStorage
   * @returns {Array} Array of query history objects
   */
  getHistory: () => {
    try {
      const history = localStorage.getItem('sqlQueryHistory');
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Error reading query history:', error);
      return [];
    }
  },

  /**
   * Add a new query to history
   * @param {string} query - The SQL query to add
   */
  addQuery: (query) => {
    if (!query || !query.trim()) return;

    try {
      const history = queryHistoryManager.getHistory();
      const newEntry = {
        id: Date.now(),
        query: query.trim(),
        timestamp: new Date().toISOString(),
      };

      // Remove duplicate if exists
      const filtered = history.filter(entry => entry.query !== query.trim());

      // Add new query at the beginning and limit to MAX_HISTORY_QUERIES
      const updated = [newEntry, ...filtered].slice(0, MAX_HISTORY_QUERIES);

      localStorage.setItem('sqlQueryHistory', JSON.stringify(updated));
    } catch (error) {
      console.error('Error adding query to history:', error);
    }
  },

  /**
   * Clear all query history
   */
  clearHistory: () => {
    try {
      localStorage.removeItem('sqlQueryHistory');
    } catch (error) {
      console.error('Error clearing query history:', error);
    }
  },
};