'use client';

import { useCallback, useRef, useState } from 'react';
import { JUDGE_ENDPOINT, normalizeDoi, summarize, doiUrl, type JudgeResponse, type Verdict } from '@/lib/judge';
import T from '@/components/T';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const EXAMPLES = [
  { doi: '10.1016/S0140-6736(97)11096-0', labelKey: 'judge.example1' },
  { doi: '10.1038/nature14581', labelKey: 'judge.example2' },
  { doi: '10.9999/not-in-snapshot', labelKey: 'judge.example3' },
];

const VERDICT_STYLE: Record<Verdict['kind'], { bg: string; labelKey: string }> = {
  retracted: { bg: 'var(--pink)', labelKey: 'judge.verdictRetracted' },
  not_retracted: { bg: 'var(--mint)', labelKey: 'judge.verdictNotRetracted' },
  no_status_rows: { bg: 'var(--yellow)', labelKey: 'judge.verdictNoRows' },
  abstained: { bg: 'var(--blue)', labelKey: 'judge.verdictAbstained' },
};

type State =
  | { phase: 'idle' }
  | { phase: 'loading'; doi: string }
  | { phase: 'done'; doi: string; verdict: Verdict; data: JudgeResponse; ms: number }
  | { phase: 'error'; doi: string; messageKey: string; messageParams?: Record<string, string> };

export default function JudgeLookup() {
  const { t } = useLanguage();
  const [value, setValue] = useState('');
  const [state, setState] = useState<State>({ phase: 'idle' });
  const abortRef = useRef<AbortController | null>(null);

  const run = useCallback(async (raw: string) => {
    const doi = normalizeDoi(raw);
    if (!doi) {
      setState({ phase: 'error', doi: raw.trim(), messageKey: 'judge.invalidDoi' });
      return;
    }
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setState({ phase: 'loading', doi });
    const started = performance.now();
    const timer = setTimeout(() => controller.abort(), 20000);
    try {
      const res = await fetch(`${JUDGE_ENDPOINT}?doi=${encodeURIComponent(doi)}`, {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
      const ms = Math.round(performance.now() - started);
      if (!res.ok) {
        setState({ phase: 'error', doi, messageKey: 'judge.httpError', messageParams: { status: String(res.status) } });
        return;
      }
      const data = (await res.json()) as JudgeResponse;
      setState({ phase: 'done', doi, verdict: summarize(data), data, ms });
    } catch (error) {
      const aborted = error instanceof DOMException && error.name === 'AbortError';
      setState({
        phase: 'error',
        doi,
        messageKey: aborted ? 'judge.timeout' : 'judge.network',
      });
    } finally {
      clearTimeout(timer);
    }
  }, []);

  return (
    <section className="brutal-card" style={{ marginBottom: 28 }}>
      <T as="p" className="brutal-kicker" style={{ margin: 0 }} k="judge.kicker" />
      <T as="h2" className="brutal-title" style={{ fontSize: 26, margin: '6px 0 10px' }} k="judge.title" />
      <T as="p" className="brutal-text" style={{ marginTop: 0 }} k="judge.lead" />

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void run(value);
        }}
        style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 14 }}
      >
        <label htmlFor="doi-input" style={{ position: 'absolute', left: -9999 }}>
          <T k="judge.inputLabel" />
        </label>
        <input
          id="doi-input"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="10.1016/S0140-6736(97)11096-0"
          spellCheck={false}
          autoComplete="off"
          style={{
            flex: '1 1 340px',
            minWidth: 240,
            padding: '12px 14px',
            border: 'var(--brutal-border)',
            borderRadius: 4,
            fontFamily: 'var(--brutal-mono)',
            fontSize: 14,
            background: '#fff',
          }}
        />
        <button
          type="submit"
          className="brutal-btn brutal-btn--ink"
          disabled={state.phase === 'loading'}
          style={{ opacity: state.phase === 'loading' ? 0.6 : 1 }}
        >
          {state.phase === 'loading' ? <T k="judge.checking" /> : <T k="judge.check" />}
        </button>
      </form>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
        {EXAMPLES.map((example) => (
          <button
            key={example.doi}
            type="button"
            className="brutal-pill"
            onClick={() => {
              setValue(example.doi);
              void run(example.doi);
            }}
            style={{ cursor: 'pointer' }}
          >
            <T k={example.labelKey} />
          </button>
        ))}
      </div>

      <div aria-live="polite" style={{ marginTop: 18 }}>
        {state.phase === 'loading' && (
          <p className="brutal-muted" style={{ fontFamily: 'var(--brutal-mono)', fontSize: 13 }}>
            GET {JUDGE_ENDPOINT}?doi={state.doi}
          </p>
        )}

        {state.phase === 'error' && (
          <div style={{ border: 'var(--brutal-border)', borderRadius: 4, padding: 14, background: '#fff' }}>
            <strong><T k="judge.errorTitle" /></strong>
            <p style={{ margin: '6px 0 0' }}><T k={state.messageKey} params={state.messageParams} /></p>
            <p className="brutal-muted" style={{ margin: '8px 0 0', fontFamily: 'var(--brutal-mono)', fontSize: 12 }}>
              doi: {state.doi || t('judge.emptyDoi')}
            </p>
          </div>
        )}

        {state.phase === 'done' && <Result state={state} />}
      </div>
    </section>
  );
}

function Result({ state }: { state: Extract<State, { phase: 'done' }> }) {
  const { t } = useLanguage();
  const { verdict, data, doi, ms } = state;
  const style = VERDICT_STYLE[verdict.kind];
  const title = data.paper?.title;

  return (
    <div style={{ border: 'var(--brutal-border)', borderRadius: 4, background: '#fff', overflow: 'hidden' }}>
      <div style={{ background: style.bg, padding: '12px 14px', borderBottom: 'var(--brutal-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'baseline' }}>
          <strong style={{ fontSize: 18 }}><T k={style.labelKey} /></strong>
          <span style={{ fontFamily: 'var(--brutal-mono)', fontSize: 12 }}>
            {ms} ms ·{' '}
            <T k={data.statuses.length === 1 ? 'judge.metaSourceOne' : 'judge.metaSourceMany'} params={{ n: String(data.statuses.length) }} />
            {verdict.tiers ? (
              <>
                {' · '}
                <T k="judge.metaTier" params={{ tiers: verdict.tiers }} />
              </>
            ) : null}
          </span>
        </div>
      </div>

      <div style={{ padding: 14 }}>
        <p style={{ margin: '0 0 10px' }}><T k={verdict.readingKey} params={verdict.readingParams} /></p>

        {title && (
          <p style={{ margin: '0 0 10px', fontStyle: 'italic' }}>
            {title} {data.paper?.year ? `(${data.paper.year})` : ''}{' '}
            <a className="brutal-link" href={doiUrl(doi)} target="_blank" rel="noreferrer noopener">
              doi.org/{doi}
            </a>
          </p>
        )}

        {data.statuses.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13 }}>
              <thead>
                <tr>
                  {['judge.colSource', 'judge.colTier', 'judge.colSays', 'judge.colRetractionDate'].map((head) => (
                    <th
                      key={head}
                      style={{ textAlign: 'left', padding: '6px 8px', borderBottom: 'var(--brutal-border)' }}
                    >
                      <T k={head} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.statuses.map((status) => (
                  <tr key={`${status.source}-${status.paper_id}`}>
                    <td style={{ padding: '6px 8px', borderBottom: '1px solid #e6e0d4', fontFamily: 'var(--brutal-mono)' }}>
                      {status.source}
                    </td>
                    <td style={{ padding: '6px 8px', borderBottom: '1px solid #e6e0d4' }}>{status.source_tier}</td>
                    <td style={{ padding: '6px 8px', borderBottom: '1px solid #e6e0d4' }}>
                      {status.is_retracted ? <T k="judge.saysRetracted" /> : <T k="judge.saysNotRetracted" />}
                    </td>
                    <td style={{ padding: '6px 8px', borderBottom: '1px solid #e6e0d4' }}>
                      {status.retraction_date ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <details style={{ marginTop: 12 }}>
          <summary style={{ cursor: 'pointer', fontFamily: 'var(--brutal-mono)', fontSize: 13 }}>
            <T k="judge.rawResponse" />
          </summary>
          <pre
            style={{
              overflowX: 'auto',
              background: '#111',
              color: '#f7f3e8',
              padding: 12,
              borderRadius: 4,
              fontSize: 12,
              marginTop: 8,
            }}
          >
            {JSON.stringify(data, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}
