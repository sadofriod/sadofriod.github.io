'use client';

import { useState, FormEvent, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Container,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  IconButton,
  InputAdornment,
  Link as MuiLink,
} from '@mui/material';
import {
  CloudUpload,
  Logout,
  AudioFile,
  CheckCircle,
  Error as ErrorIcon,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';

export default function PodcastUploadPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authKey, setAuthKey] = useState('');
  const [authError, setAuthError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [result, setResult] = useState<{
    type: 'success' | 'error' | null;
    message: string;
    data?: any;
  }>({ type: null, message: '' });

  const handleAuth = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError('');

    try {
      const response = await fetch('/api/auth/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: authKey }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsAuthenticated(true);
        // Store auth in session storage
        sessionStorage.setItem('upload_auth', authKey);
      } else {
        setAuthError(data.error || 'Invalid authentication key');
      }
    } catch (error) {
      setAuthError('Authentication failed');
    }
  };

  const handleUpload = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);
    setResult({ type: null, message: '' });

    const form = e.currentTarget;
    const formData = new FormData(form);

    // Add auth key to the request
    formData.append('authKey', authKey || sessionStorage.getItem('upload_auth') || '');

    try {
      const response = await fetch('/api/podcasts', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          type: 'success',
          message: 'Podcast uploaded successfully!',
          data: data.podcast,
        });
        form.reset();
        setSelectedFileName(''); // Reset file name display
      } else {
        setResult({
          type: 'error',
          message: data.error || 'Upload failed',
        });
      }
    } catch (error) {
      setResult({
        type: 'error',
        message: error instanceof Error ? error.message : 'Upload failed',
      });
    } finally {
      setUploading(false);
    }
  };

  // Check if already authenticated on mount
  useEffect(() => {
    const storedAuth = sessionStorage.getItem('upload_auth');
    if (storedAuth) {
      setAuthKey(storedAuth);
      setIsAuthenticated(true);
    }
  }, []);

  if (!isAuthenticated) {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            py: 4,
          }}
        >
          <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <AudioFile sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                Authentication Required
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Enter the upload key to access the podcast upload page
              </Typography>
            </Box>

            <form onSubmit={handleAuth}>
              <TextField
                fullWidth
                id="auth-key"
                name="authKey"
                type={showPassword ? 'text' : 'password'}
                label="Upload Key"
                placeholder="Enter upload key"
                value={authKey}
                onChange={(e) => setAuthKey(e.target.value)}
                required
                sx={{ mb: 2 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {authError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {authError}
                </Alert>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{ py: 1.5 }}
              >
                Authenticate
              </Button>
            </form>
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ minHeight: '100vh', py: 4 }}>
        <Paper elevation={2} sx={{ p: { xs: 3, md: 4 } }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 4,
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CloudUpload sx={{ fontSize: 40, color: 'primary.main' }} />
              <Typography variant="h4" component="h1" fontWeight="bold">
                Upload Podcast
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<Logout />}
              onClick={() => {
                setIsAuthenticated(false);
                sessionStorage.removeItem('upload_auth');
                setAuthKey('');
              }}
            >
              Logout
            </Button>
          </Box>

          <form onSubmit={handleUpload}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box>
                <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                  Audio File <span style={{ color: '#d32f2f' }}>*</span>
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                  MP3, WAV, OGG, M4A - Max 100MB
                </Typography>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUpload />}
                  fullWidth
                  sx={{ py: 1.5, justifyContent: 'flex-start' }}
                >
                  {selectedFileName || 'Choose Audio File'}
                  <input
                    type="file"
                    id="audio"
                    name="audio"
                    accept="audio/*"
                    required
                    hidden
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setSelectedFileName(file.name);
                      }
                    }}
                  />
                </Button>
              </Box>

              <TextField
                fullWidth
                id="title"
                name="title"
                label="Title"
                required
                variant="outlined"
              />

              <TextField
                fullWidth
                id="description"
                name="description"
                label="Description"
                required
                multiline
                rows={4}
                variant="outlined"
              />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="duration"
                    name="duration"
                    label="Duration"
                    placeholder="45:30"
                    required
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="author"
                    name="author"
                    label="Author"
                    variant="outlined"
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="episodeNumber"
                    name="episodeNumber"
                    label="Episode Number"
                    type="number"
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="season"
                    name="season"
                    label="Season"
                    type="number"
                    variant="outlined"
                  />
                </Grid>
              </Grid>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={uploading}
                startIcon={uploading ? <CircularProgress size={20} /> : <CloudUpload />}
                sx={{ py: 1.5, mt: 2 }}
              >
                {uploading ? 'Uploading...' : 'Upload Podcast'}
              </Button>
            </Box>
          </form>

          {result.type && (
            <Alert
              severity={result.type === 'success' ? 'success' : 'error'}
              icon={result.type === 'success' ? <CheckCircle /> : <ErrorIcon />}
              sx={{ mt: 3 }}
            >
              <Typography variant="subtitle2" fontWeight="bold">
                {result.type === 'success' ? 'Success!' : 'Error'}
              </Typography>
              <Typography variant="body2">{result.message}</Typography>
              {result.data && (
                <Card variant="outlined" sx={{ mt: 2, bgcolor: 'background.paper' }}>
                  <CardContent>
                    <Typography variant="body2" gutterBottom>
                      <strong>Title:</strong> {result.data.metadata.title}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Duration:</strong> {result.data.metadata.duration}
                    </Typography>
                    <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                      <strong>Audio URL:</strong>{' '}
                      <MuiLink
                        href={result.data.metadata.audioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {result.data.metadata.audioUrl}
                      </MuiLink>
                    </Typography>
                  </CardContent>
                </Card>
              )}
            </Alert>
          )}
        </Paper>
      </Box>
    </Container>
  );
}
