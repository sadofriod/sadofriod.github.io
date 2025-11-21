'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Chip,
} from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';
import type { Podcast } from '@/lib/podcasts';

interface PodcastEditDialogProps {
  podcast: Podcast | null;
  open: boolean;
  onClose: () => void;
  onSave: (formData: FormData) => Promise<void>;
}

export default function PodcastEditDialog({
  podcast,
  open,
  onClose,
  onSave,
}: PodcastEditDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    author: '',
    episodeNumber: '',
    season: '',
    keywords: '',
    explicit: false,
  });
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [selectedAudioFile, setSelectedAudioFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (podcast) {
      setFormData({
        title: podcast.metadata.title,
        description: podcast.metadata.description,
        duration: podcast.metadata.duration,
        author: podcast.metadata.author || '',
        episodeNumber: podcast.metadata.episodeNumber?.toString() || '',
        season: podcast.metadata.season?.toString() || '',
        keywords: podcast.metadata.keywords?.join(', ') || '',
        explicit: podcast.metadata.explicit || false,
      });
      setImagePreview(podcast.metadata.image || '');
      setSelectedImageFile(null);
      setSelectedAudioFile(null);
    }
  }, [podcast]);

  const handleClose = () => {
    setSelectedImageFile(null);
    setImagePreview('');
    setSelectedAudioFile(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (!podcast) return;

    setSaving(true);
    try {
      const authKey =
        new URLSearchParams(window.location.search).get('authKey') ||
        sessionStorage.getItem('upload_auth');

      const data = new FormData();
      data.append('authKey', authKey || '');
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('duration', formData.duration);
      data.append('author', formData.author);
      data.append('episodeNumber', formData.episodeNumber);
      data.append('season', formData.season);
      data.append('keywords', formData.keywords);
      data.append('explicit', formData.explicit.toString());

      if (selectedImageFile) {
        data.append('image', selectedImageFile);
      }

      if (selectedAudioFile) {
        data.append('audio', selectedAudioFile);
      }

      await onSave(data);
      handleClose();
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Podcast</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <TextField
            fullWidth
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
          
          <TextField
            fullWidth
            label="Duration"
            placeholder="45:30"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            required
          />
          
          <TextField
            fullWidth
            label="Author"
            value={formData.author}
            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              label="Episode Number"
              type="number"
              value={formData.episodeNumber}
              onChange={(e) => setFormData({ ...formData, episodeNumber: e.target.value })}
            />
            <TextField
              fullWidth
              label="Season"
              type="number"
              value={formData.season}
              onChange={(e) => setFormData({ ...formData, season: e.target.value })}
            />
          </Box>

          <TextField
            fullWidth
            label="Keywords"
            placeholder="technology, programming, software (comma separated)"
            value={formData.keywords}
            onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
            helperText="Enter keywords separated by commas"
          />

          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <input
                type="checkbox"
                id="edit-explicit"
                checked={formData.explicit}
                onChange={(e) => setFormData({ ...formData, explicit: e.target.checked })}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
              <label htmlFor="edit-explicit" style={{ cursor: 'pointer' }}>
                <Typography variant="body1">Explicit Content</Typography>
                <Typography variant="caption" color="text.secondary">
                  Check this if the podcast contains explicit language or adult content
                </Typography>
              </label>
            </Box>
          </Box>

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
              {selectedImageFile
                ? selectedImageFile.name
                : 'Change Cover Image (Optional)'}
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setSelectedImageFile(file);
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
              Current: {podcast?.metadata.audioUrl ? 'Audio file exists' : 'No audio file'}
            </Typography>
            <Button
              component="label"
              variant="outlined"
              startIcon={<UploadIcon />}
              fullWidth
              color={selectedAudioFile ? 'success' : 'primary'}
            >
              {selectedAudioFile
                ? `Selected: ${selectedAudioFile.name}`
                : 'Change Audio File (Optional)'}
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
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                sx={{ mt: 1 }}
              >
                Size: {(selectedAudioFile.size / (1024 * 1024)).toFixed(2)} MB
              </Typography>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
