import { getSupabaseClient, isSupabaseConfigured } from '../services/supabase/supabaseClient.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

// In-memory fallback for local development
export const devProfile = {
  id: '11111111-1111-1111-1111-111111111111',
  display_name: 'Student Developer',
  preferred_language: 'python',
  avatar_url: null,
  updated_at: new Date().toISOString()
};

export async function getProfile(req, res, next) {
  try {
    const userId = req.user.id;
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient(req.user.token);
      const { data, error } = await client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return sendSuccess(res, data || {
        id: userId,
        display_name: req.user.metadata?.display_name || 'Programming Student',
        preferred_language: 'python'
      });
    } else {
      return sendSuccess(res, devProfile);
    }
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const userId = req.user.id;
    const { displayName, preferredLanguage, avatarUrl } = req.body;

    if (isSupabaseConfigured()) {
      const client = getSupabaseClient(req.user.token);
      const updates = {};
      if (displayName) updates.display_name = displayName;
      if (preferredLanguage) updates.preferred_language = preferredLanguage;
      if (avatarUrl !== undefined) updates.avatar_url = avatarUrl;
      updates.updated_at = new Date().toISOString();

      const { data, error } = await client
        .from('profiles')
        .upsert({ id: userId, ...updates })
        .select()
        .single();

      if (error) throw error;
      return sendSuccess(res, data, 'Profile updated successfully');
    } else {
      if (displayName) devProfile.display_name = displayName;
      if (preferredLanguage) devProfile.preferred_language = preferredLanguage;
      if (avatarUrl !== undefined) devProfile.avatar_url = avatarUrl;
      devProfile.updated_at = new Date().toISOString();

      return sendSuccess(res, devProfile, 'Profile updated');
    }
  } catch (err) {
    next(err);
  }
}
