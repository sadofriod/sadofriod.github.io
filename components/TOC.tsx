'use client';
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
    <nav data-toc-container="true" aria-label="Table of contents">
      {tocItems.map((item, index) => {
        const itemId = generateHeadingId(item.text);
        // Chinese headings slug to "" (the id regex only keeps \w), so an
        // empty activeId would light up every one of them.
        const isActive = activeId !== '' && activeId === itemId;

        return (
          <a
            key={`${itemId}-${index}`}
            href={`#${itemId}`}
            onClick={(event) => {
              // Keep the existing smooth scroll + history handling in one place.
              event.preventDefault();
              handleClick(item.text);
            }}
            style={{
              paddingLeft: `${(item.level - 1) * 10}px`,
              fontWeight: item.level <= 2 ? 500 : 400,
              ...(isActive ? { background: 'var(--yellow)', fontWeight: 700 } : null),
            }}
          >
            {item.text}
          </a>
        );
      })}
    </nav>
  );
}
