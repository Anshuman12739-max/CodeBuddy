import { getSupabaseClient, isSupabaseConfigured } from '../services/supabase/supabaseClient.js';
import { sendSuccess } from '../utils/responseHandler.js';
import { devAttempts } from './practiceController.js';
import { devMessages } from './conversationController.js';
import { devActivities } from './aiController.js';

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
      // Local dev offline calculated state from real in-memory attempts and activities
      const attemptsList = Array.from(devAttempts.values()).filter(a => a.user_id === userId);
      const totalAttempts = attemptsList.length;
      const problemsCompleted = attemptsList.filter(a => a.completed).length;

      // Count user messages in devMessages
      let questionsAsked = 0;
      for (const msgs of devMessages.values()) {
        questionsAsked += msgs.filter(m => m.role === 'user').length;
      }

      const langCounts = {};
      const topicCounts = {};
      const activeDates = new Set();

      devActivities.forEach(act => {
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

      let streakDays = activeDates.size > 0 ? activeDates.size : 1;

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
        topLanguages: topLanguages.length > 0 ? topLanguages : [{ language: 'python', count: 1 }],
        recentTopics: recentTopics.length > 0 ? recentTopics : [{ topic: 'Core Logic', count: 1 }],
        suggestedNextTopics,
        isEmpty: totalAttempts === 0 && questionsAsked === 0 && devActivities.length === 0
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
      const activities = devActivities.slice(0, 20);
      if (activities.length === 0) {
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
      return sendSuccess(res, activities);
    }
  } catch (err) {
    next(err);
  }
}
