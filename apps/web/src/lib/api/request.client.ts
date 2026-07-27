export async function requestOk(
  input: RequestInfo | URL,
  init: RequestInit,
  errorMessage: string,
): Promise<Response> {
  const response = await fetch(input, init);
  if (!response.ok) throw new Error(errorMessage);
  return response;
}

export function readableError(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}
