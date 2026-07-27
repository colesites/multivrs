import "server-only";

interface LogContext {
  event: string;
  message?: string;
  metadata?: Record<string, string | number | boolean | null>;
}

function write(level: "error" | "info" | "warn", context: LogContext): void {
  process.stderr.write(
    `${JSON.stringify({ ...context, level, timestamp: new Date().toISOString() })}\n`,
  );
}

export function logError(
  event: string,
  error: unknown,
  metadata?: LogContext["metadata"],
): void {
  write("error", {
    event,
    message: error instanceof Error ? error.message : "Unknown error",
    metadata,
  });
}

export function logWarning(event: string, error: unknown): void {
  write("warn", {
    event,
    message: error instanceof Error ? error.message : "Unknown error",
  });
}
