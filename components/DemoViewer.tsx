'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { Demo } from '@/lib/demos';
import { pickText } from '@/lib/demos-l10n';

export default function DemoViewer({ corpus }: { corpus: Demo }) {
  const { t, locale } = useLanguage();
  const [activeTab, setActiveTab] = useState<'claims' | 'gaps'>('claims');
  const [activeDoc, setActiveDoc] = useState<string | null>(null);
  const [activeClaimId, setActiveClaimId] = useState(corpus.claims[0]?.id ?? '');
  const [activeGapIndex, setActiveGapIndex] = useState(0);

  const visibleClaims = useMemo(
    () => corpus.claims.filter((claim) => activeDoc === null || claim.doc === activeDoc),
    [activeDoc, corpus.claims],
  );
  const activeClaim = visibleClaims.find((claim) => claim.id === activeClaimId) ?? visibleClaims[0];
  const activeGap = corpus.gaps[activeGapIndex];
  const activeDocument = corpus.docs.find((doc) => doc.id === activeClaim?.doc);

  const selectDoc = (docId: string | null) => {
    setActiveDoc(docId);
    const first = corpus.claims.find((claim) => docId === null || claim.doc === docId);
    setActiveClaimId(first?.id ?? '');
  };

  const renderHighlighted = (text: string, highlight: string) => {
    const index = text.indexOf(highlight);
    if (!highlight || index < 0) return text;
    return <>{text.slice(0, index)}<mark className="demo-mark">{text.slice(index, index + highlight.length)}</mark>{text.slice(index + highlight.length)}</>;
  };

  return (
    <main className="profile-shell demo-viewer">
      <header className="demo-viewer__header">
        <div>
          <p className="brutal-kicker"><Link className="demo-viewer__back" href="/demo">{t('demo.back')}</Link> / {corpus.snapshot}</p>
          <h1 className="demo-viewer__title">{pickText(corpus.title, locale)}</h1>
          <p className="brutal-text">{pickText(corpus.subtitle, locale)}</p>
        </div>
        <nav className="demo-tabs" aria-label={t('demo.sections')}>
          <button type="button" className="demo-tabs__button" aria-pressed={activeTab === 'claims'} onClick={() => setActiveTab('claims')}>
            {t('demo.claimsTab', { n: String(corpus.claims.length) })}
          </button>
          <button type="button" className="demo-tabs__button" aria-pressed={activeTab === 'gaps'} onClick={() => setActiveTab('gaps')}>
            {t('demo.gapsTab', { n: String(corpus.gaps.length) })}
          </button>
        </nav>
      </header>

      <div className={`demo-layout${activeTab === 'gaps' ? ' demo-layout--gaps' : ''}`}>
        <aside className="demo-files" aria-label={t('demo.files')}>
          <p className="demo-column__heading">{t('demo.files')}</p>
          <div className="demo-files__list">
            <button type="button" className="demo-file" aria-pressed={activeDoc === null} onClick={() => selectDoc(null)}>
              <span>{t('demo.allFiles')}</span><span className="demo-file__count">{corpus.claims.length}</span>
            </button>
            {corpus.docs.map((doc) => {
              const count = corpus.claims.filter((claim) => claim.doc === doc.id).length;
              return (
                <button key={doc.id} type="button" className="demo-file" aria-pressed={activeDoc === doc.id} onClick={() => selectDoc(doc.id)}>
                  <span>{doc.name}</span><span className="demo-file__count">{count}</span>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="demo-middle" aria-label={activeTab === 'claims' ? t('demo.claims') : t('demo.gaps')}>
          <p className="demo-column__heading">
            {activeTab === 'claims' ? t('demo.conclusionsHeading') : t('demo.gapsHeading')}
          </p>
          {activeTab === 'claims' ? (
            <div className="demo-middle__list">
              {visibleClaims.map((claim) => (
                <button key={claim.id} type="button" className="demo-claim" aria-pressed={activeClaim?.id === claim.id} onClick={() => setActiveClaimId(claim.id)}>
                  <span className="demo-claim__id">{claim.id}</span>
                  <strong>{pickText(claim.title, locale)}</strong>
                  <span className="demo-claim__quote">{claim.claim}</span>
                  <span className="demo-claim__anchor">{claim.section} · {claim.anchor}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="demo-middle__list">
              {corpus.gaps.map((gap, index) => (
                <button key={index} type="button" className="demo-gap" aria-pressed={activeGapIndex === index} onClick={() => setActiveGapIndex(index)}>
                  <span className="demo-claim__id">{String(index + 1).padStart(2, '0')}</span>
                  <strong>{pickText(gap.q, locale)}</strong>
                </button>
              ))}
            </div>
          )}
        </section>

        <aside className="demo-evidence" aria-label={t('demo.evidence')}>
          {activeTab === 'claims' ? (
            activeClaim && activeDocument ? (
              <>
                <p className="demo-column__heading">{t('demo.evidence')}</p>
                <div className="demo-evidence__document">
                  <strong>{activeDocument.name}</strong>
                  <span>{activeDocument.meta}</span>
                </div>
                <p className="demo-evidence__section">{activeClaim.section} · {activeClaim.anchor}</p>
                {activeClaim.before && <p className="demo-context">{activeClaim.before}</p>}
                <div className="demo-evidence__block">
                  {activeClaim.ev.type === 'mark' ? (
                    <p className="demo-evidence__quote">{renderHighlighted(activeClaim.ev.text, activeClaim.ev.hl)}</p>
                  ) : (
                    <div className="demo-code" role="list">
                      {activeClaim.ev.lines.map(([lineNo, text], index) => (
                        <div key={`${lineNo}-${index}`} className={`demo-code__line${activeClaim.ev.type === 'code' && activeClaim.ev.hl === lineNo ? ' demo-code__line--active' : ''}`} role="listitem">
                          <span className="demo-code__number">{lineNo}</span><code>{text || ' '}</code>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {activeClaim.after && <p className="demo-context">{activeClaim.after}</p>}
                <div className="demo-verify">
                  <p className="demo-verify__label">{t('demo.verify')}</p>
                  <code>{activeClaim.verify}</code>
                </div>
                <a className="brutal-btn demo-source" href={activeDocument.url} target="_blank" rel="noreferrer">
                  {t('demo.openSource')} ↗
                </a>
              </>
            ) : <p className="demo-empty">{t('demo.noClaims')}</p>
          ) : activeGap ? (
            <>
              <p className="demo-column__heading">{t('demo.gapDetail')}</p>
              <h2 className="demo-gap-detail__question">{pickText(activeGap.q, locale)}</h2>
              <p className="demo-gap-detail__answer">{activeGap.a}</p>
              <p className="demo-gap-detail__why">{pickText(activeGap.why, locale)}</p>
            </>
          ) : <p className="demo-empty">{t('demo.noGaps')}</p>}
        </aside>
      </div>
    </main>
  );
}
