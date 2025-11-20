'use client';

import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useTheme,
  useMediaQuery
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import Link from 'next/link';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from '../lib/i18n/LanguageContext';

export default function MainNavbar() {
  const { t } = useLanguage();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationItems = [
    { label: t('nav.home'), href: '/' },
    { label: t('nav.blog'), href: '/blog' },
    { label: t('nav.podcast'), href: '/podcast' },
    { label: t('nav.about'), href: '/about' }
  ];

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <AppBar position="static" color="transparent" elevation={0}>
        <Container>
          <Toolbar disableGutters>
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                flexGrow: 1,
                fontSize: { xs: '1.1rem', md: '1.25rem' }
              }}
            >
              <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                Ashes Space
              </Link>
            </Typography>

            {isMobile ? (
              <>
                <LanguageSwitcher />
                <IconButton
                  color="inherit"
                  aria-label="open navigation menu"
                  edge="end"
                  onClick={handleMobileMenuToggle}
                  sx={{ ml: 1 }}
                >
                  <MenuIcon />
                </IconButton>
              </>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {navigationItems.map((item) => (
                  <Button 
                    key={item.href}
                    color="inherit" 
                    component={Link} 
                    href={item.href}
                    sx={{ mx: 0.5 }}
                  >
                    {item.label}
                  </Button>
                ))}
                <LanguageSwitcher />
              </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={handleMobileMenuClose}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
            pt: 2
          }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 2, pb: 1 }}>
          <IconButton onClick={handleMobileMenuClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        
        <List>
          {navigationItems.map((item) => (
            <ListItem key={item.href} disablePadding>
              <ListItemButton
                component={Link}
                href={item.href}
                onClick={handleMobileMenuClose}
                sx={{ 
                  py: 2,
                  px: 3,
                  '&:hover': {
                    backgroundColor: 'action.hover'
                  }
                }}
              >
                <ListItemText 
                  primary={item.label} 
                  sx={{ 
                    '& .MuiListItemText-primary': {
                      fontSize: '1.1rem',
                      fontWeight: 500
                    }
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
    </>
  );
}
