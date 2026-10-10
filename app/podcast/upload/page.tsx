'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Alert, Box, Button, Checkbox, Container, FormControlLabel, Stack, TextField, Typography } from '@mui/material';

export default function PodcastUploadPage() {
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
      setMessage('Invalid upload key');
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
      if (!response.ok) throw new Error(result.error || 'Upload failed');
      formElement.reset();
      setMessage('Episode uploaded successfully.');
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  if (!authenticated) {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 3 }}>Podcast upload</Typography>
        <Box component="form" onSubmit={authenticate}>
          <Stack spacing={2}>
            <TextField label="Upload key" type="password" value={authKey} onChange={(event) => setAuthKey(event.target.value)} required />
            {message && <Alert severity="error">{message}</Alert>}
            <Button type="submit" variant="contained">Authenticate</Button>
          </Stack>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 1 }}>Upload episode</Typography>
      <Button component={Link} href="/podcast" sx={{ mb: 3 }}>Back to episodes</Button>
      <Box component="form" onSubmit={upload}>
        <Stack spacing={2}>
          <TextField label="Title" name="title" required />
          <TextField label="Description" name="description" required multiline minRows={3} />
          <TextField label="Duration" name="duration" placeholder="45:30" required />
          <TextField label="Author" name="author" />
          <TextField label="Episode number" name="episodeNumber" type="number" />
          <TextField label="Season" name="season" type="number" />
          <TextField label="Keywords" name="keywords" helperText="Separate keywords with commas" />
          <Button component="label" variant="outlined">Choose audio file<input hidden name="audio" type="file" accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/mp4,audio/x-m4a" required /></Button>
          <Button component="label" variant="outlined">Choose cover image<input hidden name="image" type="file" accept="image/jpeg,image/png,image/webp" /></Button>
          <FormControlLabel control={<Checkbox name="explicit" value="true" />} label="Explicit content" />
          {message && <Alert severity={message.includes('successfully') ? 'success' : 'error'}>{message}</Alert>}
          <Button type="submit" variant="contained" disabled={busy}>{busy ? 'Uploading…' : 'Upload episode'}</Button>
        </Stack>
      </Box>
    </Container>
  );
}