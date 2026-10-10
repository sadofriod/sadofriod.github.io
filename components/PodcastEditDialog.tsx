'use client';

import { useEffect, useState, type FormEvent } from 'react';
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  TextField,
} from '@mui/material';
import type { Podcast } from '@/lib/podcasts';

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
    explicit: podcast.metadata.explicit || false,
  };
}

export default function PodcastEditDialog({ podcast, open, onClose, onSave }: PodcastEditDialogProps) {
  const [values, setValues] = useState({ title: '', description: '', duration: '', author: '', episodeNumber: '', season: '', keywords: '', explicit: false });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (podcast) setValues(formDataFromPodcast(podcast));
  }, [podcast]);

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

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <form onSubmit={handleSubmit}>
        <DialogTitle>Edit episode</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 2, pt: '12px !important' }}>
          <TextField label="Title" name="title" value={values.title} onChange={(event) => setValues({ ...values, title: event.target.value })} required />
          <TextField label="Description" name="description" value={values.description} onChange={(event) => setValues({ ...values, description: event.target.value })} multiline minRows={3} required />
          <TextField label="Duration" name="duration" value={values.duration} onChange={(event) => setValues({ ...values, duration: event.target.value })} placeholder="45:30" required />
          <TextField label="Author" name="author" value={values.author} onChange={(event) => setValues({ ...values, author: event.target.value })} />
          <TextField label="Keywords" name="keywords" value={values.keywords} onChange={(event) => setValues({ ...values, keywords: event.target.value })} helperText="Separate keywords with commas" />
          <FormControlLabel control={<Checkbox checked={values.explicit} onChange={(event) => setValues({ ...values, explicit: event.target.checked })} />} label="Explicit content" />
          <Button component="label" variant="outlined">Replace audio<input hidden type="file" name="audio" accept="audio/*" /></Button>
          <Button component="label" variant="outlined">Replace cover<input hidden type="file" name="image" accept="image/jpeg,image/png,image/webp" /></Button>
          <TextField label="Episode number" name="episodeNumber" value={values.episodeNumber} onChange={(event) => setValues({ ...values, episodeNumber: event.target.value })} type="number" />
          <TextField label="Season" name="season" value={values.season} onChange={(event) => setValues({ ...values, season: event.target.value })} type="number" />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}