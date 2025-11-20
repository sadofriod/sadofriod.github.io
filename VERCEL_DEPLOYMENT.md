# Vercel Deployment Configuration

## Environment Variables

Add these environment variables to your Vercel project:

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add the following variables:

```
AWS_REGION=us-east-2
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
S3_BUCKET_NAME=792awss3
UPLOAD_AUTH_KEY=your-secure-random-key-here
DATABASE_URL=your_postgres_connection_string
```

**Important:** 
- Never commit `.env` files with real credentials to your repository
- Use Vercel's environment variables for production
- Generate a strong random key for `UPLOAD_AUTH_KEY` (e.g., use `openssl rand -base64 32`)
- For `DATABASE_URL`, use Vercel Postgres or another PostgreSQL provider (see PRISMA_SETUP.md)
- These values are already in your local `.env` file but need to be added to Vercel

## S3 Bucket Configuration

Make sure your S3 bucket has the correct permissions:

1. **CORS Configuration** (for browser uploads):
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
```

2. **Bucket Policy** (for public read access):
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::792awss3/podcasts/*"
    }
  ]
}
```

## Vercel Build Settings

- **Framework Preset:** Next.js
- **Build Command:** `pnpm build`
- **Output Directory:** `.next`
- **Install Command:** `pnpm install`

## Deploy to Vercel

```bash
# Install Vercel CLI if you haven't
pnpm install -g vercel

# Deploy
vercel

# Or for production
vercel --prod
```

## API Endpoints

After deployment, your API endpoints will be:

- `GET /api/podcasts` - List all podcasts
- `POST /api/podcasts` - Upload new podcast with audio file (requires auth key)
- `POST /api/auth/upload` - Verify upload authentication key

## Upload Page

The podcast upload page is available at:
- Local: `http://localhost:3000/podcast/upload`
- Production: `https://your-domain.vercel.app/podcast/upload`

Authentication is required to access the upload functionality. Enter the `UPLOAD_AUTH_KEY` value to authenticate.

## Testing the Upload API

```bash
curl -X POST https://your-domain.vercel.app/api/podcasts \
  -F "audio=@/path/to/audio.mp3" \
  -F "title=My Podcast Episode" \
  -F "description=Episode description" \
  -F "duration=45:30" \
  -F "author=John Doe" \
  -F "episodeNumber=1" \
  -F "season=1"
```
