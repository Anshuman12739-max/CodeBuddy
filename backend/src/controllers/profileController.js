import { getSupabaseClient, isSupabaseConfigured } from '../services/supabase/supabaseClient.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

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
      return sendSuccess(res, {
        id: userId,
        display_name: 'Student Developer',
        preferred_language: 'python'
      });
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
      return sendSuccess(res, {
        id: userId,
        display_name: displayName || 'Student Developer',
        preferred_language: preferredLanguage || 'python'
      }, 'Profile updated');
    }
  } catch (err) {
    next(err);
  }
}
