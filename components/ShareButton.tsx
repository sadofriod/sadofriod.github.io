'use client';
import { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography
} from '@mui/material';
import ShareIcon from '@mui/icons-material/Share';
import TwitterIcon from '@mui/icons-material/Twitter';
import FacebookIcon from '@mui/icons-material/Facebook';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import LinkIcon from '@mui/icons-material/Link';
import ChatIcon from '@mui/icons-material/Chat';

interface ShareButtonProps {
  title: string;
  url: string;
  text?: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({ title, url, text }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  const [showWeChatDialog, setShowWeChatDialog] = useState(false);
  const open = Boolean(anchorEl);

  const handleClick = async (event: React.MouseEvent<HTMLElement>) => {
    // Try native Web Share API first
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: text || title,
          url,
        });
        return;
      } catch (err) {
        // User cancelled or error occurred, fall back to menu
      }
    }
    
    // Fallback to custom share menu
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setShowCopyAlert(true);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setShowCopyAlert(true);
    }
    handleClose();
  };

  const handleWeChatShare = () => {
    setShowWeChatDialog(true);
    handleClose();
  };

  const generateQRCodeUrl = (text: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`;
  };

  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text || title)}&url=${encodeURIComponent(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
  };

  return (
    <>
      <Tooltip title="Share this post">
        <IconButton
          onClick={handleClick}
          size="small"
          sx={{
            color: 'text.secondary',
            p: { xs: 1, sm: 1 },
            '&:hover': {
              color: 'primary.main',
              transform: 'translateY(-1px)'
            }
          }}
        >
          <ShareIcon sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            minWidth: { xs: 200, sm: 220 },
            maxWidth: { xs: 280, sm: 320 },
          }
        }}
      >
        <MenuItem onClick={() => window.open(shareUrls.twitter, '_blank')}>
          <ListItemIcon>
            <TwitterIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Share on Twitter</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => window.open(shareUrls.facebook, '_blank')}>
          <ListItemIcon>
            <FacebookIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Share on Facebook</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => window.open(shareUrls.linkedin, '_blank')}>
          <ListItemIcon>
            <LinkedInIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Share on LinkedIn</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleWeChatShare}>
          <ListItemIcon>
            <ChatIcon fontSize="small" sx={{ color: '#07C160' }} />
          </ListItemIcon>
          <ListItemText>Share to WeChat</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={handleCopyLink}>
          <ListItemIcon>
            <LinkIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Copy link</ListItemText>
        </MenuItem>
      </Menu>

      {/* WeChat Share Dialog */}
      <Dialog 
        open={showWeChatDialog} 
        onClose={() => setShowWeChatDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            m: { xs: 2, sm: 4 },
            width: { xs: 'calc(100% - 32px)', sm: 'auto' },
          }
        }}
      >
        <DialogTitle sx={{ 
          textAlign: 'center',
          fontSize: { xs: '1.125rem', sm: '1.25rem' },
          py: { xs: 1.5, sm: 2 }
        }}>
          Share to WeChat
        </DialogTitle>
        <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
          <Box sx={{ textAlign: 'center', py: { xs: 1, sm: 2 } }}>
            <img
              src={generateQRCodeUrl(url)}
              alt="QR Code for WeChat sharing"
              style={{ 
                maxWidth: '180px', 
                width: '100%', 
                height: 'auto' 
              }}
            />
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                mt: 2,
                fontSize: { xs: '0.875rem', sm: '0.875rem' }
              }}
            >
              Scan this QR code with WeChat to share
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                mt: 1, 
                fontWeight: 'medium',
                fontSize: { xs: '0.875rem', sm: '0.875rem' }
              }}
            >
              {title}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ 
          justifyContent: 'center', 
          pb: { xs: 2, sm: 2 },
          px: { xs: 2, sm: 3 },
          gap: 1
        }}>
          <Button 
            onClick={handleCopyLink} 
            variant="outlined" 
            size="small"
            sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}
          >
            Copy Link
          </Button>
          <Button 
            onClick={() => setShowWeChatDialog(false)} 
            variant="contained"
            size="small"
            sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={showCopyAlert}
        autoHideDuration={3000}
        onClose={() => setShowCopyAlert(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setShowCopyAlert(false)}>
          Link copied to clipboard!
        </Alert>
      </Snackbar>
    </>
  );
};

export default ShareButton;
