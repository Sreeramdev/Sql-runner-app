// src/services/api.js
import axios from 'axios';
import logger from '../utils/logger';

const API_BASE_URL = import.meta.env.VITE_API_URL;

if (!API_BASE_URL) {
  logger.error('API Configuration Error', {
    error: 'VITE_API_URL is not defined in environment variables',
    type: 'CONFIG_ERROR',
  });
  throw new Error('VITE_API_URL is not defined in environment variables');
}

logger.info('API Service Initialized', {
  baseURL: API_BASE_URL,
  type: 'INITIALIZATION',
});

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor - add correlation ID and log requests
api.interceptors.request.use(
  (config) => {
    // Add correlation ID to request headers
    const correlationId = logger.updateCorrelationId();
    config.headers['X-Correlation-ID'] = correlationId;
    
    // Log the request
    logger.logApiRequest(
      config.url,
      config.method.toUpperCase(),
      config.data
    );
    
    // Add timestamp for duration calculation
    config.metadata = { startTime: Date.now() };
    
    return config;
  },
  (error) => {
    logger.error('Request Interceptor Error', {
      type: 'REQUEST_ERROR',
      error: error.message,
    });
    return Promise.reject(error);
  }
);

// Response interceptor - log responses and errors
api.interceptors.response.use(
  (response) => {
    const duration = Date.now() - response.config.metadata.startTime;
    
    logger.logApiSuccess(
      response.config.url,
      response.config.method.toUpperCase(),
      duration,
      response.data
    );
    
    return response;
  },
  (error) => {
    const duration = error.config?.metadata?.startTime 
      ? Date.now() - error.config.metadata.startTime 
      : 0;
    
    logger.logApiError(
      error.config?.url || 'unknown',
      error.config?.method?.toUpperCase() || 'unknown',
      error,
      duration
    );
    
    // Enhanced error handling
    if (error.response) {
      // Server responded with error status
      logger.error('Server Error Response', {
        type: 'SERVER_ERROR',
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
      });
    } else if (error.request) {
      // Request made but no response received
      logger.error('No Response from Server', {
        type: 'NETWORK_ERROR',
        message: 'Request was made but no response was received',
        timeout: error.code === 'ECONNABORTED',
      });
    } else {
      // Error in request setup
      logger.error('Request Setup Error', {
        type: 'REQUEST_SETUP_ERROR',
        message: error.message,
      });
    }
    
    return Promise.reject(error);
  }
);

// Health check
export const checkHealth = async () => {
  try {
    logger.info('Health Check', {
      type: 'HEALTH_CHECK',
      action: 'START',
    });
    
    const response = await api.get('/');
    
    logger.info('Health Check Success', {
      type: 'HEALTH_CHECK',
      action: 'SUCCESS',
      status: response.data.status,
    });
    
    return response.data;
  } catch (error) {
    logger.error('Health Check Failed', {
      type: 'HEALTH_CHECK',
      action: 'FAILED',
      error: error.message,
    });
    throw error;
  }
};

// Execute SQL query
export const executeQuery = async (query) => {
  const startTime = Date.now();
  const queryType = query.trim().split(/\s+/)[0].toUpperCase();
  const queryPreview = query.length > 100 ? query.substring(0, 100) + '...' : query;
  
  try {
    logger.logQueryExecution(query, queryType);
    
    const response = await api.post('/api/query', { query });
    const duration = Date.now() - startTime;
    
    if (response.data.success) {
      logger.logQuerySuccess(
        queryType,
        response.data.rowcount || 0,
        duration
      );
    } else {
      logger.logQueryError(
        queryType,
        response.data.error,
        duration
      );
    }
    
    return response.data;
  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.logQueryError(
      queryType,
      error.response?.data?.error || error.message,
      duration
    );
    
    // Return structured error response
    return {
      success: false,
      error: error.response?.data?.error || error.message || 'Failed to execute query',
    };
  }
};

// Get all tables
export const getAllTables = async () => {
  try {
    logger.info('Fetching All Tables', {
      type: 'TABLE_OPERATION',
      action: 'GET_ALL',
    });
    
    const response = await api.get('/api/tables');
    
    logger.info('Tables Fetched Successfully', {
      type: 'TABLE_OPERATION',
      action: 'GET_ALL_SUCCESS',
      tableCount: response.data.tables?.length || 0,
    });
    
    return response.data;
  } catch (error) {
    logger.error('Failed to Fetch Tables', {
      type: 'TABLE_OPERATION',
      action: 'GET_ALL_FAILED',
      error: error.message,
    });
    throw error;
  }
};

// Get table details (schema + sample data)
export const getTableDetails = async (tableName) => {
  try {
    logger.info('Fetching Table Details', {
      type: 'TABLE_OPERATION',
      action: 'GET_DETAILS',
      tableName,
    });
    
    const response = await api.get(`/api/tables/${tableName}`);
    
    logger.info('Table Details Fetched Successfully', {
      type: 'TABLE_OPERATION',
      action: 'GET_DETAILS_SUCCESS',
      tableName,
      columnCount: response.data.columns?.length || 0,
      sampleRows: response.data.sample_data?.length || 0,
    });
    
    return response.data;
  } catch (error) {
    logger.error('Failed to Fetch Table Details', {
      type: 'TABLE_OPERATION',
      action: 'GET_DETAILS_FAILED',
      tableName,
      error: error.message,
    });
    throw error;
  }
};

export default api;