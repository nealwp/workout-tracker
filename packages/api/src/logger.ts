type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  [key: string]: unknown;
}

function serializeError(err: unknown): Record<string, unknown> {
  if (err instanceof Error) {
    return {
      name: err.name,
      message: err.message,
      stack: err.stack,
      cause: err.cause instanceof Error ? serializeError(err.cause) : err.cause,
    };
  }
  return { value: err };
}

function write(level: LogLevel, message: string, context?: LogContext, err?: unknown) {
  const entry: LogContext = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...context,
  };
  if (err !== undefined) entry.error = serializeError(err);

  const line = JSON.stringify(entry);

  if (level === "error") {
    // eslint-disable-next-line no-console
    console.error(line);
  } else {
    // eslint-disable-next-line no-console
    console.log(line);
  }
}

export const logger = {
  debug: (message: string, context?: LogContext) => write("debug", message, context),
  info: (message: string, context?: LogContext) => write("info", message, context),
  warn: (message: string, context?: LogContext, err?: unknown) =>
    write("warn", message, context, err),
  error: (message: string, context?: LogContext, err?: unknown) =>
    write("error", message, context, err),
};
