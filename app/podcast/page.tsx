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
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RssFeedIcon from '@mui/icons-material/RssFeed';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import type { Podcast } from '@/lib/podcasts';
import { format } from 'date-fns';

export default function PodcastPage() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        
        {/* RSS Feed Button */}
        <Button
          variant="contained"
          startIcon={<RssFeedIcon />}
          href={rssUrl}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ mt: 2 }}
        >
          Subscribe via RSS
        </Button>
        
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
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
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
    </Container>
  );
}
