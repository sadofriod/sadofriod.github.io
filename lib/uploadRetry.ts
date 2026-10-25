export const MAX_ATTEMPTS = 3;

export function isRetryableStatus(status: number): boolean {
  return status === 0 || status === 408 || status === 425 || status === 429 || (status >= 500 && status <= 599);
}

export function backoffDelay(attempt: number, random: () => number = Math.random): number {
  const base = Math.min(8000, 1000 * 2 ** Math.max(0, attempt - 1));
  const jitter = Math.min(1, Math.max(0, random()));
  return Math.min(8000, Math.round(base * (0.8 + jitter * 0.4)));
}

export function classifyFailure(error: unknown): 'retryable' | 'fatal' {
  if (error instanceof Error && error.name === 'AbortError') return 'fatal';
  if (error instanceof TypeError) return 'retryable';
  if (error && typeof error === 'object' && 'status' in error) {
    const status = Number((error as { status?: unknown }).status);
    return isRetryableStatus(status) ? 'retryable' : 'fatal';
  }
  return 'fatal';
}
