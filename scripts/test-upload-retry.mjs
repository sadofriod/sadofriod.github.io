#!/usr/bin/env node
import { backoffDelay, classifyFailure, isRetryableStatus, MAX_ATTEMPTS } from '../lib/uploadRetry.ts';

const failures = [];
const check = (label, condition, detail = '') => {
  if (condition) console.log(`  ok   ${label}`);
  else { failures.push(label); console.log(`  FAIL ${label}${detail ? ` — ${detail}` : ''}`); }
};

for (const status of [0, 408, 425, 429, 500, 502, 503, 504]) {
  check(`HTTP ${status} is retryable`, isRetryableStatus(status));
}
for (const status of [400, 401, 403, 404, 413, 422]) {
  check(`HTTP ${status} is fatal`, !isRetryableStatus(status));
}

const centered = [1, 2, 3, 4, 10].map((attempt) => backoffDelay(attempt, () => 0.5));
check('backoff grows monotonically and caps at 8000 ms', centered.every((delay, index) => delay <= 8000 && (index === 0 || delay >= centered[index - 1])) && centered[3] === 8000 && centered[4] === 8000, JSON.stringify(centered));
check('attempt 1 is centered on 1000 ms', backoffDelay(1, () => 0.5) === 1000);
check('jitter stays within ±20% at random 0', backoffDelay(1, () => 0) === 800 && backoffDelay(2, () => 0) === 1600);
check('jitter stays within ±20% at random 1 and remains capped', backoffDelay(1, () => 1) === 1200 && backoffDelay(2, () => 1) === 2400 && backoffDelay(4, () => 1) === 8000);
check('retry limit is three attempts', MAX_ATTEMPTS === 3);

const abort = new Error('aborted');
abort.name = 'AbortError';
check('fetch TypeError is retryable', classifyFailure(new TypeError('fetch failed')) === 'retryable');
check('AbortError is fatal', classifyFailure(abort) === 'fatal');
check('status 503 error is retryable', classifyFailure({ status: 503 }) === 'retryable');
check('status 400 error is fatal', classifyFailure({ status: 400 }) === 'fatal');

if (failures.length) process.exit(1);
console.log('\nall upload retry checks passed');
