/**
 * Structured logging utility for frontend
 * Logs to console in development and can be configured for production logging
 */

const LOG_LEVELS = {
    DEBUG: 'DEBUG',
    INFO: 'INFO',
    WARN: 'WARN',
    ERROR: 'ERROR',
  };
  
  class Logger {
    constructor() {
      this.correlationId = this.generateCorrelationId();
      this.sessionId = this.getOrCreateSessionId();
      this.environment = import.meta.env.MODE || 'development';
    }
  
    generateCorrelationId() {
      return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
  
    getOrCreateSessionId() {
      let sessionId = sessionStorage.getItem('sessionId');
      if (!sessionId) {
        sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('sessionId', sessionId);
      }
      return sessionId;
    }
  
    createLogEntry(level, message, context = {}) {
      return {
        timestamp: new Date().toISOString(),
        level,
        message,
        sessionId: this.sessionId,
        correlationId: this.correlationId,
        environment: this.environment,
        userAgent: navigator.userAgent,
        url: window.location.href,
        ...context,
      };
    }
  
    formatConsoleOutput(logEntry) {
      const { timestamp, level, message, ...rest } = logEntry;
      const time = new Date(timestamp).toLocaleTimeString();
      
      // Color coding for different log levels
      const colors = {
        DEBUG: '#808080',
        INFO: '#0ea5e9',
        WARN: '#f59e0b',
        ERROR: '#ef4444',
      };
  
      return {
        style: `color: ${colors[level]}; font-weight: bold;`,
        prefix: `[${time}] [${level}]`,
        message,
        context: Object.keys(rest).length > 0 ? rest : null,
      };
    }
  
    log(level, message, context = {}) {
      const logEntry = this.createLogEntry(level, message, context);
      const formatted = this.formatConsoleOutput(logEntry);
  
      // Console output with styling
      if (formatted.context) {
        console.log(
          `%c${formatted.prefix} ${formatted.message}`,
          formatted.style,
          formatted.context
        );
      } else {
        console.log(`%c${formatted.prefix} ${formatted.message}`, formatted.style);
      }
  
      // In production, you could send logs to a logging service
      if (this.environment === 'production' && level === LOG_LEVELS.ERROR) {
        // Example: Send to logging service
        // this.sendToLoggingService(logEntry);
      }
  
      return logEntry;
    }
  
    debug(message, context = {}) {
      return this.log(LOG_LEVELS.DEBUG, message, context);
    }
  
    info(message, context = {}) {
      return this.log(LOG_LEVELS.INFO, message, context);
    }
  
    warn(message, context = {}) {
      return this.log(LOG_LEVELS.WARN, message, context);
    }
  
    error(message, context = {}) {
      return this.log(LOG_LEVELS.ERROR, message, context);
    }
  
    // API call logging helpers
    logApiRequest(endpoint, method, data = null) {
      return this.info('API Request', {
        type: 'API_REQUEST',
        endpoint,
        method,
        hasData: !!data,
        dataPreview: data ? JSON.stringify(data).substring(0, 100) : null,
      });
    }
  
    logApiSuccess(endpoint, method, duration, responseData = null) {
      return this.info('API Success', {
        type: 'API_SUCCESS',
        endpoint,
        method,
        duration_ms: duration,
        hasResponse: !!responseData,
        responseSize: responseData ? JSON.stringify(responseData).length : 0,
      });
    }
  
    logApiError(endpoint, method, error, duration) {
      return this.error('API Error', {
        type: 'API_ERROR',
        endpoint,
        method,
        duration_ms: duration,
        error: error.message,
        errorCode: error.response?.status,
        errorData: error.response?.data,
      });
    }
  
    // Query execution logging
    logQueryExecution(query, queryType) {
      const queryPreview = query.length > 100 ? query.substring(0, 100) + '...' : query;
      
      return this.info('Query Execution Started', {
        type: 'QUERY_EXECUTION',
        queryType,
        queryLength: query.length,
        queryPreview,
      });
    }
  
    logQuerySuccess(queryType, rowCount, duration) {
      return this.info('Query Executed Successfully', {
        type: 'QUERY_SUCCESS',
        queryType,
        rowCount,
        duration_ms: duration,
      });
    }
  
    logQueryError(queryType, error, duration) {
      return this.error('Query Execution Failed', {
        type: 'QUERY_ERROR',
        queryType,
        error,
        duration_ms: duration,
      });
    }
  
    // Component lifecycle logging
    logComponentMount(componentName) {
      return this.debug('Component Mounted', {
        type: 'COMPONENT_LIFECYCLE',
        componentName,
        action: 'MOUNT',
      });
    }
  
    logComponentUnmount(componentName) {
      return this.debug('Component Unmounted', {
        type: 'COMPONENT_LIFECYCLE',
        componentName,
        action: 'UNMOUNT',
      });
    }
  
    // User interaction logging
    logUserAction(action, details = {}) {
      return this.info('User Action', {
        type: 'USER_INTERACTION',
        action,
        ...details,
      });
    }
  
    // Performance logging
    logPerformance(operation, duration) {
      const level = duration > 1000 ? LOG_LEVELS.WARN : LOG_LEVELS.INFO;
      return this.log(level, 'Performance Metric', {
        type: 'PERFORMANCE',
        operation,
        duration_ms: duration,
      });
    }
  
    // Update correlation ID for new request chains
    updateCorrelationId() {
      this.correlationId = this.generateCorrelationId();
      return this.correlationId;
    }
  
    getCorrelationId() {
      return this.correlationId;
    }
  }
  
  // Create singleton instance
  const logger = new Logger();
  
  export default logger;
  export { LOG_LEVELS };