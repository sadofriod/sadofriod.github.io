'use client';

import { useEffect, useState } from 'react';
import T from '@/components/T';

type Telemetry = {
  corpus: {
    papers: number;
    citation_edges: number;
    retractions: number;
    snapshot_id: string;
    built_at: string;
  } | null;
  payments: {
    mainnet: { settlements: number; volume_usdc: string; networks: string[] };
    testnet: { settlements: number; volume_usdc: string; networks: string[] };
    recent_mainnet: Array<{
      network: string;
      amount_usdc: string;
      transaction: string;
      settled_at: string;
      explorer_url: string;
    }>;
  };
  public_calls: { window_days: number; calls: number; callers: number; p95_latency_ms: number };
  generated_at: string;
  verify: unknown;
};

type PanelState = { status: 'loading' } | { status: 'error' } | { status: 'ok'; data: Telemetry };

const ENDPOINT = 'https://pay.ashesborn.cloud/api/v1/telemetry';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isTelemetry(value: unknown): value is Telemetry {
  if (!isRecord(value) || !isRecord(value.payments) || !isRecord(value.public_calls)) return false;
  const { payments, public_calls } = value;
  if (
    !isRecord(payments.mainnet) ||
    !isRecord(payments.testnet) ||
    !('settlements' in payments.mainnet) ||
    !('volume_usdc' in payments.mainnet) ||
    !('networks' in payments.mainnet) ||
    !('settlements' in payments.testnet) ||
    !('volume_usdc' in payments.testnet) ||
    !('networks' in payments.testnet) ||
    !Array.isArray(payments.recent_mainnet) ||
    !('window_days' in public_calls) ||
    !('calls' in public_calls) ||
    !('callers' in public_calls) ||
    !('p95_latency_ms' in public_calls) ||
    !('verify' in value) ||
    typeof value.generated_at !== 'string' ||
    !Number.isFinite(new Date(value.generated_at).getTime())
  ) {
    return false;
  }

  if (
    value.corpus !== null &&
    (!isRecord(value.corpus) ||
      !('papers' in value.corpus) ||
      !('citation_edges' in value.corpus) ||
      !('retractions' in value.corpus) ||
      !('snapshot_id' in value.corpus) ||
      !('built_at' in value.corpus))
  ) {
    return false;
  }
  return payments.recent_mainnet.every(
    (item) =>
      isRecord(item) &&
      typeof item.network === 'string' &&
      'amount_usdc' in item &&
      typeof item.transaction === 'string' &&
      typeof item.settled_at === 'string' &&
      typeof item.explorer_url === 'string'
  );
}

function formatNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value)
    ? new Intl.NumberFormat(undefined).format(value)
    : '—';
}

function formatAmount(value: unknown) {
  return (typeof value === 'number' && Number.isFinite(value)) ||
    (typeof value === 'string' && /^\d+(\.\d+)?$/.test(value))
    ? value
    : '—';
}

function TelemetryStat({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="telemetry-stat">
      <span className="telemetry-stat__value">{formatNumber(value)}</span>
      <span className="telemetry-stat__label"><T k={label} /></span>
    </div>
  );
}

export default function TelemetryPanel() {
  const [state, setState] = useState<PanelState>({ status: 'loading' });

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const timeout = setTimeout(() => controller.abort(), 8000);

    async function load() {
      try {
        const response = await fetch(ENDPOINT, { signal: controller.signal });
        if (!response.ok) throw new Error('Telemetry request failed');
        const payload: unknown = await response.json();
        if (controller.signal.aborted) throw new Error('Telemetry request timed out');
        if (!isTelemetry(payload)) throw new Error('Invalid telemetry response');
        if (active) setState({ status: 'ok', data: payload });
      } catch {
        if (active) setState({ status: 'error' });
      } finally {
        clearTimeout(timeout);
      }
    }

    void load();
    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  if (state.status === 'loading') return <p className="telemetry-note"><T k="telemetry.loading" /></p>;
  if (state.status === 'error') {
    return (
      <p className="telemetry-note">
        <T k="telemetry.unavailable" />{' '}
        <a href={ENDPOINT}><T k="telemetry.rawLink" /></a>
      </p>
    );
  }

  const { data } = state;
  const corpus = data.corpus;
  const recent = data.payments.recent_mainnet.slice(0, 3);

  return (
    <>
      <div className="telemetry-grid">
        <TelemetryStat label="telemetry.papers" value={corpus?.papers} />
        <TelemetryStat label="telemetry.citationEdges" value={corpus?.citation_edges} />
        <TelemetryStat label="telemetry.settlements" value={data.payments.mainnet.settlements} />
        <div className="telemetry-stat">
          <span className="telemetry-stat__value">{formatAmount(data.payments.mainnet.volume_usdc)}</span>
          <span className="telemetry-stat__label"><T k="telemetry.volume" /> (USDC)</span>
        </div>
        <TelemetryStat label="telemetry.calls" value={data.public_calls.calls} />
        <div className="telemetry-stat">
          <span className="telemetry-stat__value">{formatNumber(data.public_calls.p95_latency_ms)}</span>
          <span className="telemetry-stat__label"><T k="telemetry.p95" /> (ms)</span>
        </div>
      </div>
      <p className="telemetry-note">
        <T k="telemetry.generatedAt" params={{ when: new Date(data.generated_at).toISOString() }} />
      </p>
      {recent.length > 0 ? (
        <>
          <p className="telemetry-note"><T k="telemetry.recent" /></p>
          <ul className="telemetry-settlements">
            {recent.map((settlement, index) => (
              <li key={`${settlement.transaction}-${index}`}>
                <a href={settlement.explorer_url} target="_blank" rel="noopener noreferrer">
                  {`${formatAmount(settlement.amount_usdc)} USDC · 0x${settlement.transaction.replace(/^0x/, '').slice(0, 10)}…`}
                </a>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </>
  );
}
