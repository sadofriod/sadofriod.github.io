import { Container, Typography, Box, Chip, Stack, Divider } from '@mui/material';
import { getAllPostIds, getPostBySlug, getPostData } from '../../../lib/posts';
import type { Metadata } from 'next';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeKatex from 'rehype-katex';
import ShareButton from '../../../components/ShareButton';
import CodeBlock from '../../../components/CodeBlock';
import InlineCode from '../../../components/InlineCode';
import MermaidBlock from '../../../components/MermaidBlock';
import MathBlock from '../../../components/MathBlock';
import TOC from '../../../components/TOC';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const { metadata } = getPostBySlug(decodedSlug);

  return {
    title: metadata.title,
    description: metadata.excerpt || metadata.title,
    keywords: metadata.keywords,
  };
}

export async function generateStaticParams() {
  const posts = getAllPostIds();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export const dynamicParams = false;

export default async function BlogPost({ params }: PageProps) {
  const { slug: routeSlug } = await params;
  const decodedSlug = decodeURIComponent(routeSlug);
  const { content, slug, ...metadata } = getPostData(decodedSlug);
  const postUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://blog.ashesborn.cloud'}/blog/${routeSlug}`;

  // Generate heading ID from text
  const generateHeadingId = (text: string) => {
    return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
  };

  return (
    <Box sx={{
      display: 'flex',
      gap: { xs: 0, md: 3, lg: 4 },
      alignItems: 'flex-start',
      maxWidth: '100vw',
      overflow: 'hidden',
    }}>
      {/* Main Content Container */}
      <Container 
        sx={{ 
          px: { xs: 2, sm: 3, md: 2 },
          flex: 1,
          minWidth: 0,
          maxWidth: { xs: '100%', lg: 'calc(100% - 280px)' }
        }} 
        maxWidth={false}
      >
        <Box sx={{ 
          maxWidth: '800px',
          mx: { xs: 0, lg: 'auto' },
          width: '100%'
        }}>
          <Box sx={{ my: { xs: 2, sm: 4 } }}>
            {/* Header Section */}
            <Box sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', sm: 'flex-start' },
              mb: { xs: 2, sm: 3 },
              gap: { xs: 2, sm: 0 }
            }}>
              <Typography
                variant="h3"
                component="h1"
                sx={{
                  flex: 1,
                  pr: { xs: 0, sm: 2 },
                  fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' },
                  lineHeight: { xs: 1.2, sm: 1.167 },
                  fontWeight: { xs: 600, sm: 500 },
                  mb: { xs: 1, sm: 0 }
                }}
              >
                {metadata.title}
              </Typography>
              <Box sx={{
                alignSelf: { xs: 'flex-start', sm: 'flex-start' },
                mt: { xs: 0, sm: 0.5 }
              }}>
                <ShareButton
                  title={metadata.title}
                  url={postUrl}
                  text={`Check out this blog post: ${metadata.title}`}
                />
              </Box>
            </Box>

            {/* Meta Information */}
            <Box sx={{ mb: { xs: 2, sm: 3 } }}>
              <Typography
                variant="subtitle1"
                color="text.secondary"
                sx={{ 
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  mb: { xs: 1, sm: 1.5 }
                }}
              >
                {new Date(metadata.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Typography>

              {metadata.tags && metadata.tags.length > 0 && (
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{
                    flexWrap: 'wrap',
                    gap: { xs: 0.5, sm: 1 }
                  }}
                >
                  {Array.isArray(metadata.tags) ?
                    metadata.tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        variant="outlined"
                        sx={{ 
                          fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                          height: { xs: '24px', sm: '28px' }
                        }}
                      />
                    )) :
                    <Chip
                      label={metadata.tags}
                      size="small"
                      variant="outlined"
                      sx={{ 
                        fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                        height: { xs: '24px', sm: '28px' }
                      }}
                    />
                  }
                </Stack>
              )}
            </Box>

            <Divider sx={{ my: { xs: 2, sm: 3 } }} />

            {/* Article Content */}
            <Box
              className="markdown-content"
              sx={{
                mt: { xs: 2, sm: 3 },
                '& p': {
                  fontSize: { xs: '1rem', sm: '1.125rem' },
                  lineHeight: { xs: 1.6, sm: 1.7 },
                  mb: { xs: 1.5, sm: 2 },
                  color: 'text.primary',
                },
                '& h1, & h2, & h3, & h4, & h5, & h6': {
                  mt: { xs: 2.5, sm: 3.5 },
                  mb: { xs: 1.5, sm: 2 },
                  color: 'text.primary',
                  fontWeight: 600,
                },
                '& h1': {
                  fontSize: { xs: '1.75rem', sm: '2.125rem' },
                  borderBottom: '2px solid',
                  borderColor: 'divider',
                  pb: 1,
                },
                '& h2': {
                  fontSize: { xs: '1.5rem', sm: '1.875rem' },
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  pb: 0.5,
                },
                '& h3': {
                  fontSize: { xs: '1.25rem', sm: '1.5rem' },
                },
                '& h4': {
                  fontSize: { xs: '1.125rem', sm: '1.25rem' },
                },
                '& h5': {
                  fontSize: { xs: '1rem', sm: '1.125rem' },
                },
                '& h6': {
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                },
                '& ul, & ol': {
                  pl: { xs: 2, sm: 3 },
                  mb: { xs: 1.5, sm: 2 },
                },
                '& li': {
                  mb: { xs: 0.5, sm: 0.75 },
                  fontSize: { xs: '1rem', sm: '1.125rem' },
                  lineHeight: { xs: 1.6, sm: 1.7 },
                },
                '& blockquote': {
                  borderLeft: '4px solid',
                  borderColor: 'primary.main',
                  pl: { xs: 1.5, sm: 2 },
                  py: { xs: 0.5, sm: 1 },
                  my: { xs: 1.5, sm: 2 },
                  fontStyle: 'italic',
                  backgroundColor: 'grey.50',
                },
                '& img': {
                  maxWidth: '100%',
                  height: 'auto',
                  borderRadius: 1,
                  my: { xs: 1.5, sm: 2 },
                },
                '& table': {
                  width: '100%',
                  overflowX: 'auto',
                  display: { xs: 'block', sm: 'table' },
                  whiteSpace: { xs: 'nowrap', sm: 'normal' },
                  borderCollapse: 'collapse',
                  '& th, & td': {
                    border: '1px solid',
                    borderColor: 'divider',
                    padding: { xs: '8px', sm: '12px' },
                    textAlign: 'left',
                  },
                  '& th': {
                    backgroundColor: 'grey.100',
                    fontWeight: 600,
                  },
                },
                // HTML element styles
                '& div': {
                  mb: { xs: 1, sm: 1.5 },
                },
                '& span': {
                  fontSize: 'inherit',
                },
                '& strong, & b': {
                  fontWeight: 600,
                },
                '& em, & i': {
                  fontStyle: 'italic',
                },
                '& hr': {
                  border: 'none',
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  my: { xs: 2, sm: 3 },
                },
                '& details': {
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: { xs: 1, sm: 1.5 },
                  my: { xs: 1.5, sm: 2 },
                  '& summary': {
                    cursor: 'pointer',
                    fontWeight: 600,
                    mb: 1,
                    '&:hover': {
                      color: 'primary.main',
                    },
                  },
                },
                '& mark': {
                  backgroundColor: 'warning.light',
                  padding: '2px 4px',
                  borderRadius: '2px',
                },
                '& kbd': {
                  backgroundColor: 'grey.100',
                  border: '1px solid',
                  borderColor: 'grey.300',
                  borderRadius: '4px',
                  padding: '2px 6px',
                  fontSize: '0.875em',
                  fontFamily: 'monospace',
                },
                '& .katex-display': {
                  my: { xs: 2, sm: 2.5 },
                  py: 1,
                  overflowX: 'auto',
                  overflowY: 'hidden',
                },
                '& .katex': {
                  fontSize: '1.05em',
                },
              }}
            >
              <ReactMarkdown
                remarkPlugins={[
                  remarkGfm,
                  remarkMath
                ]}
                rehypePlugins={[
                  rehypeRaw,
                  rehypeSanitize,
                  [rehypeKatex, { strict: false }]
                ]}
                components={{
                  code: ({ node, className, children, ...props }: any) => {
                    const match = /language-(\w+)/.exec(className || '');
                    const language = match ? match[1] : (className?.replace('language-', '') || '');
                    const codeContent = String(children).replace(/\n$/, '');
                    if (language === 'mermaid') {
                      return <MermaidBlock chart={codeContent} className={className} />;
                    }
                    if (language === 'latex' || language === 'math' || language === 'katex') {
                      return <MathBlock math={codeContent} className={className} />;
                    }
                    if (!match && !String(children).includes('\n')) {
                      return <InlineCode {...props}>{children}</InlineCode>;
                    }
                    return (
                      <CodeBlock className={className}>
                        {codeContent}
                      </CodeBlock>
                    );
                  },
                  pre: ({ children }) => <Box component='pre'>{children}</Box>,
                  // Add heading components with IDs for TOC
                  h1: ({ node, children, ...props }: any) => {
                    const text = String(children);
                    const id = generateHeadingId(text);
                    return (
                      <Typography 
                        variant="h1" 
                        component="h1" 
                        id={id} 
                        sx={{ 
                          scrollMarginTop: { xs: '80px', md: '100px' },
                          '&:hover': {
                            '&::before': {
                              content: '"#"',
                              position: 'absolute',
                              left: '-20px',
                              color: 'primary.main',
                              opacity: 0.7,
                            }
                          },
                          position: 'relative'
                        }} 
                        {...props}
                      >
                        {children}
                      </Typography>
                    );
                  },
                  h2: ({ node, children, ...props }: any) => {
                    const text = String(children);
                    const id = generateHeadingId(text);
                    return (
                      <Typography 
                        variant="h2" 
                        component="h2" 
                        id={id} 
                        sx={{ 
                          scrollMarginTop: { xs: '80px', md: '100px' },
                          '&:hover': {
                            '&::before': {
                              content: '"#"',
                              position: 'absolute',
                              left: '-20px',
                              color: 'primary.main',
                              opacity: 0.7,
                            }
                          },
                          position: 'relative'
                        }} 
                        {...props}
                      >
                        {children}
                      </Typography>
                    );
                  },
                  h3: ({ node, children, ...props }: any) => {
                    const text = String(children);
                    const id = generateHeadingId(text);
                    return (
                      <Typography 
                        variant="h3" 
                        component="h3" 
                        id={id} 
                        sx={{ 
                          scrollMarginTop: { xs: '80px', md: '100px' },
                          '&:hover': {
                            '&::before': {
                              content: '"#"',
                              position: 'absolute',
                              left: '-20px',
                              color: 'primary.main',
                              opacity: 0.7,
                            }
                          },
                          position: 'relative'
                        }} 
                        {...props}
                      >
                        {children}
                      </Typography>
                    );
                  },
                  h4: ({ node, children, ...props }: any) => {
                    const text = String(children);
                    const id = generateHeadingId(text);
                    return (
                      <Typography 
                        variant="h4" 
                        component="h4" 
                        id={id} 
                        sx={{ 
                          scrollMarginTop: { xs: '80px', md: '100px' },
                          position: 'relative'
                        }} 
                        {...props}
                      >
                        {children}
                      </Typography>
                    );
                  },
                  h5: ({ node, children, ...props }: any) => {
                    const text = String(children);
                    const id = generateHeadingId(text);
                    return (
                      <Typography 
                        variant="h5" 
                        component="h5" 
                        id={id} 
                        sx={{ 
                          scrollMarginTop: { xs: '80px', md: '100px' },
                          position: 'relative'
                        }} 
                        {...props}
                      >
                        {children}
                      </Typography>
                    );
                  },
                  h6: ({ node, children, ...props }: any) => {
                    const text = String(children);
                    const id = generateHeadingId(text);
                    return (
                      <Typography 
                        variant="h6" 
                        component="h6" 
                        id={id} 
                        sx={{ 
                          scrollMarginTop: { xs: '80px', md: '100px' },
                          position: 'relative'
                        }} 
                        {...props}
                      >
                        {children}
                      </Typography>
                    );
                  },
                }}
              >
                {content}
              </ReactMarkdown>
            </Box>
          </Box>
        </Box>
      </Container>

      {/* TOC Sidebar - Enhanced positioning */}
      <Box sx={{ 
        display: { xs: 'none', lg: 'block' },
        flexShrink: 0,
        width: '280px',
        position: 'sticky',
        top: '100px',
        alignSelf: 'flex-start',
        // maxHeight: 'calc(100vh - 120px)',
        overflow: 'auto',
        pl: 2,
        borderLeft: '1px solid',
        borderColor: 'divider',
        height: '100%',
      }}>
        <TOC content={content} />
      </Box>
    </Box>
  );
}
