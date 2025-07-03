/**
 * Supabase Client Configuration
 *
 * This module configures and exports a singleton instance of the Supabase client
 * for server-side interactions.
 */
import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabaseAdminClientInstance: SupabaseClient | null = null;

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Retrieves the singleton Supabase admin client instance.
 * This client uses the service_role key and should only be used on the server-side.
 * Throws an error if Supabase URL or Service Role Key are not configured.
 * @returns The configured Supabase client.
 * @throws {Error} If Supabase URL or Service Role Key are missing.
 */
export function getSupabaseAdminClient(): SupabaseClient {
  if (supabaseAdminClientInstance) {
    return supabaseAdminClientInstance;
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    if (process.env.NODE_ENV !== "test") {
      console.error(
        "Supabase URL or Service Role Key is not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.",
      );
      throw new Error(
        "Supabase URL or Service Role Key is missing. Configure environment variables.",
      );
    }
    // For test environment, allow missing credentials if calls are mocked
    console.warn(
      "Supabase credentials not found, assuming mocked Supabase client for tests.",
    );
    // Fallback to creating a client with dummy values for tests to avoid crashing if not fully mocked.
    // Actual API calls should be mocked in tests.
    supabaseAdminClientInstance = createClient(
      SUPABASE_URL || "http://localhost:54321", // Dummy URL for tests
      SUPABASE_SERVICE_ROLE_KEY || "dummy.service.key", // Dummy key for tests
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      },
    );
    return supabaseAdminClientInstance;
  }

  try {
    supabaseAdminClientInstance = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          // persistSession and autoRefreshToken are generally not needed for service_role client
          persistSession: false,
          autoRefreshToken: false,
        },
      },
    );
    return supabaseAdminClientInstance;
  } catch (error) {
    console.error("Failed to initialize Supabase admin client:", error);
    if (error instanceof Error) {
      throw new Error(
        `Failed to initialize Supabase admin client: ${error.message}`,
      );
    }
    throw new Error(
      "An unknown error occurred while initializing Supabase admin client.",
    );
  }
}
