# Vercel Deployment Configuration

## Quick Start

1. **Set up a PostgreSQL database** (e.g., Vercel Postgres, Supabase, or Neon)
2. **Configure environment variables** in Vercel project settings
3. **Deploy to Vercel** via Git integration or CLI
4. **Run database migrations** after first deployment

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
podcast_DATABASE_URL=your_postgres_connection_string
```

**Important:** 
- Never commit `.env` files with real credentials to your repository
- Use Vercel's environment variables for production
- Generate a strong random key for `UPLOAD_AUTH_KEY` (e.g., use `openssl rand -base64 32`)
- For `podcast_DATABASE_URL`, use Vercel Postgres or another PostgreSQL provider (see PRISMA_SETUP.md)
- These values are already in your local `.env` file but need to be added to Vercel

**Database Setup:**
- The app uses PostgreSQL with Prisma ORM
- Models include: Order, OrderItem, Product, Podcast, and TobaccoRecord
- After setting up the database, run migrations with `npx prisma migrate deploy` in your Vercel project settings or use the Vercel CLI

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

### Podcasts
- `GET /api/podcasts` - List all podcasts
- `POST /api/podcasts` - Upload new podcast with audio file (requires auth key)
- `POST /api/auth/upload` - Verify upload authentication key

### Tobacco Records
- `GET /api/record` - Get all tobacco experiment records
- `POST /api/record` - Add or update a tobacco record
  - Body: `{ action: "add", record: {...} }` to add new record
  - Body: `{ action: "update", id: 123, record: {...} }` to update existing record

## Upload Page

The podcast upload page is available at:
- Local: `http://localhost:3000/podcast/upload`
- Production: `https://your-domain.vercel.app/podcast/upload`

Authentication is required to access the upload functionality. Enter the `UPLOAD_AUTH_KEY` value to authenticate.

## Tobacco Record Page

The tobacco experiment record page is available at:
- Local: `http://localhost:3000/record`
- Production: `https://your-domain.vercel.app/record`

This page allows you to track tobacco smoking experiments with details like brand, weight, pipe type, and subjective descriptions.

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

## Database Migrations

After deploying to Vercel, you need to run Prisma migrations to set up your database schema.

### Option 1: Using Vercel CLI (Recommended)

```bash
# Install Vercel CLI
pnpm install -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link

# Pull environment variables
vercel env pull .env.local

# Run migrations
npx prisma migrate deploy
```

### Option 2: Manual Migration via SQL

If you prefer to run migrations manually:

1. Connect to your PostgreSQL database
2. Run the SQL from `prisma/migrations/manual_add_tobacco_record/migration.sql`
3. Or use a database client to execute the migration

### Database Models

The application includes the following Prisma models:
- **Order, OrderItem, Product**: E-commerce functionality
- **Podcast**: Podcast episodes with S3-stored audio
- **TobaccoRecord**: Tobacco experiment tracking (brand, weight, pipe type, etc.)

## Troubleshooting

### Build Errors

If you encounter Prisma-related build errors:
1. Ensure `podcast_DATABASE_URL` is set in Vercel environment variables
2. Check that `postinstall` script in package.json includes `prisma generate`
3. Verify binary targets in `prisma/schema.prisma` include `rhel-openssl-3.0.x`

### Database Connection Issues

- For Vercel Postgres, use the connection string from your Vercel Storage dashboard
- Ensure your database allows connections from Vercel's IP ranges
- For external databases, check firewall rules and SSL settings

### TypeScript Errors

After updating Prisma schema:
1. Run `npx prisma generate` locally
2. Restart TypeScript server in VS Code (Cmd+Shift+P → "TypeScript: Restart TS Server")

## Additional Resources

- [Vercel Deployment Documentation](https://vercel.com/docs)
- [Prisma on Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Next.js Deployment](https://nextjs.org/docs/app/building-your-application/deploying)
