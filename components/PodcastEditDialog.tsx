'use client';

import { useEffect, useState, type FormEvent } from 'react';
import type { Podcast } from '@/lib/podcasts';
import { useLanguage } from '@/lib/i18n/LanguageContext';

type PodcastEditDialogProps = {
  podcast: Podcast | null;
  open: boolean;
  onClose: () => void;
  onSave: (formData: FormData) => Promise<void>;
};

function formDataFromPodcast(podcast: Podcast) {
  return {
    title: podcast.metadata.title,
    description: podcast.metadata.description,
    duration: podcast.metadata.duration,
    author: podcast.metadata.author || '',
    episodeNumber: podcast.metadata.episodeNumber?.toString() || '',
    season: podcast.metadata.season?.toString() || '',
    keywords: podcast.metadata.keywords?.join(', ') || '',
    videoKey: podcast.metadata.videoUrl ? decodeURIComponent(podcast.metadata.videoUrl.replace(/^\/podcast-media\//, '')) : '',
    explicit: podcast.metadata.explicit || false,
  };
}

export default function PodcastEditDialog({ podcast, open, onClose, onSave }: PodcastEditDialogProps) {
  const { t } = useLanguage();
  const [values, setValues] = useState({ title: '', description: '', duration: '', author: '', episodeNumber: '', season: '', keywords: '', videoKey: '', explicit: false });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (podcast) setValues(formDataFromPodcast(podcast));
  }, [podcast]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!podcast) return;
    const formData = new FormData(event.currentTarget);
    formData.set('explicit', String(values.explicit));
    formData.set('keywords', values.keywords);
    formData.set('authKey', sessionStorage.getItem('upload_auth') || '');
    setSaving(true);
    try {
      await onSave(formData);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="brutal-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="podcast-edit-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="brutal-dialog__panel">
        <form onSubmit={handleSubmit}>
          <h2 className="brutal-dialog__title" id="podcast-edit-title">
            {t('podcast.editEpisode')}
          </h2>

          <div className="form-grid">
            <label className="form-field">
              <span>{t('podcastForm.title')}</span>
              <input
                type="text"
                name="title"
                autoFocus
                value={values.title}
                onChange={(event) => setValues({ ...values, title: event.target.value })}
                required
              />
            </label>

            <label className="form-field form-field--wide">
              <span>{t('podcastForm.description')}</span>
              <textarea
                name="description"
                rows={3}
                value={values.description}
                onChange={(event) => setValues({ ...values, description: event.target.value })}
                required
              />
            </label>

            <label className="form-field">
              <span>{t('podcastForm.duration')}</span>
              <input
                type="text"
                name="duration"
                placeholder="45:30"
                value={values.duration}
                onChange={(event) => setValues({ ...values, duration: event.target.value })}
                required
              />
            </label>

            <label className="form-field">
              <span>{t('podcastForm.author')}</span>
              <input
                type="text"
                name="author"
                value={values.author}
                onChange={(event) => setValues({ ...values, author: event.target.value })}
              />
            </label>

            <label className="form-field form-field--wide">
              <span>{t('podcastForm.keywords')}</span>
              <input
                type="text"
                name="keywords"
                value={values.keywords}
                onChange={(event) => setValues({ ...values, keywords: event.target.value })}
                placeholder={t('podcastForm.keywordsHint')}
              />
            </label>

            <label className="form-field">
              <span>{t('podcastForm.episodeNumber')}</span>
              <input
                type="number"
                name="episodeNumber"
                value={values.episodeNumber}
                onChange={(event) => setValues({ ...values, episodeNumber: event.target.value })}
              />
            </label>

            <label className="form-field">
              <span>{t('podcastForm.season')}</span>
              <input
                type="number"
                name="season"
                value={values.season}
                onChange={(event) => setValues({ ...values, season: event.target.value })}
              />
            </label>

            <label className="form-field form-field--wide">
              <span>{t('podcastForm.videoKey')}</span>
              <input
                type="text"
                name="videoKey"
                placeholder="S01E01.mp4"
                value={values.videoKey}
                onChange={(event) => setValues({ ...values, videoKey: event.target.value })}
              />
            </label>
          </div>

          <p className="brutal-text" style={{ marginTop: 10, fontSize: '0.85rem', opacity: 0.7 }}>
            Optional. Must already exist in the PODCASTS bucket; clear to remove.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 14 }}>
            <label className="brutal-btn">
              {t('podcastForm.replaceAudio')}
              <input hidden type="file" name="audio" accept="audio/*" />
            </label>
            <label className="brutal-btn">
              {t('podcastForm.replaceCover')}
              <input hidden type="file" name="image" accept="image/jpeg,image/png,image/webp" />
            </label>
          </div>

          <label className="brutal-checkbox" style={{ marginTop: 16 }}>
            <input
              type="checkbox"
              checked={values.explicit}
              onChange={(event) => setValues({ ...values, explicit: event.target.checked })}
            />{' '}
            {t('podcastForm.explicit')}
          </label>

          <div className="brutal-dialog__actions">
            <button type="button" className="brutal-btn" onClick={onClose}>
              {t('common.cancel')}
            </button>
            <button type="submit" className="brutal-btn brutal-btn--ink" disabled={saving}>
              {saving ? t('podcastForm.saving') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
