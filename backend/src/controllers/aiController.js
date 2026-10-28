import { aiService } from '../services/ai/aiService.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { getSupabaseClient, isSupabaseConfigured } from '../services/supabase/supabaseClient.js';
import { logger } from '../utils/logger.js';

/**
 * Log activity helper
 */
async function logActivity(user, activityType, language, topic = null, metadata = {}) {
  if (!user || !isSupabaseConfigured()) return;
  try {
    const client = getSupabaseClient(user.token);
    await client.from('learning_activity').insert({
      user_id: user.id,
      activity_type: activityType,
      language,
      topic,
      metadata
    });
  } catch (err) {
    logger.warn('Failed to log learning activity:', err.message);
  }
}

export async function explainCode(req, res, next) {
  try {
    const { language, code } = req.body;
    const result = await aiService.explainCode({ language, code });

    if (req.user) {
      await logActivity(req.user, 'code_explained', language, null, {
        codeLength: code.length,
        concepts: result.concepts || []
      });
    }

    return sendSuccess(res, result, 'Code explanation generated successfully');
  } catch (err) {
    next(err);
  }
}

export async function debugCode(req, res, next) {
  try {
    const { language, code, errorMessage, expectedBehavior } = req.body;
    const result = await aiService.debugCode({ language, code, errorMessage, expectedBehavior });

    if (req.user) {
      await logActivity(req.user, 'debug_assisted', language, null, {
        isSyntaxError: result.isSyntaxError,
        hasErrorMsg: Boolean(errorMessage)
      });
    }

    return sendSuccess(res, result, 'Debugging analysis completed');
  } catch (err) {
    next(err);
  }
}

export async function generatePracticeProblem(req, res, next) {
  try {
    const { language, topic, difficulty } = req.body;
    const problem = await aiService.generatePracticeProblem({ language, topic, difficulty });

    if (req.user) {
      await logActivity(req.user, 'problem_generated', language, topic, { difficulty });
    }

    return sendSuccess(res, problem, 'Practice problem generated successfully');
  } catch (err) {
    next(err);
  }
}

export async function getHint(req, res, next) {
  try {
    const { level, problemContext, studentCode, problemId } = req.body;

    // Safety check: hints endpoint strictly rejects level 5
    if (level < 1 || level > 4) {
      return sendError(
        res,
        'Progressive hints only support levels 1 through 4. To view the full solution, use the explicit solution endpoint.',
        400,
        'INVALID_HINT_LEVEL'
      );
    }

    const hint = await aiService.generateHint({ level, problemContext, studentCode });

    if (req.user) {
      await logActivity(req.user, 'hint_viewed', problemContext.language || 'python', null, {
        level,
        problemId: problemId || null
      });

      // Update attempt hints_used in database if problemId is present
      if (problemId && isSupabaseConfigured()) {
        const client = getSupabaseClient(req.user.token);
        const { data: existingAttempt } = await client
          .from('practice_attempts')
          .select('id, hints_used')
          .eq('user_id', req.user.id)
          .eq('problem_id', problemId)
          .single();

        if (existingAttempt) {
          await client
            .from('practice_attempts')
            .update({
              hints_used: Math.max(existingAttempt.hints_used, level),
              submitted_code: studentCode
            })
            .eq('id', existingAttempt.id);
        } else {
          await client
            .from('practice_attempts')
            .insert({
              user_id: req.user.id,
              problem_id: problemId,
              submitted_code: studentCode,
              hints_used: level,
              completed: false
            });
        }
      }
    }

    return sendSuccess(res, hint, `Progressive hint (Level ${level}) retrieved`);
  } catch (err) {
    next(err);
  }
}

export async function getFullSolution(req, res, next) {
  try {
    const { problemContext, problemId } = req.body;
    const solution = await aiService.generateSolution({ problemContext });

    if (req.user) {
      await logActivity(req.user, 'solution_viewed', problemContext.language || 'python', null, {
        problemId: problemId || null
      });

      if (problemId && isSupabaseConfigured()) {
        const client = getSupabaseClient(req.user.token);
        const { data: existingAttempt } = await client
          .from('practice_attempts')
          .select('id')
          .eq('user_id', req.user.id)
          .eq('problem_id', problemId)
          .single();

        if (existingAttempt) {
          await client
            .from('practice_attempts')
            .update({ hints_used: 5 })
            .eq('id', existingAttempt.id);
        } else {
          await client
            .from('practice_attempts')
            .insert({
              user_id: req.user.id,
              problem_id: problemId,
              hints_used: 5,
              completed: false
            });
        }
      }
    }

    return sendSuccess(res, solution, 'Full solution revealed');
  } catch (err) {
    next(err);
  }
}

import { saveDevChatMessage } from './conversationController.js';

export async function chatTutor(req, res, next) {
  try {
    const { message, history, language, conversationId } = req.body;
    const response = await aiService.chat({ message, history, language });

    if (conversationId) {
      if (req.user && isSupabaseConfigured()) {
        const client = getSupabaseClient(req.user.token);
        // Persist user and assistant messages to database
        await client.from('conversation_messages').insert([
          { conversation_id: conversationId, role: 'user', content: message },
          { conversation_id: conversationId, role: 'assistant', content: response.reply }
        ]);
      } else {
        saveDevChatMessage(conversationId, 'user', message);
        saveDevChatMessage(conversationId, 'assistant', response.reply);
      }
    }

    return sendSuccess(res, response, 'Tutor reply received');
  } catch (err) {
    next(err);
  }
}
