/**
 * Development-only logger utility
 * Logs are only shown in development mode to keep production clean
 */

const isDevelopment = import.meta.env.DEV;
const isTest =
  import.meta.env.VITEST === true ||
  import.meta.env.NODE_ENV === "test" ||
  (typeof global !== "undefined" && "describe" in global);

type LogLevel = "debug" | "info" | "warn" | "error";

type LogContext = Record<string, unknown>;

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: Error;
}

class Logger {
  private shouldLog(): boolean {
    // Don't log during tests to keep output clean
    return isDevelopment && !isTest;
  }

  private formatMessage(entry: LogEntry): void {
    if (!this.shouldLog()) return;

    const { timestamp, level, message, context, error } = entry;
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    // Use appropriate console method based on log level
    const consoleMethod = this.getConsoleMethod(level);

    if (context && Object.keys(context).length > 0) {
      console.group(`${prefix} ${message}`);
      consoleMethod("Context:", context);
      if (error) {
        console.error("Error:", error);
      }
      console.groupEnd();
    } else {
      if (error) {
        console.group(`${prefix} ${message}`);
        console.error("Error:", error);
        console.groupEnd();
      } else {
        consoleMethod(`${prefix} ${message}`);
      }
    }
  }

  private getConsoleMethod(level: LogLevel): (...args: unknown[]) => void {
    switch (level) {
      case "debug":
        return console.debug;
      case "info":
        return console.info;
      case "warn":
        return console.warn;
      case "error":
        return console.error;
      default:
        return console.log;
    }
  }

  private createLogEntry(level: LogLevel, message: string, context?: LogContext, error?: Error): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error,
    };
  }

  debug(message: string, context?: LogContext): void {
    this.formatMessage(this.createLogEntry("debug", message, context));
  }

  info(message: string, context?: LogContext): void {
    this.formatMessage(this.createLogEntry("info", message, context));
  }

  warn(message: string, context?: LogContext): void {
    this.formatMessage(this.createLogEntry("warn", message, context));
  }

  error(message: string, error?: Error, context?: LogContext): void {
    this.formatMessage(this.createLogEntry("error", message, context, error));
  }

  // Utility method for logging API calls
  api(method: string, url: string, status?: number, duration?: number, context?: LogContext): void {
    const message = `${method} ${url}${status ? ` (${status})` : ""}${duration ? ` - ${duration}ms` : ""}`;
    const level: LogLevel = status && status >= 400 ? "error" : "info";
    this.formatMessage(this.createLogEntry(level, message, context));
  }

  // Utility method for logging component lifecycle
  component(componentName: string, action: string, context?: LogContext): void {
    this.formatMessage(this.createLogEntry("debug", `${componentName}: ${action}`, context));
  }
}

export const logger = new Logger();
