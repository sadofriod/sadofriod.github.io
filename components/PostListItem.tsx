import type { PostMetadata } from "@/lib/posts";
import type React from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Stack,
  Divider
} from "@mui/material";
import { styled } from "@mui/material/styles";

// Styled components for Next.js Link compatibility with MUI
const StyledLink = styled(Link)({
  textDecoration: "none",
  color: "inherit",
  "&:hover": {
    textDecoration: "none"
  }
});

const CategoryLink = styled(Link)(({ theme }) => ({
  color: theme.palette.primary.main,
  textDecoration: "none",
  fontWeight: 500,
  "&:hover": {
    color: theme.palette.primary.dark,
    textDecoration: "underline"
  }
}));

const TagLink = styled(Link)(({ theme }) => ({
  textDecoration: "none",
  color: "inherit"
}));

const EnhancedCard = styled(Card)(({ theme }) => ({
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  borderRadius: theme.shape.borderRadius * 1.5,
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[1],
  },
}));

const PostListItem: React.FC<PostMetadata> = ({ title, date, excerpt, tags, description, category, slug }) => {
  return (
    <EnhancedCard elevation={0} sx={{ mb: 4, pb: 1 }}>
      <CardContent sx={{ p: 2 }}>
        <Box sx={{
          mb: 1.5,
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1.5,
          opacity: 0.85
        }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              fontWeight: 500,
              letterSpacing: '0.02em',
            }}
          >
            {date}
          </Typography>

          {category && (
            <>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "inline" }}
              >
                •
              </Typography>
              <Typography variant="caption" sx={{ display: "inline" }}>
                <CategoryLink href={`/categories/${category}`}>
                  {category}
                </CategoryLink>
              </Typography>
            </>
          )}
        </Box>

        <StyledLink href={`/blog/${slug}`}>
          <Typography
            variant="h5"
            component="h2"
            sx={{
              mb: 1.5,
              fontWeight: 700,
              lineHeight: 1.2,
              letterSpacing: '-0.01em',
              transition: "color 0.2s",
              "&:hover": { color: "primary.main" }
            }}
          >
            {title}
          </Typography>
        </StyledLink>

        {description && (
          <Typography
            variant='subtitle1'
            color="text.secondary"
            sx={{
              mb: 1.5,
              fontWeight: 500,
              fontSize: '0.95rem',
              lineHeight: 1.5
            }}
          >
            {description}
          </Typography>
        )}

        {excerpt && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              lineHeight: 1.6,
              opacity: 0.9
            }}
          >
            {excerpt}
          </Typography>
        )}

        <Divider sx={{ mt: 1, opacity: 0.7 }} />
        {tags && tags.length > 0 && (
          <Stack
            direction="row"
            spacing={1}
            flexWrap="wrap"
            useFlexGap
            sx={{ mt: 2 }}
          >
            {tags.map(tag => (
              <TagLink key={tag} href={`/tags/${tag}`}>
                <Chip
                  label={`#${tag}`}
                  size="small"
                  sx={{
                    bgcolor: "action.hover",
                    color: "text.secondary",
                    fontWeight: 500,
                    fontSize: '0.75rem',
                    height: '24px',
                    borderRadius: '12px',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: "action.selected",
                      transform: 'translateY(-1px)'
                    }
                  }}
                />
              </TagLink>
            ))}
          </Stack>
        )}
      </CardContent>
    </EnhancedCard>
  );
};

export default PostListItem;