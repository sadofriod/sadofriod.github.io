'use client';

import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Container,
  Box
} from '@mui/material';
import Link from 'next/link';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from '../lib/i18n/LanguageContext';

export default function MainNavbar() {
  const { t } = useLanguage();
  
  return (
    <AppBar position="static" color="transparent" elevation={0}>
      <Container>
        <Toolbar disableGutters>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              Ashes Space
            </Link>
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button color="inherit" component={Link} href="/">
              {t('nav.home')}
            </Button>
            <Button color="inherit" component={Link} href="/blog">
              {t('nav.blog')}
            </Button>
            <Button color="inherit" component={Link} href="/about">
              {t('nav.about')}
            </Button>
            <LanguageSwitcher />
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
