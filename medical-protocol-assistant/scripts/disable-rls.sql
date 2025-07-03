-- Disable RLS on all tables for development
-- WARNING: Only use this in development environments!

-- Disable RLS on core tables
ALTER TABLE IF EXISTS "User" DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "Protocol" DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "ProtocolVersion" DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "AuditLog" DISABLE ROW LEVEL SECURITY;

-- Show current RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;