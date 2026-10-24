'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function PodcastUploadPage() {
  const { t } = useLanguage();
  const [authKey, setAuthKey] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const storedKey = sessionStorage.getItem('upload_auth') || '';
    setAuthKey(storedKey);
    setAuthenticated(Boolean(storedKey));
  }, []);

  const authenticate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const response = await fetch('/api/auth/upload', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ key: authKey }),
    });
    if (!response.ok) {
      setMessage(t('podcast.invalidKey'));
      return;
    }
    sessionStorage.setItem('upload_auth', authKey);
    setAuthenticated(true);
    setMessage('');
  };

  const upload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    const formElement = event.currentTarget;
    const formData = new FormData(formElement);
    formData.set('authKey', authKey);
    try {
      const response = await fetch('/api/podcasts', { method: 'POST', body: formData });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || t('podcast.uploadFailed'));
      formElement.reset();
      setMessage(t('podcast.uploadedOk'));
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : t('podcast.uploadFailed'));
    } finally {
      setBusy(false);
    }
  };

  if (!authenticated) {
    return (
      <main className="profile-shell">
        <header className="brutal-card brutal-card--yellow">
          <p className="brutal-kicker">{t('podcast.adminKicker')}</p>
          <h1 className="profile-hero__name">{t('podcastForm.kicker')}</h1>
          <p className="brutal-text">{t('podcastForm.unlockHint')}</p>
        </header>

        {message ? (
          <div className="profile-callout" role="alert">
            <span className="brutal-kicker">{t('common.error')}</span>
            <span>{message}</span>
          </div>
        ) : null}

        <form className="brutal-card profile-section" onSubmit={authenticate}>
          <div className="form-grid">
            <label className="form-field form-field--wide">
              <span>{t('podcastForm.uploadKey')}</span>
              <input type="password" value={authKey} onChange={(event) => setAuthKey(event.target.value)} required />
            </label>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 18 }}>
            <button type="submit" className="brutal-btn brutal-btn--ink">
              {t('podcastForm.authenticate')}
            </button>
          </div>
        </form>
      </main>
    );
  }

  return (
    <main className="profile-shell">
      <header className="brutal-card brutal-card--yellow">
        <p className="brutal-kicker">{t('podcast.adminKicker')}</p>
        <h1 className="profile-hero__name">{t('podcastForm.submit')}</h1>
        <p className="brutal-text">{t('podcastForm.tagline')}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 18 }}>
          <Link className="brutal-btn" href="/podcast">
            {t('podcast.backToEpisodes')}
          </Link>
        </div>
      </header>

      {message ? (
        <div
          className={`profile-callout${message.includes('successfully') ? ' profile-callout--bottom' : ''}`}
          role={message.includes('successfully') ? 'status' : 'alert'}
        >
          <span className="brutal-kicker">{message.includes('successfully') ? 'Done' : t('common.error')}</span>
          <span>{message}</span>
        </div>
      ) : null}

      <form className="brutal-card profile-section" onSubmit={upload}>
        <div className="form-grid">
          <label className="form-field">
            <span>{t('podcastForm.title')}</span>
            <input type="text" name="title" required />
          </label>

          <label className="form-field form-field--wide">
            <span>{t('podcastForm.description')}</span>
            <textarea name="description" rows={3} required />
          </label>

          <label className="form-field">
            <span>{t('podcastForm.duration')}</span>
            <input type="text" name="duration" placeholder="45:30" required />
          </label>

          <label className="form-field">
            <span>{t('podcastForm.author')}</span>
            <input type="text" name="author" />
          </label>

          <label className="form-field">
            <span>{t('podcastForm.episodeNumber')}</span>
            <input type="number" name="episodeNumber" />
          </label>

          <label className="form-field">
            <span>{t('podcastForm.season')}</span>
            <input type="number" name="season" />
          </label>

          <label className="form-field form-field--wide">
            <span>{t('podcastForm.keywords')}</span>
            <input type="text" name="keywords" placeholder={t('podcastForm.keywordsHint')} />
          </label>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 18 }}>
          <label className="brutal-btn">
            {t('podcastForm.chooseAudio')}
            <input hidden type="file" name="audio" accept="audio/*" required />
          </label>
          <label className="brutal-btn">
            {t('podcastForm.chooseCover')}
            <input hidden type="file" name="image" accept="image/jpeg,image/png,image/webp" />
          </label>
        </div>

        <label className="form-field form-field--wide" style={{ marginTop: 18 }}>
          <span>{t('podcastForm.videoKey')}</span>
          <input type="text" name="videoKey" placeholder="S01E01.mp4" />
        </label>
        <small style={{ display: 'block', marginTop: 6, opacity: 0.7 }}>
          {t('podcastForm.videoKeyHint')}
        </small>

        <label className="brutal-checkbox" style={{ marginTop: 16 }}>
          <input type="checkbox" name="explicit" value="true" /> {t('podcastForm.explicit')}
        </label>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 22 }}>
          <button type="submit" className="brutal-btn brutal-btn--ink" disabled={busy}>
            {busy ? t('podcastForm.uploading') : t('podcastForm.submit')}
          </button>
        </div>
      </form>
    </main>
  );
}
