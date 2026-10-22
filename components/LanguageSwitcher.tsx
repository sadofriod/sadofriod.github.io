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
import { usePathname, useRouter } from 'next/navigation';
import { useLanguage } from '../lib/i18n/LanguageContext';
import { supportedLocales, localeNames, type Locale } from '../lib/i18n/translations';
import postTranslations from '../lib/generated/post-translations.json';

const translationsBySlug = postTranslations as Record<string, Record<string, string>>;

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
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

    // On an article, switch to the same article in the chosen language instead of
    // leaving the visitor on a page in the wrong language.
    const match = pathname?.match(/^\/blog\/(.+)$/);
    if (!match) return;

    const slug = decodeURIComponent(match[1]);
    const target = translationsBySlug[slug]?.[language];
    if (target && target !== slug) {
      router.push(`/blog/${target}`);
    }
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
