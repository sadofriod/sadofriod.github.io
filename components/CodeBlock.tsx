'use client';
import { useState } from 'react';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

const CodeContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  margin: theme.spacing(2, 0),
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: '#282c34',
  [theme.breakpoints.down('sm')]: {
    margin: theme.spacing(1.5, -1),
    borderRadius: 0,
    border: 'none',
    borderTop: `1px solid ${theme.palette.divider}`,
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
}));

const CodeHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(1, 2),
  backgroundColor: '#21252b',
  borderBottom: `1px solid ${theme.palette.divider}`,
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(0.75, 1.5),
  },
}));

const CopyButton = styled(IconButton)(({ theme }) => ({
  color: '#abb2bf',
  padding: theme.spacing(0.5),
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
}));

interface CodeBlockProps {
  children: string;
  className?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ children, className }) => {
  const [copied, setCopied] = useState(false);
  
  // Extract language from className (format: language-javascript)
  const language = className?.replace('language-', '') || 'text';
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <CodeContainer>
      <CodeHeader>
        <Typography 
          variant="caption" 
          sx={{ 
            color: '#abb2bf', 
            fontFamily: 'monospace',
            textTransform: 'uppercase',
            fontSize: { xs: '0.7rem', sm: '0.75rem' },
            fontWeight: 500
          }}
        >
          {language}
        </Typography>
        <Tooltip title={copied ? 'Copied!' : 'Copy code'}>
          <CopyButton onClick={handleCopy} size="small">
            {copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
          </CopyButton>
        </Tooltip>
      </CodeHeader>
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        customStyle={{
          margin: 0,
          padding: '12px 16px',
          fontSize: '13px',
          lineHeight: '1.4',
          backgroundColor: '#282c34',
        }}
        showLineNumbers={false} // Disable line numbers on mobile for better readability
        wrapLines
        wrapLongLines
      >
        {children}
      </SyntaxHighlighter>
    </CodeContainer>
  );
};

export default CodeBlock;
