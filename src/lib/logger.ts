type LogLevel = "info" | "warn" | "error" | "debug";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

/**
 * Utilidad de logging profesional.
 * En producción, esto podría integrarse fácilmente con Axiom, Sentry o Logtail.
 */
class Logger {
  private static instance: Logger;

  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private format(level: LogLevel, message: string, context?: Record<string, unknown>): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
    };
  }

  private log(entry: LogEntry) {
    // En producción, aquí enviaríamos el log a un servicio externo
    const { level, message, timestamp, context } = entry;
    const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : "";
    
    const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;

    switch (level) {
      case "error":
        console.error(formattedMessage);
        break;
      case "warn":
        console.warn(formattedMessage);
        break;
      case "debug":
        if (process.env.NODE_ENV !== "production") {
          console.debug(formattedMessage);
        }
        break;
      default:
        console.info(formattedMessage);
    }
  }

  public info(message: string, context?: Record<string, unknown>) {
    this.log(this.format("info", message, context));
  }

  public warn(message: string, context?: Record<string, unknown>) {
    this.log(this.format("warn", message, context));
  }

  public error(message: string, context?: Record<string, unknown>) {
    this.log(this.format("error", message, context));
  }

  public debug(message: string, context?: Record<string, unknown>) {
    this.log(this.format("debug", message, context));
  }
}

export const logger = Logger.getInstance();
