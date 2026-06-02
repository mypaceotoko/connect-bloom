import { createClient, type SupabaseClient } from '@supabase/supabase-js';

type SupabaseEnvironment = {
  url: string;
  anonKey: string;
  isConfigured: boolean;
  missingKeys: string[];
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() ?? '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? '';

const missingKeys = [
  ['VITE_SUPABASE_URL', supabaseUrl],
  ['VITE_SUPABASE_ANON_KEY', supabaseAnonKey],
]
  .filter(([, value]) => !value)
  .map(([key]) => key);

export const supabaseConfig: SupabaseEnvironment = {
  url: supabaseUrl,
  anonKey: supabaseAnonKey,
  isConfigured: missingKeys.length === 0,
  missingKeys,
};

export const isSupabaseConfigured = supabaseConfig.isConfigured;
export const supabaseConfigured = supabaseConfig.isConfigured;

if (!supabaseConfig.isConfigured) {
  console.warn(
    `[EnBloom] Supabase is not configured yet. Missing: ${supabaseConfig.missingKeys.join(
      ', ',
    )}. The localStorage demo experience will continue to run.`,
  );
}

export const supabase: SupabaseClient | null = supabaseConfig.isConfigured
  ? createClient(supabaseConfig.url, supabaseConfig.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export function assertSupabaseConfigured(): boolean {
  if (supabaseConfig.isConfigured) return true;

  console.warn(
    `[EnBloom] Supabase environment variables are missing: ${supabaseConfig.missingKeys.join(
      ', ',
    )}`,
  );

  return false;
}

export function requireSupabaseClient(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      `Supabase is not configured. Missing environment variables: ${supabaseConfig.missingKeys.join(', ')}`,
    );
  }

  return supabase;
}
