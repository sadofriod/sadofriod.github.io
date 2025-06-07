'use client';
import { Box, Typography, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import { useEffect, useState } from 'react';

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface TOCProps {
  content: string;
}

export default function TOC({ content }: TOCProps) {
  const [tocItems, setTocItems] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // Extract headings from markdown content
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    const items: TOCItem[] = [];
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
      
      items.push({ id, text, level });
    }

    setTocItems(items);
  }, [content]);

  useEffect(() => {
    // Track active heading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -80% 0px' }
    );

    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headings.forEach((heading) => {
      if (heading.id) {
        observer.observe(heading);
      }
    });

    return () => observer.disconnect();
  }, [tocItems]);

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (tocItems.length === 0) return null;

  return (
    <Box
      sx={{
        position: 'sticky',
        top: 20,
        maxHeight: 'calc(100vh - 40px)',
        overflowY: 'auto',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        backgroundColor: 'background.paper',
        p: 2,
        display: { xs: 'none', lg: 'block' },
        minWidth: 50,
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem', fontWeight: 600 }}>
        Table of Contents
      </Typography>
      <List dense sx={{ py: 0 }}>
        {tocItems.map((item) => (
          <ListItem key={item.id} sx={{ py: 0, pl: (item.level - 1) * 2 }}>
            <ListItemButton
              onClick={() => handleClick(item.id)}
              sx={{
                borderRadius: 1,
                py: 0.5,
                px: 1,
                minHeight: 'auto',
                backgroundColor: activeId === item.id ? 'action.selected' : 'transparent',
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <ListItemText 
                primary={item.text}
                primaryTypographyProps={{
                  variant: 'body2',
                  sx: {
                    fontSize: item.level === 1 ? '0.875rem' : '0.8125rem',
                    fontWeight: item.level <= 2 ? 500 : 400,
                    color: activeId === item.id ? 'primary.main' : 'text.primary',
                  }
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
