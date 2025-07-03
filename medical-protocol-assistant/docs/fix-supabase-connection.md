# Fixing Supabase "Tenant or user not found" Error

## Problem

The application is failing with the error "FATAL: Tenant or user not found" when trying to connect to the Supabase database. This error occurs when:

1. The database doesn't exist in your Supabase project
2. The connection string is incorrect
3. The password has been rotated

## Solution Steps

### 1. Verify Your Supabase Project

1. Go to your Supabase dashboard at https://supabase.com/dashboard
2. Ensure you have a project created
3. If not, create a new project

### 2. Get the Correct Connection String

1. In your Supabase project dashboard, go to **Settings** → **Database**
2. Look for the **Connection string** section (NOT the "Connection pooling" section)
3. Copy the **URI** connection string
4. It should look like:
   ```
   postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
   ```

### 3. Update Your Environment Variables

1. Open your `.env.local` file
2. Replace the `DATABASE_URL` with the correct connection string from Supabase
3. Make sure to replace `[YOUR-PASSWORD]` placeholder with your actual database password

### 4. Handle Row Level Security (RLS)

If RLS is enabled on your tables (which is default in Supabase), you need to either:

#### Option A: Disable RLS (Quick fix for development)

```sql
-- Run this in Supabase SQL Editor
ALTER TABLE "Protocol" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "User" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "ProtocolVersion" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog" DISABLE ROW LEVEL SECURITY;
```

#### Option B: Create RLS Policies (Recommended for production)

```sql
-- Example: Allow service role full access
CREATE POLICY "Service role has full access" ON "Protocol"
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Repeat for other tables
```

### 5. Run Database Migrations

After fixing the connection:

```bash
# Generate Prisma client
pnpm prisma generate

# Push the schema to the database
pnpm prisma db push

# Or if you prefer migrations
pnpm prisma migrate deploy
```

### 6. Test the Connection

Run the test script to verify:

```bash
pnpm tsx scripts/test-db-connection.ts
```

## Alternative: Use Direct Connection (Non-pooled)

If the pooler connection continues to fail:

1. In Supabase dashboard, go to **Settings** → **Database**
2. Under **Connection string**, click on the dropdown and select **Direct connection**
3. Copy this connection string instead
4. Note: This bypasses the connection pooler but may have connection limits

## Common Issues and Solutions

### Issue: Password has special characters

Solution: URL-encode special characters in the password. For example:

- `@` becomes `%40`
- `#` becomes `%23`
- `$` becomes `%24`

### Issue: SSL required

Solution: Add `?sslmode=require` to the end of your connection string:

```
postgresql://...supabase.com:5432/postgres?sslmode=require
```

### Issue: Connection timeout

Solution: Add connection timeout parameters:

```
postgresql://...supabase.com:5432/postgres?connect_timeout=30&pool_timeout=30
```

## Verification

After making these changes, your dashboard queries should work properly and display real data instead of mock data.
