# Prisma Database Setup

## Using Vercel Postgres (Recommended for Production)

1. **Create a Vercel Postgres Database:**
   - Go to your Vercel project dashboard
   - Navigate to the "Storage" tab
   - Click "Create Database"
   - Select "Postgres"
   - Choose a name for your database

2. **Connect to Vercel:**
   ```bash
   vercel env pull
   ```
   This will pull the `DATABASE_URL` and other environment variables.

3. **Run Migrations:**
   ```bash
   npx prisma migrate dev --name init
   ```

## Alternative: Local PostgreSQL

1. **Install PostgreSQL:**
   ```bash
   # macOS
   brew install postgresql@14
   brew services start postgresql@14

   # Create database
   createdb podcast_db
   ```

2. **Update .env:**
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/podcast_db"
   ```

3. **Run Migrations:**
   ```bash
   npx prisma migrate dev --name init
   ```

## Using Prisma Postgres (Easiest for Development)

1. **Login to Prisma:**
   ```bash
   npx prisma auth login
   ```

2. **Create Database:**
   ```bash
   npx prisma postgres create
   ```

3. **The DATABASE_URL will be automatically added to your .env**

4. **Run Migrations:**
   ```bash
   npx prisma migrate dev --name init
   ```

## Vercel Deployment

1. **Add Environment Variables to Vercel:**
   - Go to Settings → Environment Variables
   - Add `DATABASE_URL` (get this from Vercel Postgres or your database provider)
   - Add other required variables:
     - `AWS_REGION`
     - `AWS_ACCESS_KEY_ID`
     - `AWS_SECRET_ACCESS_KEY`
     - `S3_BUCKET_NAME`
     - `UPLOAD_AUTH_KEY`

2. **Add Prisma Generate to Build:**
   The build command should include Prisma generation. Update `package.json`:
   ```json
   {
     "scripts": {
       "build": "prisma generate && next build"
     }
   }
   ```

3. **Deploy:**
   ```bash
   vercel --prod
   ```

## Prisma Studio

View and manage your database with Prisma Studio:
```bash
npx prisma studio
```

## Common Commands

```bash
# Generate Prisma Client
npx prisma generate

# Create and apply a migration
npx prisma migrate dev --name description

# Apply migrations in production
npx prisma migrate deploy

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# View database in browser
npx prisma studio

# Check migration status
npx prisma migrate status
```
