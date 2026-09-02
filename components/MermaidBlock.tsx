'use client';

import React, { useState, useEffect, useRef, useId } from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  Typography,
  CircularProgress,
  useTheme,
  Alert,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import CodeIcon from '@mui/icons-material/Code';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

const MermaidContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  margin: theme.spacing(2.5, 0),
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#ffffff',
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

const MermaidHeader = styled(Box)(({ theme }) => ({
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

const DiagramWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  overflowX: 'auto',
  padding: theme.spacing(3, 2),
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: 120,
  backgroundColor: theme.palette.mode === 'dark' ? '#18181b' : '#ffffff',
  '& svg': {
    maxWidth: '100%',
    height: 'auto !important',
    display: 'block',
    margin: '0 auto',
  },
}));

interface MermaidBlockProps {
  chart: string;
  className?: string;
}

export const MermaidBlock: React.FC<MermaidBlockProps> = ({ chart }) => {
  const [svgHtml, setSvgHtml] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showCode, setShowCode] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const theme = useTheme();
  const reactId = useId();
  const containerRef = useRef<HTMLDivElement>(null);

  const cleanChart = chart.trim();

  useEffect(() => {
    let isMounted = true;

    const renderChart = async () => {
      if (!cleanChart) {
        if (isMounted) {
          setLoading(false);
          setSvgHtml('');
        }
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Dynamically import mermaid for client-side rendering only
        const mermaid = (await import('mermaid')).default;

        const isDark = theme.palette.mode === 'dark';
        mermaid.initialize({
          startOnLoad: false,
          theme: isDark ? 'dark' : 'default',
          securityLevel: 'loose',
          fontFamily: theme.typography.fontFamily || 'sans-serif',
          themeVariables: {
            darkMode: isDark,
          },
        });

        // Generate sanitized unique ID for Mermaid render
        const idSafe = `mermaid-${reactId.replace(/[^a-zA-Z0-9_-]/g, '')}-${Math.random().toString(36).substring(2, 7)}`;
        
        const { svg } = await mermaid.render(idSafe, cleanChart);

        if (isMounted) {
          setSvgHtml(svg);
          setError(null);
          setLoading(false);
        }
      } catch (err: unknown) {
        console.error('Mermaid rendering failed:', err);
        if (isMounted) {
          const message = err instanceof Error ? err.message : 'Mermaid diagram syntax error';
          setError(message);
          setLoading(false);
        }
      }
    };

    renderChart();

    return () => {
      isMounted = false;
    };
  }, [cleanChart, theme.palette.mode, reactId]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cleanChart);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy diagram code:', err);
    }
  };

  return (
    <MermaidContainer ref={containerRef}>
      <MermaidHeader>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography
            variant="caption"
            sx={{
              fontFamily: 'monospace',
              textTransform: 'uppercase',
              fontSize: { xs: '0.7rem', sm: '0.75rem' },
              fontWeight: 600,
              color: 'text.secondary',
              letterSpacing: '0.05em',
            }}
          >
            MERMAID
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title={showCode ? 'View Diagram' : 'View Code'}>
            <ActionButton
              onClick={() => setShowCode(!showCode)}
              size="small"
              aria-label={showCode ? 'view diagram' : 'view code'}
            >
              {showCode ? <VisibilityIcon fontSize="small" /> : <CodeIcon fontSize="small" />}
            </ActionButton>
          </Tooltip>

          <Tooltip title={copied ? 'Copied!' : 'Copy code'}>
            <ActionButton onClick={handleCopy} size="small" aria-label="copy code">
              {copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
            </ActionButton>
          </Tooltip>
        </Box>
      </MermaidHeader>

      {showCode ? (
        <SyntaxHighlighter
          language="mermaid"
          style={oneDark}
          customStyle={{
            margin: 0,
            padding: '16px',
            fontSize: '13px',
            lineHeight: '1.4',
            backgroundColor: theme.palette.mode === 'dark' ? '#18181b' : '#282c34',
          }}
          wrapLines
          wrapLongLines
        >
          {cleanChart}
        </SyntaxHighlighter>
      ) : error ? (
        <Box sx={{ p: 2 }}>
          <Alert severity="warning" sx={{ mb: 1.5 }}>
            Mermaid diagram failed to render. Showing source code below.
          </Alert>
          <SyntaxHighlighter
            language="mermaid"
            style={oneDark}
            customStyle={{
              margin: 0,
              padding: '12px 16px',
              fontSize: '13px',
              lineHeight: '1.4',
              backgroundColor: '#282c34',
              borderRadius: '4px',
            }}
            wrapLines
            wrapLongLines
          >
            {cleanChart}
          </SyntaxHighlighter>
        </Box>
      ) : loading ? (
        <DiagramWrapper>
          <CircularProgress size={28} />
        </DiagramWrapper>
      ) : (
        <DiagramWrapper
          dangerouslySetInnerHTML={{ __html: svgHtml }}
        />
      )}
    </MermaidContainer>
  );
};

export default MermaidBlock;
