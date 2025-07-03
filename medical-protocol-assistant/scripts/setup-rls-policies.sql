-- Script to set up proper Row Level Security policies for production
-- Run this in your Supabase SQL Editor after enabling RLS

-- Enable RLS on all tables (if not already enabled)
ALTER TABLE "Protocol" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProtocolVersion" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (to start fresh)
DROP POLICY IF EXISTS "service_role_all_access_protocol" ON "Protocol";
DROP POLICY IF EXISTS "service_role_all_access_user" ON "User";
DROP POLICY IF EXISTS "service_role_all_access_protocol_version" ON "ProtocolVersion";
DROP POLICY IF EXISTS "service_role_all_access_audit_log" ON "AuditLog";

-- Create policies for service role (used by your backend)
-- These policies allow the service role full access to all tables

-- Protocol table policies
CREATE POLICY "service_role_all_access_protocol" ON "Protocol"
    FOR ALL 
    TO service_role
    USING (true)
    WITH CHECK (true);

-- User table policies
CREATE POLICY "service_role_all_access_user" ON "User"
    FOR ALL 
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ProtocolVersion table policies
CREATE POLICY "service_role_all_access_protocol_version" ON "ProtocolVersion"
    FOR ALL 
    TO service_role
    USING (true)
    WITH CHECK (true);

-- AuditLog table policies
CREATE POLICY "service_role_all_access_audit_log" ON "AuditLog"
    FOR ALL 
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Verify policies are created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('Protocol', 'User', 'ProtocolVersion', 'AuditLog')
ORDER BY tablename, policyname;