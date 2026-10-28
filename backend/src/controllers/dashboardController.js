import { getSupabaseClient, isSupabaseConfigured } from '../services/supabase/supabaseClient.js';
import { sendSuccess } from '../utils/responseHandler.js';

export async function getDashboardStats(req, res, next) {
  try {
    const userId = req.user.id;

    if (isSupabaseConfigured()) {
      const client = getSupabaseClient(req.user.token);

      // 1. Attempts and completions
      const { data: attempts } = await client
        .from('practice_attempts')
        .select('id, completed, hints_used, problem_id, updated_at')
        .eq('user_id', userId);

      const totalAttempts = attempts?.length || 0;
      const problemsCompleted = attempts?.filter(a => a.completed)?.length || 0;

      // 2. Questions asked (user role messages)
      const { data: conversations } = await client
        .from('conversations')
        .select('id')
        .eq('user_id', userId);

      let questionsAsked = 0;
      if (conversations && conversations.length > 0) {
        const convIds = conversations.map(c => c.id);
        const { count } = await client
          .from('conversation_messages')
          .select('*', { count: 'exact', head: true })
          .in('conversation_id', convIds)
          .eq('role', 'user');
        questionsAsked = count || 0;
      }

      // 3. Learning Activity logs
      const { data: activities } = await client
        .from('learning_activity')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      // Language distribution
      const langCounts = {};
      const topicCounts = {};
      const activeDates = new Set();

      (activities || []).forEach(act => {
        if (act.language) {
          langCounts[act.language] = (langCounts[act.language] || 0) + 1;
        }
        if (act.topic) {
          topicCounts[act.topic] = (topicCounts[act.topic] || 0) + 1;
        }
        if (act.created_at) {
          activeDates.add(act.created_at.split('T')[0]);
        }
      });

      // Calculate streak
      let streakDays = 0;
      const today = new Date();
      for (let i = 0; i < 365; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        if (activeDates.has(dateStr)) {
          streakDays++;
        } else if (i === 0) {
          // If no activity yet today, check yesterday before breaking streak
          continue;
        } else {
          break;
        }
      }

      const topLanguages = Object.entries(langCounts)
        .map(([language, count]) => ({ language, count }))
        .sort((a, b) => b.count - a.count);

      const recentTopics = Object.entries(topicCounts)
        .map(([topic, count]) => ({ topic, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const allTopics = [
        'Variables and data types', 'Operators', 'Conditional statements',
        'Loops', 'Arrays', 'Strings', 'Functions', 'Recursion',
        'Searching and sorting', 'Object-oriented programming', 'Basic data structures'
      ];
      const studiedTopicNames = new Set(recentTopics.map(t => t.topic));
      const suggestedNextTopics = allTopics.filter(t => !studiedTopicNames.has(t)).slice(0, 3);

      return sendSuccess(res, {
        totalAttempts,
        problemsCompleted,
        questionsAsked,
        streakDays,
        topLanguages,
        recentTopics,
        suggestedNextTopics,
        isEmpty: totalAttempts === 0 && questionsAsked === 0 && (activities?.length || 0) === 0
      });
    } else {
      // Local dev offline empty/initial state
      return sendSuccess(res, {
        totalAttempts: 0,
        problemsCompleted: 0,
        questionsAsked: 0,
        streakDays: 1,
        topLanguages: [{ language: 'python', count: 1 }],
        recentTopics: [{ topic: 'Loops', count: 1 }],
        suggestedNextTopics: ['Variables and data types', 'Conditional statements', 'Functions'],
        isEmpty: false
      });
    }
  } catch (err) {
    next(err);
  }
}

export async function getDashboardActivity(req, res, next) {
  try {
    const userId = req.user.id;
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient(req.user.token);
      const { data, error } = await client
        .from('learning_activity')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return sendSuccess(res, data || []);
    } else {
      return sendSuccess(res, [
        {
          id: 'act-1',
          activity_type: 'code_explained',
          language: 'python',
          topic: 'Recursion',
          created_at: new Date().toISOString()
        }
      ]);
    }
  } catch (err) {
    next(err);
  }
}
