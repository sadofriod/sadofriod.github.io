'use client';
import { Box, Typography, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import { useEffect, useState } from 'react';

interface TOCItem {
  text: string;
  level: number;
}

interface TOCProps {
  content: string;
}

export default function TOC({ content }: TOCProps) {
  const [tocItems, setTocItems] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [isFixed, setIsFixed] = useState<boolean>(false);
  const [originalTop, setOriginalTop] = useState<number>(0);

  // Generate heading ID from text (same logic as in the blog post page)
  const generateHeadingId = (text: string) => {
    return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
  };

  useEffect(() => {
    // Extract headings from markdown content
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    const items: TOCItem[] = [];
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length;
      const text = match[2].trim();

      items.push({ text, level });
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

    // Handle initial URL hash on page load
    if (window.location.hash) {
      const hashId = window.location.hash.substring(1);
      const element = document.getElementById(hashId);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setActiveId(hashId);
        }, 100);
      }
    }

    return () => observer.disconnect();
  }, [tocItems]);

  useEffect(() => {
    // Monitor scroll to determine if TOC should be fixed
    const handleScroll = () => {
      // Calculate if we should fix the TOC based on scroll position
      const scrollY = window.scrollY;
      
      // If we haven't recorded the original top position, or if we're near the top
      if (originalTop === 0 && scrollY < 200) {
        const tocContainer = document.querySelector('[data-toc-container]');
        if (tocContainer) {
          const rect = tocContainer.getBoundingClientRect();
          setOriginalTop(rect.top + scrollY);
        }
        return;
      }

      // Fix TOC when we've scrolled past its original position
      const shouldBeFixed = scrollY > originalTop - 120;
      setIsFixed(shouldBeFixed);
    };

    // Initial setup
    const setupOriginalPosition = () => {
      const tocContainer = document.querySelector('[data-toc-container]');
      if (tocContainer && originalTop === 0) {
        const rect = tocContainer.getBoundingClientRect();
        setOriginalTop(rect.top + window.scrollY);
      }
    };

    // Setup with a slight delay to ensure DOM is ready
    setTimeout(setupOriginalPosition, 100);
    
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', setupOriginalPosition);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', setupOriginalPosition);
    };
  }, [tocItems, originalTop]);

  const handleClick = (text: string) => {
    // Generate the same slug ID as used in the blog post page
    const slug = generateHeadingId(text);

    // Try to find by the generated ID first
    let element = document.getElementById(slug);
    
    // If not found by ID, search for heading by text content
    if (!element) {
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      element = Array.from(headings).find(heading =>
        heading.textContent?.includes(text)
      ) as HTMLElement;
    }

    console.log(`Scrolling to element with text: ${text}`, element);

    if (element) {
      // Ensure the element has the correct ID for URL anchoring
      if (!element.id) {
        element.id = slug;
      }
      
      // Update URL with anchor
      const url = new URL(window.location.href);
      url.hash = `#${element.id}`;
      window.history.pushState({}, '', url.toString());
      
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Update active ID for highlighting
      setActiveId(element.id);
    }
  };

  if (tocItems.length === 0) return null;
  return (
    <Box
      data-toc-container="true"
      sx={{
        position: isFixed ? 'fixed' : 'sticky',
        top: isFixed ? 20 : 20,
        right: isFixed ? 20 : 'auto',
        maxHeight: isFixed ? 'calc(100vh - 40px)' : 'calc(100vh - 40px)',
        overflowY: 'auto',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        backgroundColor: 'background.paper',
        p: 2,
        display: { xs: 'none', lg: 'block' },
        minWidth: isFixed ? 250 : 50,
        width: isFixed ? 'auto' : '100%',
        zIndex: isFixed ? 1000 : 'auto',
        boxShadow: isFixed ? '0 4px 20px rgba(0, 0, 0, 0.15)' : 'none',
        transition: 'all 0.3s ease-in-out',
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem', fontWeight: 600 }}>
        Table of Contents
      </Typography>
      <List dense sx={{ py: 0 }}>
        {tocItems.map((item) => {
          const itemId = generateHeadingId(item.text);
          return (
            <ListItem key={item.text} sx={{ py: 0, pl: (item.level - 1) * 2 }}>
              <ListItemButton
                onClick={() => handleClick(item.text)}
                sx={{
                  borderRadius: 1,
                  py: 0.5,
                  px: 1,
                  minHeight: 'auto',
                  backgroundColor: activeId === itemId ? 'action.selected' : 'transparent',
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
                      color: activeId === itemId ? 'primary.main' : 'text.primary',
                    }
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
}
