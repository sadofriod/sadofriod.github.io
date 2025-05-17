'use client';

import type React from 'react';
import { useState } from 'react';
import {
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import TranslateIcon from '@mui/icons-material/Translate';
import CheckIcon from '@mui/icons-material/Check';
import { useLanguage } from '../lib/i18n/LanguageContext';
import { supportedLocales, localeNames, type Locale } from '../lib/i18n/translations';

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageSelect = (language: Locale) => {
    setLocale(language);
    handleClose();
  };

  return (
    <>
      <Button
        color="inherit"
        startIcon={<TranslateIcon />}
        onClick={handleClick}
        aria-controls={open ? 'language-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        {localeNames[locale]}
      </Button>
      <Menu
        id="language-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'language-button',
        }}
      >
        {supportedLocales.map((lang) => (
          <MenuItem
            key={lang}
            onClick={() => handleLanguageSelect(lang)}
            selected={lang === locale}
          >
            {lang === locale && (
              <ListItemIcon>
                <CheckIcon fontSize="small" />
              </ListItemIcon>
            )}
            <ListItemText
              primaryTypographyProps={{
                style: { marginLeft: lang === locale ? 0 : '28px' }
              }}
            >
              {localeNames[lang]}
            </ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
