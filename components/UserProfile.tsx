'use client';
import { 
  Box, 
  Typography, 
  Avatar, 
  Card, 
  CardContent, 
  Divider, 
  Link as MuiLink, 
  Stack,
  IconButton,
  Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import GitHubIcon from '@mui/icons-material/GitHub';
import TwitterIcon from '@mui/icons-material/Twitter';
import EmailIcon from '@mui/icons-material/Email';
import { useLanguage } from '../lib/i18n/LanguageContext';

const ProfileCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  overflow: 'visible',
  position: 'relative',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

const AvatarWrapper = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  marginTop: '-50px',
  marginBottom: theme.spacing(2)
}));

const LargeAvatar = styled(Avatar)(({ theme }) => ({
  width: 100,
  height: 100,
  border: `4px solid ${theme.palette.background.paper}`,
  boxShadow: theme.shadows[2],
}));

const SocialButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.text.secondary,
  transition: 'all 0.2s',
  '&:hover': {
    color: theme.palette.primary.main,
    transform: 'translateY(-2px)'
  }
}));

interface ProfileProps {
  name: string;
  avatar: string;
  bio: string;
  title?: string;
  company?: string;
  social?: {
    github?: string;
    twitter?: string;
    linkedin?: string;
    email?: string;
  };
}

const Profile: React.FC<ProfileProps> = ({ 
  name, 
  avatar, 
  bio, 
  title, 
  company, 
  social 
}) => {
  const { t } = useLanguage();
  
  return (
    <ProfileCard elevation={1}>
      <Box sx={{ bgcolor: 'primary.main', height: 60, borderRadius: '16px 16px 0 0' }} />
      <CardContent sx={{ pt: 0 }}>
        <AvatarWrapper>
          <LargeAvatar src={avatar} alt={name} />
        </AvatarWrapper>
        
        <Typography variant="h5" component="h2" align="center" fontWeight={700} sx={{ mb: 1 }}>
          {name}
        </Typography>
        
        {(title || company) && (
          <Typography 
            variant="subtitle1" 
            align="center" 
            color="text.secondary" 
            sx={{ mb: 2, fontWeight: 500 }}
          >
            {title} {title && company && <span>{t('profile.at')}</span>} {company}
          </Typography>
        )}
        
        <Typography 
          variant="body2" 
          align="center" 
          sx={{ mb: 2, px: 1, maxWidth: '600px', mx: 'auto', lineHeight: 1.6 }}
        >
          {bio}
        </Typography>
        
        {social && Object.values(social).some(link => !!link) && (
          <>
            <Divider sx={{ my: 2 }} />
            <Stack direction="row" spacing={1} justifyContent="center">
              {social.github && (
                <Tooltip title="GitHub">
                  <MuiLink href={social.github} target="_blank">
                    <SocialButton 
                      rel="noopener noreferrer"
                      aria-label="GitHub"
                    >
                      <GitHubIcon />
                    </SocialButton>
                  </MuiLink>
                </Tooltip>
              )}
              {social.twitter && (
                <Tooltip title="Twitter">
                  <MuiLink href={`https://twitter.com/${social.twitter}`} target="_blank">
                    <SocialButton 
                      rel="noopener noreferrer"
                      aria-label="Twitter"
                    >
                      <TwitterIcon />
                    </SocialButton>
                  </MuiLink>
                </Tooltip>
              )}

              {social.email && (
                <Tooltip title={t('profile.emailMe')}>
                  <MuiLink href={`mailto:${social.email}`}>
                    <SocialButton 
                      rel="noopener noreferrer"
                      aria-label="Email"
                    >
                      <EmailIcon />
                    </SocialButton>
                  </MuiLink>
                </Tooltip>
              )}
            </Stack>
          </>
        )}
      </CardContent>
    </ProfileCard>
  );
};

export default Profile;