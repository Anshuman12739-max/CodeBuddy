import { createClient } from '@supabase/supabase-js';
import { config } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

let supabaseClient = null;

export function getSupabaseClient(userToken = null) {
  const { url, publishableKey } = config.supabase;

  const isConfigured = url && !url.includes('placeholder-project') && publishableKey && !publishableKey.includes('placeholder');

  if (!isConfigured) {
    // Return null or simulated client in offline dev mode
    return null;
  }

  if (userToken) {
    // User-scoped client respecting RLS
    return createClient(url, publishableKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      },
    });
  }

  if (!supabaseClient) {
    supabaseClient = createClient(url, publishableKey, {
      auth: {
        persistSession: false,
      },
    });
  }

  return supabaseClient;
}

export function isSupabaseConfigured() {
  const { url, publishableKey } = config.supabase;
  return Boolean(url && !url.includes('placeholder-project') && publishableKey && !publishableKey.includes('placeholder'));
}
