'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import RssFeedIcon from '@mui/icons-material/RssFeed';
import UploadIcon from '@mui/icons-material/Upload';
import type { Podcast } from '@/lib/podcasts';
import PodcastEditDialog from '@/components/PodcastEditDialog';

function uploadKey(): string {
  return new URLSearchParams(window.location.search).get('authKey') || sessionStorage.getItem('upload_auth') || '';
}

export default function PodcastPage() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [editing, setEditing] = useState<Podcast | null>(null);

  useEffect(() => {
    const queryKey = new URLSearchParams(window.location.search).get('authKey');
    if (queryKey) sessionStorage.setItem('upload_auth', queryKey);
    setIsAdmin(Boolean(queryKey || sessionStorage.getItem('upload_auth')));
    const load = async () => {
      try {
        const response = await fetch('/api/podcasts');
        if (!response.ok) throw new Error('Could not load episodes');
        setPodcasts(await response.json());
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'Could not load episodes');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const refresh = async () => {
    const response = await fetch('/api/podcasts');
    if (!response.ok) throw new Error('Could not refresh episodes');
    setPodcasts(await response.json());
  };

  const remove = async (podcast: Podcast) => {
    if (!window.confirm(`Delete “${podcast.metadata.title}”?`)) return;
    const response = await fetch(`/api/podcasts/${podcast.id}`, {
      method: 'DELETE',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ authKey: uploadKey() }),
    });
    if (!response.ok) {
      setError('Could not delete this episode');
      return;
    }
    await refresh();
  };

  const save = async (formData: FormData) => {
    const response = await fetch(`/api/podcasts/${editing?.id}`, { method: 'PATCH', body: formData });
    if (!response.ok) throw new Error('Could not update this episode');
    await refresh();
  };

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2} sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h3" component="h1">Podcast</Typography>
          <Typography color="text.secondary">Episodes from Ashes Space</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button href="/podcast/rss" startIcon={<RssFeedIcon />} target="_blank">RSS</Button>
          {isAdmin && <Button component={Link} href="/podcast/upload" variant="contained" startIcon={<UploadIcon />}>Upload</Button>}
        </Stack>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box> : null}
      {!loading && podcasts.length === 0 && <Alert severity="info">No episodes have been published yet.</Alert>}

      <Grid container spacing={2}>
        {podcasts.map((podcast) => (
          <Grid item xs={12} key={podcast.id}>
            <Card variant="outlined">
              <CardContent>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
                  {podcast.metadata.image && <Box component="img" src={podcast.metadata.image} alt="" sx={{ width: 88, height: 88, objectFit: 'cover', borderRadius: 1 }} />}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                      <Typography variant="h6">{podcast.metadata.title}</Typography>
                      {podcast.metadata.explicit && <Chip size="small" label="Explicit" />}
                    </Stack>
                    <Typography variant="body2" color="text.secondary">{podcast.metadata.date} · {podcast.metadata.duration}{podcast.metadata.author ? ` · ${podcast.metadata.author}` : ''}</Typography>
                    <Typography sx={{ my: 1 }}>{podcast.metadata.description}</Typography>
                    <audio controls preload="none" src={podcast.metadata.audioUrl} style={{ width: '100%' }}>Audio playback is not supported by this browser.</audio>
                  </Box>
                  {isAdmin && <Stack direction="row">
                    <Button aria-label="Edit episode" onClick={() => setEditing(podcast)}><EditIcon /></Button>
                    <Button aria-label="Delete episode" color="error" onClick={() => void remove(podcast)}><DeleteIcon /></Button>
                  </Stack>}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <PodcastEditDialog podcast={editing} open={Boolean(editing)} onClose={() => setEditing(null)} onSave={save} />
    </Container>
  );
}