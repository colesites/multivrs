export type LogLevel = "info" | "warn" | "error";

export interface RuntimeLog {
  id: string;
  timestamp: string;
  level: LogLevel;
  method: "GET" | "POST" | "PUT";
  status: number;
  host: string;
  path: string;
  message: string;
}

const log = (
  id: string,
  timestamp: string,
  level: LogLevel,
  method: RuntimeLog["method"],
  status: number,
  path: string,
  message: string,
): RuntimeLog => ({
  id,
  timestamp,
  level,
  method,
  status,
  host: "edge.multivrs.dev",
  path,
  message,
});

export const MOCK_RUNTIME_LOGS = [
  log(
    "log-01",
    "15:29:13.962",
    "info",
    "GET",
    200,
    "/",
    "Request completed in 34ms",
  ),
  log(
    "log-02",
    "15:28:10.051",
    "info",
    "GET",
    200,
    "/sign-in",
    "Route rendered from edge cache",
  ),
  log(
    "log-03",
    "15:27:32.894",
    "warn",
    "POST",
    429,
    "/api/subscribe",
    "Rate limit nearing threshold",
  ),
  log(
    "log-04",
    "15:26:13.861",
    "info",
    "GET",
    200,
    "/pricing",
    "Request completed in 42ms",
  ),
  log(
    "log-05",
    "15:24:55.846",
    "error",
    "POST",
    500,
    "/api/contact",
    "Upstream request timed out",
  ),
  log(
    "log-06",
    "15:24:37.272",
    "info",
    "GET",
    200,
    "/blog",
    "Request completed in 28ms",
  ),
  log(
    "log-07",
    "15:23:18.137",
    "info",
    "GET",
    304,
    "/",
    "Conditional request served",
  ),
  log(
    "log-08",
    "15:21:44.056",
    "warn",
    "GET",
    404,
    "/favicon.ico",
    "Asset not found",
  ),
  log(
    "log-09",
    "15:20:15.897",
    "info",
    "GET",
    200,
    "/docs",
    "Request completed in 39ms",
  ),
  log(
    "log-10",
    "15:18:41.993",
    "info",
    "GET",
    200,
    "/sign-in",
    "Request completed in 31ms",
  ),
];
