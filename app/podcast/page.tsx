'use client';

import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Link as MuiLink,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RssFeedIcon from '@mui/icons-material/RssFeed';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadIcon from '@mui/icons-material/Upload';
import type { Podcast } from '@/lib/podcasts';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

export default function PodcastPage() {
  const router = useRouter();
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingPodcast, setEditingPodcast] = useState<Podcast | null>(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    duration: '',
    author: '',
  });
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [selectedAudioFile, setSelectedAudioFile] = useState<File | null>(null);

  useEffect(() => {
    // Check if user is admin
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const authKey = urlParams.get('authKey');
      const storedAuth = sessionStorage.getItem('upload_auth');
      setIsAdmin(!!authKey || !!storedAuth);
    }
  }, []);

  useEffect(() => {
    async function fetchPodcasts() {
      try {
        const response = await fetch('/api/podcasts');
        if (!response.ok) {
          throw new Error('Failed to fetch podcasts');
        }
        const data = await response.json();
        setPodcasts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchPodcasts();
  }, []);

  const rssUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/podcast/rss`
    : '/podcast/rss';

  const handleDelete = async (podcastId: string) => {
    if (!confirm('Are you sure you want to delete this podcast?')) {
      return;
    }

    try {
      const authKey = new URLSearchParams(window.location.search).get('authKey') || 
                      sessionStorage.getItem('upload_auth');
      
      const response = await fetch(`/api/podcasts/${podcastId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ authKey }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete podcast');
      }

      setPodcasts(podcasts.filter(p => p.id !== podcastId));
      alert('Podcast deleted successfully');
    } catch (err) {
      alert('Failed to delete podcast: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const handleUpdate = async () => {
    if (!editingPodcast) return;

    try {
      const authKey = new URLSearchParams(window.location.search).get('authKey') || 
                      sessionStorage.getItem('upload_auth');
      
      const formData = new FormData();
      formData.append('authKey', authKey || '');
      formData.append('title', editFormData.title);
      formData.append('description', editFormData.description);
      formData.append('duration', editFormData.duration);
      formData.append('author', editFormData.author);
      
      if (selectedImageFile) {
        formData.append('image', selectedImageFile);
      }
      
      if (selectedAudioFile) {
        formData.append('audio', selectedAudioFile);
      }
      
      const response = await fetch(`/api/podcasts/${editingPodcast.id}`, {
        method: 'PATCH',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to update podcast');
      }

      const updatedPodcast = await response.json();
      setPodcasts(podcasts.map(p => p.id === editingPodcast.id ? updatedPodcast.podcast : p));
      setEditingPodcast(null);
      setSelectedImageFile(null);
      setImagePreview('');
      setSelectedAudioFile(null);
      alert('Podcast updated successfully');
    } catch (err) {
      alert('Failed to update podcast: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      {/* Header */}
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Podcast
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          Listen to our latest episodes on technology, development, and innovation
        </Typography>
        
        {/* Buttons */}
        <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
          <Button
            variant="contained"
            startIcon={<RssFeedIcon />}
            href={rssUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Subscribe via RSS
          </Button>
          
          {isAdmin && (
            <Button
              variant="contained"
              color="secondary"
              startIcon={<UploadIcon />}
              onClick={() => router.push('/podcast/upload')}
            >
              Upload Podcast
            </Button>
          )}
        </Stack>
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          RSS Feed URL:{' '}
          <MuiLink href={rssUrl} target="_blank" rel="noopener noreferrer">
            {rssUrl}
          </MuiLink>
        </Typography>
      </Box>

      {/* Podcast List */}
      {podcasts.length === 0 ? (
        <Alert severity="info">No podcasts available yet. Check back soon!</Alert>
      ) : (
        <Grid container spacing={4}>
          {podcasts.map((podcast) => (
            <Grid item xs={12} key={podcast.id}>
              <Card 
                sx={{ 
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                }}
              >
                {podcast.metadata.image && (
                  <CardMedia
                    component="img"
                    sx={{
                      width: { xs: '100%', md: 200 },
                      height: { xs: 200, md: 'auto' },
                      objectFit: 'cover',
                    }}
                    image={podcast.metadata.image}
                    alt={podcast.metadata.title}
                  />
                )}
                <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <CardContent sx={{ flex: '1 0 auto' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1, justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {podcast.metadata.season && podcast.metadata.episodeNumber && (
                          <Chip
                            label={`S${podcast.metadata.season}E${podcast.metadata.episodeNumber}`}
                            size="small"
                            color="primary"
                          />
                        )}
                        {podcast.metadata.explicit && (
                          <Chip label="Explicit" size="small" color="warning" />
                        )}
                      </Box>
                      
                      {isAdmin && (
                        <Box>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => {
                              setEditingPodcast(podcast);
                              setEditFormData({
                                title: podcast.metadata.title,
                                description: podcast.metadata.description,
                                duration: podcast.metadata.duration,
                                author: podcast.metadata.author || '',
                              });
                              setSelectedImageFile(null);
                              setImagePreview(podcast.metadata.image || '');
                              setSelectedAudioFile(null);
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(podcast.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      )}
                    </Box>
                    
                    <Typography component="h3" variant="h5" sx={{ mb: 1 }}>
                      {podcast.metadata.title}
                    </Typography>
                    
                    <Stack direction="row" spacing={2} sx={{ mb: 2 }} flexWrap="wrap">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CalendarTodayIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {format(new Date(podcast.metadata.date), 'MMMM d, yyyy')}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AccessTimeIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {podcast.metadata.duration}
                        </Typography>
                      </Box>
                    </Stack>
                    
                    <Typography variant="body1" color="text.secondary" paragraph>
                      {podcast.metadata.description}
                    </Typography>
                    
                    {podcast.metadata.keywords && podcast.metadata.keywords.length > 0 && (
                      <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {podcast.metadata.keywords.map((keyword, index) => (
                          <Chip
                            key={index}
                            label={keyword}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    )}
                  </CardContent>
                  
                  <Box sx={{ px: 2, pb: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={<PlayArrowIcon />}
                      component="a"
                      href={podcast.metadata.audioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      fullWidth
                      sx={{ maxWidth: { md: 200 } }}
                    >
                      Listen Now
                    </Button>
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Edit Dialog */}
      <Dialog
        open={!!editingPodcast}
        onClose={() => setEditingPodcast(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Podcast</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Title"
              value={editFormData.title}
              onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={4}
              value={editFormData.description}
              onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
            />
            <TextField
              fullWidth
              label="Duration"
              placeholder="45:30"
              value={editFormData.duration}
              onChange={(e) => setEditFormData({ ...editFormData, duration: e.target.value })}
            />
            <TextField
              fullWidth
              label="Author"
              value={editFormData.author}
              onChange={(e) => setEditFormData({ ...editFormData, author: e.target.value })}
            />
            
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Cover Image
              </Typography>
              {imagePreview && (
                <Box sx={{ mb: 2, textAlign: 'center' }}>
                  <img 
                    src={imagePreview} 
                    alt="Current cover" 
                    style={{ maxWidth: '200px', borderRadius: '8px' }}
                  />
                </Box>
              )}
              <Button
                component="label"
                variant="outlined"
                startIcon={<UploadIcon />}
                fullWidth
              >
                {selectedImageFile ? selectedImageFile.name : 'Change Cover Image (Optional)'}
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSelectedImageFile(file);
                      // Create preview URL
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setImagePreview(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </Button>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Audio File
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Current: {editingPodcast?.metadata.audioUrl ? 'Audio file exists' : 'No audio file'}
              </Typography>
              <Button
                component="label"
                variant="outlined"
                startIcon={<UploadIcon />}
                fullWidth
                color={selectedAudioFile ? 'success' : 'primary'}
              >
                {selectedAudioFile ? `Selected: ${selectedAudioFile.name}` : 'Change Audio File (Optional)'}
                <input
                  type="file"
                  accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/x-m4a"
                  hidden
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSelectedAudioFile(file);
                    }
                  }}
                />
              </Button>
              {selectedAudioFile && (
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                  Size: {(selectedAudioFile.size / (1024 * 1024)).toFixed(2)} MB
                </Typography>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setEditingPodcast(null);
            setSelectedImageFile(null);
            setImagePreview('');
            setSelectedAudioFile(null);
          }}>Cancel</Button>
          <Button onClick={handleUpdate} variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
