'use client';

import React, { useMemo, useState } from 'react';
import { Box, IconButton, Tooltip, Typography, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import CodeIcon from '@mui/icons-material/Code';
import VisibilityIcon from '@mui/icons-material/Visibility';
import katex from 'katex';

const MathContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  margin: theme.spacing(2.5, 0),
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#fafafa',
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 2px 8px rgba(0, 0, 0, 0.3)' 
    : '0 2px 8px rgba(0, 0, 0, 0.05)',
  [theme.breakpoints.down('sm')]: {
    margin: theme.spacing(1.5, -1),
    borderRadius: 0,
    borderLeft: 'none',
    borderRight: 'none',
  },
}));

const MathHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(0.75, 1.5),
  backgroundColor: theme.palette.mode === 'dark' ? '#2d3748' : '#f8f9fa',
  borderBottom: `1px solid ${theme.palette.divider}`,
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(0.5, 1),
  },
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  padding: theme.spacing(0.5),
  marginLeft: theme.spacing(0.5),
  color: theme.palette.text.secondary,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    color: theme.palette.text.primary,
  },
}));

interface MathBlockProps {
  math: string;
  className?: string;
  displayMode?: boolean;
}

export default function MathBlock({ math, className, displayMode = true }: MathBlockProps) {
  const [copied, setCopied] = useState(false);
  const [showSource, setShowSource] = useState(false);
  const theme = useTheme();

  const renderedHtml = useMemo(() => {
    try {
      return katex.renderToString(math, {
        displayMode,
        throwOnError: false,
      });
    } catch {
      return '';
    }
  }, [math, displayMode]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(math);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy LaTeX code:', err);
    }
  };

  return (
    <MathContainer className={className}>
      <MathHeader>
        <Typography 
          variant="caption" 
          sx={{ 
            color: 'text.secondary',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          LaTeX Math
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title={showSource ? 'Show Math' : 'Show LaTeX Code'}>
            <ActionButton 
              size="small" 
              onClick={() => setShowSource(!showSource)}
              aria-label={showSource ? 'Show Math' : 'Show LaTeX Code'}
            >
              {showSource ? (
                <VisibilityIcon sx={{ fontSize: '1.1rem' }} />
              ) : (
                <CodeIcon sx={{ fontSize: '1.1rem' }} />
              )}
            </ActionButton>
          </Tooltip>

          <Tooltip title={copied ? 'Copied!' : 'Copy LaTeX'}>
            <ActionButton 
              size="small" 
              onClick={handleCopy}
              aria-label="Copy LaTeX code"
            >
              {copied ? (
                <CheckIcon sx={{ fontSize: '1.1rem', color: theme.palette.success.main }} />
              ) : (
                <ContentCopyIcon sx={{ fontSize: '1.1rem' }} />
              )}
            </ActionButton>
          </Tooltip>
        </Box>
      </MathHeader>

      <Box sx={{ p: { xs: 2, sm: 3 }, overflowX: 'auto' }}>
        {showSource ? (
          <Box 
            component="pre" 
            sx={{ 
              m: 0, 
              fontFamily: 'monospace', 
              fontSize: '0.875rem',
              color: 'text.primary',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {math}
          </Box>
        ) : (
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'center',
              alignItems: 'center',
              py: 1,
              '& .katex-display': {
                my: 0,
              }
            }}
            dangerouslySetInnerHTML={{ __html: renderedHtml }}
          />
        )}
      </Box>
    </MathContainer>
  );
}
