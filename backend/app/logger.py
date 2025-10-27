"""
Structured logging utility for CloudWatch
Generates JSON logs with correlation IDs, timestamps, and rich context
"""

import logging
import json
import uuid
import traceback
from datetime import datetime
from functools import wraps
from flask import request, g

class CloudWatchJSONFormatter(logging.Formatter):
    """Custom JSON formatter for CloudWatch logs"""
    
    def format(self, record):
        log_data = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }
        
        # Add correlation ID if exists
        if hasattr(g, 'correlation_id'):
            log_data["correlation_id"] = g.correlation_id
            
        # Add request context if available
        if hasattr(g, 'request_context'):
            log_data["request"] = g.request_context
            
        # Add extra fields
        if hasattr(record, 'extra_data'):
            log_data.update(record.extra_data)
            
        # Add exception info if present
        if record.exc_info:
            log_data["exception"] = {
                "type": record.exc_info[0].__name__,
                "message": str(record.exc_info[1]),
                "traceback": traceback.format_exception(*record.exc_info)
            }
            
        return json.dumps(log_data)


def setup_logger(name='sql_runner'):
    """Configure structured logger"""
    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)
    
    # Remove existing handlers
    logger.handlers.clear()
    
    # Console handler with JSON formatting
    handler = logging.StreamHandler()
    handler.setFormatter(CloudWatchJSONFormatter())
    logger.addHandler(handler)
    
    return logger


def generate_correlation_id():
    """Generate unique correlation ID for request tracing"""
    return str(uuid.uuid4())


def log_request_middleware():
    """Flask before_request middleware for logging"""
    g.correlation_id = request.headers.get('X-Correlation-ID', generate_correlation_id())
    g.request_context = {
        "method": request.method,
        "path": request.path,
        "remote_addr": request.remote_addr,
        "user_agent": request.headers.get('User-Agent', 'Unknown')
    }


def log_with_context(logger, level, message, **extra):
    """Log with additional context"""
    log_record = logger.makeRecord(
        logger.name,
        getattr(logging, level.upper()),
        "(unknown file)",
        0,
        message,
        (),
        None
    )
    log_record.extra_data = extra
    logger.handle(log_record)


def log_api_call(func):
    """Decorator to log API calls with timing"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        logger = logging.getLogger('sql_runner')
        start_time = datetime.utcnow()
        
        log_with_context(
            logger,
            'INFO',
            f"API call started: {func.__name__}",
            endpoint=request.path,
            method=request.method
        )
        
        try:
            result = func(*args, **kwargs)
            duration = (datetime.utcnow() - start_time).total_seconds() * 1000
            
            log_with_context(
                logger,
                'INFO',
                f"API call completed: {func.__name__}",
                endpoint=request.path,
                duration_ms=round(duration, 2),
                status="success"
            )
            
            return result
            
        except Exception as e:
            duration = (datetime.utcnow() - start_time).total_seconds() * 1000
            
            log_with_context(
                logger,
                'ERROR',
                f"API call failed: {func.__name__}",
                endpoint=request.path,
                duration_ms=round(duration, 2),
                error=str(e),
                status="error"
            )
            raise
            
    return wrapper


# Create logger instance
logger = setup_logger()