import { Container, Typography, Box, Chip, Stack, Divider } from '@mui/material';
import { getAllPostIds, getPostBySlug, getPostData } from '../../../lib/posts';
import type { Metadata } from 'next';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import ShareButton from '../../../components/ShareButton';
import CodeBlock from '../../../components/CodeBlock';
import InlineCode from '../../../components/InlineCode';
import TOC from '../../../components/TOC';
import 'katex/dist/katex.min.css';
import { PluggableList } from 'react-markdown/lib/react-markdown';

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { metadata } = getPostBySlug(decodeURI(params.slug));

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

export default function BlogPost({ params }: PageProps) {
  const { content, slug, ...metadata } = getPostData(decodeURI(params.slug));
  const postUrl = `${process.env.SITE_URL || 'http://blog.ashesborn.cloud'}/blog/${params.slug}`;

  // Generate heading ID from text
  const generateHeadingId = (text: string) => {
    return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
  };

  return (
    <Box sx={{
      display: 'flex',
      gap: { xs: 0, lg: 4 },
      alignItems: 'flex-start',
    }}>
      <Container sx={{ px: { xs: 2, sm: 3 } }} maxWidth="lg">

        {/* Main content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ my: { xs: 2, sm: 4 } }}>
            <Box sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', sm: 'flex-start' },
              mb: { xs: 1, sm: 2 },
              gap: { xs: 1, sm: 0 }
            }}>
              <Typography
                variant="h3"
                component="h1"
                sx={{
                  flex: 1,
                  pr: { xs: 0, sm: 2 },
                  fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' },
                  lineHeight: { xs: 1.2, sm: 1.167 },
                  fontWeight: { xs: 600, sm: 400 }
                }}
              >
                {metadata.title}
              </Typography>
              <Box sx={{
                alignSelf: { xs: 'flex-end', sm: 'flex-start' },
                mt: { xs: -0.5, sm: 0 }
              }}>
                <ShareButton
                  title={metadata.title}
                  url={postUrl}
                  text={`Check out this blog post: ${metadata.title}`}
                />
              </Box>
            </Box>

            <Typography
              variant="subtitle1"
              color="text.secondary"
              gutterBottom
              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
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
                  my: { xs: 1.5, sm: 2 },
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
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.8125rem' } }}
                    />
                  )) :
                  <Chip
                    label={metadata.tags}
                    size="small"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.8125rem' } }}
                  />
                }
              </Stack>
            )}

            <Divider sx={{ my: { xs: 2, sm: 3 } }} />

            <Box
              className="markdown-content"
              sx={{
                mt: { xs: 2, sm: 4 },
                '& p': {
                  fontSize: { xs: '1rem', sm: '1.125rem' },
                  lineHeight: { xs: 1.6, sm: 1.7 },
                  mb: { xs: 1.5, sm: 2 },
                },
                '& h1, & h2, & h3, & h4, & h5, & h6': {
                  mt: { xs: 2, sm: 3 },
                  mb: { xs: 1, sm: 1.5 },
                  fontSize: {
                    xs: '1.25rem',
                    sm: '1.5rem'
                  },
                },
                '& h1': {
                  fontSize: { xs: '1.75rem', sm: '2.125rem' },
                },
                '& h2': {
                  fontSize: { xs: '1.5rem', sm: '1.875rem' },
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
              }}
            >
              <ReactMarkdown
                rehypePlugins={[
                  rehypeRaw,
                  rehypeSanitize
                ] as PluggableList}
                components={{
                  code: ({ node, inline, className, children, ...props }) => {
                    if (inline) {
                      return <InlineCode {...props}>{children}</InlineCode>;
                    }
                    return (
                      <CodeBlock className={className}>
                        {String(children).replace(/\n$/, '')}
                      </CodeBlock>
                    );
                  },
                  pre: ({ children }) => <Box component='pre'>{children}</Box>,
                  // Add heading components with IDs for TOC
                  h1: ({ children, ...props }) => {
                    const text = String(children);
                    const id = generateHeadingId(text);
                    return (
                      <Typography variant="h1" component="h1" id={id} sx={{ scrollMarginTop: '100px' }} {...props}>
                        {children}
                      </Typography>
                    );
                  },
                  h2: ({ children, ...props }) => {
                    const text = String(children);
                    const id = generateHeadingId(text);
                    return (
                      <Typography variant="h2" component="h2" id={id} sx={{ scrollMarginTop: '100px' }} {...props}>
                        {children}
                      </Typography>
                    );
                  },
                  h3: ({ children, ...props }) => {
                    const text = String(children);
                    const id = generateHeadingId(text);
                    return (
                      <Typography variant="h3" component="h3" id={id} sx={{ scrollMarginTop: '100px' }} {...props}>
                        {children}
                      </Typography>
                    );
                  },
                  h4: ({ children, ...props }) => {
                    const text = String(children);
                    const id = generateHeadingId(text);
                    return (
                      <Typography variant="h4" component="h4" id={id} sx={{ scrollMarginTop: '100px' }} {...props}>
                        {children}
                      </Typography>
                    );
                  },
                  h5: ({ children, ...props }) => {
                    const text = String(children);
                    const id = generateHeadingId(text);
                    return (
                      <Typography variant="h5" component="h5" id={id} sx={{ scrollMarginTop: '100px' }} {...props}>
                        {children}
                      </Typography>
                    );
                  },
                  h6: ({ children, ...props }) => {
                    const text = String(children);
                    const id = generateHeadingId(text);
                    return (
                      <Typography variant="h6" component="h6" id={id} sx={{ scrollMarginTop: '100px' }} {...props}>
                        {children}
                      </Typography>
                    );
                  },
                  // ...existing component mappings...
                }}
              >
                {content}
              </ReactMarkdown>
            </Box>
          </Box>
        </Box>

        {/* TOC Sidebar */}
      </Container>
      <TOC content={content} />
    </Box>
  );
}
