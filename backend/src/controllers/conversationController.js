import { getSupabaseClient, isSupabaseConfigured } from '../services/supabase/supabaseClient.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

// In-memory fallback for local offline mode
const devConversations = new Map();
const devMessages = new Map();

export async function getConversations(req, res, next) {
  try {
    const userId = req.user.id;

    if (isSupabaseConfigured()) {
      const client = getSupabaseClient(req.user.token);
      const { data, error } = await client
        .from('conversations')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return sendSuccess(res, data || []);
    } else {
      const list = Array.from(devConversations.values())
        .filter(c => c.user_id === userId)
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
      return sendSuccess(res, list);
    }
  } catch (err) {
    next(err);
  }
}

export async function createConversation(req, res, next) {
  try {
    const userId = req.user.id;
    const { title, language } = req.body;

    if (isSupabaseConfigured()) {
      const client = getSupabaseClient(req.user.token);
      const { data, error } = await client
        .from('conversations')
        .insert({
          user_id: userId,
          title: title || 'New Conversation',
          language: language || 'python'
        })
        .select()
        .single();

      if (error) throw error;
      return sendSuccess(res, data, 'Conversation created', 201);
    } else {
      const id = 'conv-' + Date.now();
      const newConv = {
        id,
        user_id: userId,
        title: title || 'New Conversation',
        language: language || 'python',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      devConversations.set(id, newConv);
      devMessages.set(id, []);
      return sendSuccess(res, newConv, 'Conversation created', 201);
    }
  } catch (err) {
    next(err);
  }
}

export async function getConversationById(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    if (isSupabaseConfigured()) {
      const client = getSupabaseClient(req.user.token);
      const { data: conv, error: convError } = await client
        .from('conversations')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (convError || !conv) {
        return sendError(res, 'Conversation not found', 404, 'NOT_FOUND');
      }

      const { data: messages, error: msgError } = await client
        .from('conversation_messages')
        .select('*')
        .eq('conversation_id', id)
        .order('created_at', { ascending: true });

      if (msgError) throw msgError;

      return sendSuccess(res, {
        ...conv,
        messages: messages || []
      });
    } else {
      const conv = devConversations.get(id);
      if (!conv || conv.user_id !== userId) {
        return sendError(res, 'Conversation not found', 404, 'NOT_FOUND');
      }
      const messages = devMessages.get(id) || [];
      return sendSuccess(res, { ...conv, messages });
    }
  } catch (err) {
    next(err);
  }
}

export async function updateConversation(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { title } = req.body;

    if (isSupabaseConfigured()) {
      const client = getSupabaseClient(req.user.token);
      const { data, error } = await client
        .from('conversations')
        .update({ title, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error || !data) {
        return sendError(res, 'Conversation not found or unauthorized', 404, 'NOT_FOUND');
      }
      return sendSuccess(res, data, 'Conversation renamed');
    } else {
      const conv = devConversations.get(id);
      if (!conv || conv.user_id !== userId) {
        return sendError(res, 'Conversation not found', 404, 'NOT_FOUND');
      }
      conv.title = title;
      conv.updated_at = new Date().toISOString();
      return sendSuccess(res, conv, 'Conversation renamed');
    }
  } catch (err) {
    next(err);
  }
}

export async function deleteConversation(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    if (isSupabaseConfigured()) {
      const client = getSupabaseClient(req.user.token);
      const { error } = await client
        .from('conversations')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;
      return sendSuccess(res, { id }, 'Conversation deleted');
    } else {
      const conv = devConversations.get(id);
      if (!conv || conv.user_id !== userId) {
        return sendError(res, 'Conversation not found', 404, 'NOT_FOUND');
      }
      devConversations.delete(id);
      devMessages.delete(id);
      return sendSuccess(res, { id }, 'Conversation deleted');
    }
  } catch (err) {
    next(err);
  }
}
