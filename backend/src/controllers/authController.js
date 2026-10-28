import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { getSupabaseClient, isSupabaseConfigured } from '../services/supabase/supabaseClient.js';
import { devProfile } from './profileController.js';

export async function getCurrentUser(req, res) {
  try {
    const user = req.user;
    if (!user) {
      return sendError(res, 'User session not found', 401, 'UNAUTHORIZED');
    }

    let profile = null;
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient(user.token);
      const { data } = await client.from('profiles').select('*').eq('id', user.id).single();
      profile = data;
    } else {
      profile = devProfile;
    }

    return sendSuccess(res, {
      user: {
        id: user.id,
        email: user.email,
        displayName: profile?.display_name || user.metadata?.display_name || 'Programming Student',
        preferredLanguage: profile?.preferred_language || 'python',
        avatarUrl: profile?.avatar_url || null
      }
    }, 'User authenticated');
  } catch (err) {
    return sendError(res, err.message, 500, 'AUTH_ERROR');
  }
}
