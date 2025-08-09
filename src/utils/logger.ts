/**
 * Logging Utility
 * Centralized logging with different levels and error tracking
 */

import { AppError, ErrorCodes } from '../types';
import { FEATURE_FLAGS } from '../constants';

/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

/**
 * Log entry interface
 */
interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: Record<string, any>;
  error?: Error;
  userId?: string;
}

/**
 * Logger class
 */
class Logger {
  private logs: LogEntry[] = [];
  private maxLogs: number = 1000;
  private minLevel: LogLevel = __DEV__ ? LogLevel.DEBUG : LogLevel.INFO;

  /**
   * Log a debug message
   */
  debug(message: string, context?: Record<string, any>, userId?: string): void {
    this.log(LogLevel.DEBUG, message, context, undefined, userId);
  }

  /**
   * Log an info message
   */
  info(message: string, context?: Record<string, any>, userId?: string): void {
    this.log(LogLevel.INFO, message, context, undefined, userId);
  }

  /**
   * Log a warning message
   */
  warn(message: string, context?: Record<string, any>, userId?: string): void {
    this.log(LogLevel.WARN, message, context, undefined, userId);
  }

  /**
   * Log an error message
   */
  error(message: string, error?: Error, context?: Record<string, any>, userId?: string): void {
    this.log(LogLevel.ERROR, message, context, error, userId);
  }

  /**
   * Log an entry
   */
  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    error?: Error,
    userId?: string
  ): void {
    if (level < this.minLevel) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context,
      error,
      userId,
    };

    // Add to logs array
    this.logs.push(entry);

    // Trim logs if exceeding max
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output
    this.outputToConsole(entry);

    // Send to crash reporting service if error
    if (level === LogLevel.ERROR && FEATURE_FLAGS.ENABLE_CRASH_REPORTING) {
      this.reportError(entry);
    }
  }

  /**
   * Output log entry to console
   */
  private outputToConsole(entry: LogEntry): void {
    const timestamp = entry.timestamp.toISOString();
    const levelName = LogLevel[entry.level];
    const prefix = `[${timestamp}] ${levelName}:`;

    const logData = {
      message: entry.message,
      ...(entry.context && { context: entry.context }),
      ...(entry.error && { error: entry.error }),
      ...(entry.userId && { userId: entry.userId }),
    };

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(prefix, logData);
        break;
      case LogLevel.INFO:
        console.info(prefix, logData);
        break;
      case LogLevel.WARN:
        console.warn(prefix, logData);
        break;
      case LogLevel.ERROR:
        console.error(prefix, logData);
        break;
    }
  }

  /**
   * Report error to crash reporting service
   */
  private async reportError(entry: LogEntry): Promise<void> {
    try {
      // TODO: Implement crash reporting service integration
      // This could be Sentry, Bugsnag, Firebase Crashlytics, etc.
      
      if (__DEV__) {
        console.log('🚨 Error Report:', {
          message: entry.message,
          error: entry.error,
          context: entry.context,
          userId: entry.userId,
          timestamp: entry.timestamp,
        });
      }
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  }

  /**
   * Get recent logs
   */
  getLogs(count?: number): LogEntry[] {
    const logsToReturn = count ? this.logs.slice(-count) : this.logs;
    return [...logsToReturn]; // Return copy
  }

  /**
   * Clear logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Set minimum log level
   */
  setMinLevel(level: LogLevel): void {
    this.minLevel = level;
  }

  /**
   * Get logs as formatted string
   */
  getLogsAsString(): string {
    return this.logs
      .map(entry => {
        const timestamp = entry.timestamp.toISOString();
        const level = LogLevel[entry.level];
        const context = entry.context ? ` | Context: ${JSON.stringify(entry.context)}` : '';
        const error = entry.error ? ` | Error: ${entry.error.message}` : '';
        const userId = entry.userId ? ` | User: ${entry.userId}` : '';
        
        return `[${timestamp}] ${level}: ${entry.message}${context}${error}${userId}`;
      })
      .join('\n');
  }

  /**
   * Export logs for debugging
   */
  exportLogs(): {
    logs: LogEntry[];
    summary: {
      total: number;
      byLevel: Record<string, number>;
      timeRange: {
        start: string;
        end: string;
      };
    };
  } {
    const byLevel = this.logs.reduce((acc, log) => {
      const levelName = LogLevel[log.level];
      acc[levelName] = (acc[levelName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const timestamps = this.logs.map(log => log.timestamp);
    const start = timestamps.length > 0 ? Math.min(...timestamps.map(t => t.getTime())) : Date.now();
    const end = timestamps.length > 0 ? Math.max(...timestamps.map(t => t.getTime())) : Date.now();

    return {
      logs: [...this.logs],
      summary: {
        total: this.logs.length,
        byLevel,
        timeRange: {
          start: new Date(start).toISOString(),
          end: new Date(end).toISOString(),
        },
      },
    };
  }
}

// Global logger instance
const logger = new Logger();

// Export logger methods
export const debug = logger.debug.bind(logger);
export const info = logger.info.bind(logger);
export const warn = logger.warn.bind(logger);
export const error = logger.error.bind(logger);
export const getLogs = logger.getLogs.bind(logger);
export const clearLogs = logger.clearLogs.bind(logger);
export const setMinLevel = logger.setMinLevel.bind(logger);
export const getLogsAsString = logger.getLogsAsString.bind(logger);
export const exportLogs = logger.exportLogs.bind(logger);

/**
 * Create an AppError with logging
 */
export const createAppError = (
  code: ErrorCodes,
  message: string,
  details?: any,
  userId?: string
): AppError => {
  const appError: AppError = {
    code,
    message,
    details,
    timestamp: new Date(),
  };

  // Log the error
  error(`AppError: ${code} - ${message}`, undefined, { details }, userId);

  return appError;
};

/**
 * Log function execution time
 */
export const logExecutionTime = <T>(
  fn: () => Promise<T>,
  functionName: string,
  userId?: string
): Promise<T> => {
  return new Promise(async (resolve, reject) => {
    const startTime = Date.now();
    
    try {
      debug(`Starting execution: ${functionName}`, undefined, userId);
      const result = await fn();
      const duration = Date.now() - startTime;
      
      info(`Completed execution: ${functionName}`, { duration }, userId);
      resolve(result);
    } catch (err) {
      const duration = Date.now() - startTime;
      error(
        `Failed execution: ${functionName}`,
        err as Error,
        { duration },
        userId
      );
      reject(err);
    }
  });
};

/**
 * Log API request/response
 */
export const logApiCall = (
  method: string,
  url: string,
  status?: number,
  duration?: number,
  error?: Error,
  userId?: string
): void => {
  const context = {
    method,
    url,
    status,
    duration,
  };

  if (error) {
    logger.error(`API call failed: ${method} ${url}`, error, context, userId);
  } else {
    logger.info(`API call: ${method} ${url}`, context, userId);
  }
};

/**
 * Performance monitoring wrapper
 */
export class PerformanceMonitor {
  private startTime: number;
  private name: string;
  private userId?: string;

  constructor(name: string, userId?: string) {
    this.name = name;
    this.userId = userId;
    this.startTime = Date.now();
    
    debug(`Performance monitor started: ${name}`, undefined, userId);
  }

  /**
   * End monitoring and log results
   */
  end(additionalContext?: Record<string, any>): number {
    const duration = Date.now() - this.startTime;
    
    info(
      `Performance monitor ended: ${this.name}`,
      { duration, ...additionalContext },
      this.userId
    );

    return duration;
  }

  /**
   * Add checkpoint
   */
  checkpoint(checkpointName: string): number {
    const duration = Date.now() - this.startTime;
    
    debug(
      `Performance checkpoint: ${this.name} - ${checkpointName}`,
      { duration },
      this.userId
    );

    return duration;
  }
}

/**
 * Create performance monitor
 */
export const createPerformanceMonitor = (name: string, userId?: string): PerformanceMonitor => {
  return new PerformanceMonitor(name, userId);
};

/**
 * Log user action
 */
export const logUserAction = (
  action: string,
  context?: Record<string, any>,
  userId?: string
): void => {
  info(`User action: ${action}`, context, userId);
};

/**
 * Log system event
 */
export const logSystemEvent = (
  event: string,
  context?: Record<string, any>
): void => {
  info(`System event: ${event}`, context);
};

// TODO: Implement log rotation and archiving
// TODO: Add log filtering and search capabilities
// TODO: Implement remote logging service integration
// TODO: Add log analytics and insights
// TODO: Implement log-based alerting
// TODO: Add structured logging with correlation IDs

