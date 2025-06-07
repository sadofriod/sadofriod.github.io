'use client';
import { styled } from '@mui/material/styles';

const InlineCode = styled('code')(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#2d3748' : '#f7fafc',
  color: theme.palette.mode === 'dark' ? '#e2e8f0' : '#2d3748',
  padding: theme.spacing(0.25, 0.5),
  borderRadius: theme.shape.borderRadius / 2,
  fontSize: '0.875em',
  fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
  border: `1px solid ${theme.palette.divider}`,
}));

export default InlineCode;
