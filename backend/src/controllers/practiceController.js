import { getSupabaseClient, isSupabaseConfigured } from '../services/supabase/supabaseClient.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

// In-memory fallback
const devProblems = new Map();
const devAttempts = new Map();

export async function getPracticeProblems(req, res, next) {
  try {
    const userId = req.user.id;
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient(req.user.token);
      const { data, error } = await client
        .from('practice_problems')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return sendSuccess(res, data || []);
    } else {
      const list = Array.from(devProblems.values())
        .filter(p => p.user_id === userId)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      return sendSuccess(res, list);
    }
  } catch (err) {
    next(err);
  }
}

export async function savePracticeProblem(req, res, next) {
  try {
    const userId = req.user.id;
    const body = req.body;

    if (isSupabaseConfigured()) {
      const client = getSupabaseClient(req.user.token);
      const { data, error } = await client
        .from('practice_problems')
        .insert({
          user_id: userId,
          language: body.language,
          topic: body.topic,
          difficulty: body.difficulty,
          title: body.title,
          description: body.description,
          input_description: body.inputDescription,
          output_description: body.outputDescription,
          constraints: body.constraints,
          sample_input: body.sampleInput,
          sample_output: body.sampleOutput,
          concept_practiced: body.conceptPracticed
        })
        .select()
        .single();

      if (error) throw error;
      return sendSuccess(res, data, 'Problem saved successfully', 201);
    } else {
      const id = 'prob-' + Date.now();
      const newProb = {
        id,
        user_id: userId,
        ...body,
        created_at: new Date().toISOString()
      };
      devProblems.set(id, newProb);
      return sendSuccess(res, newProb, 'Problem saved successfully', 201);
    }
  } catch (err) {
    next(err);
  }
}

export async function getPracticeProblemById(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    if (isSupabaseConfigured()) {
      const client = getSupabaseClient(req.user.token);
      const { data: problem, error } = await client
        .from('practice_problems')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error || !problem) {
        return sendError(res, 'Practice problem not found', 404, 'NOT_FOUND');
      }

      // Fetch latest attempt if any
      const { data: attempt } = await client
        .from('practice_attempts')
        .select('*')
        .eq('problem_id', id)
        .eq('user_id', userId)
        .single();

      return sendSuccess(res, { ...problem, attempt: attempt || null });
    } else {
      const problem = devProblems.get(id);
      if (!problem || problem.user_id !== userId) {
        return sendError(res, 'Practice problem not found', 404, 'NOT_FOUND');
      }
      const attempt = devAttempts.get(`${userId}-${id}`) || null;
      return sendSuccess(res, { ...problem, attempt });
    }
  } catch (err) {
    next(err);
  }
}

export async function submitAttempt(req, res, next) {
  try {
    const userId = req.user.id;
    const { id: problemId } = req.params;
    const { submittedCode, hintsUsed = 0, completed = false } = req.body;

    if (isSupabaseConfigured()) {
      const client = getSupabaseClient(req.user.token);

      // Verify problem belongs to user
      const { data: problem } = await client
        .from('practice_problems')
        .select('id, language, topic')
        .eq('id', problemId)
        .eq('user_id', userId)
        .single();

      if (!problem) {
        return sendError(res, 'Problem not found or unauthorized', 404, 'NOT_FOUND');
      }

      // Upsert attempt
      const { data: existing } = await client
        .from('practice_attempts')
        .select('id, hints_used')
        .eq('user_id', userId)
        .eq('problem_id', problemId)
        .single();

      let result;
      if (existing) {
        const { data, error } = await client
          .from('practice_attempts')
          .update({
            submitted_code: submittedCode,
            hints_used: Math.max(existing.hints_used, hintsUsed),
            completed: completed,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)
          .select()
          .single();
        if (error) throw error;
        result = data;
      } else {
        const { data, error } = await client
          .from('practice_attempts')
          .insert({
            user_id: userId,
            problem_id: problemId,
            submitted_code: submittedCode,
            hints_used: hintsUsed,
            completed: completed
          })
          .select()
          .single();
        if (error) throw error;
        result = data;
      }

      // Log activity if completed
      if (completed) {
        await client.from('learning_activity').insert({
          user_id: userId,
          activity_type: 'problem_completed',
          language: problem.language,
          topic: problem.topic,
          metadata: { hintsUsed: result.hints_used }
        });
      }

      return sendSuccess(res, result, completed ? 'Problem marked as completed!' : 'Attempt saved');
    } else {
      const key = `${userId}-${problemId}`;
      const existing = devAttempts.get(key);
      const attempt = {
        id: existing?.id || 'att-' + Date.now(),
        user_id: userId,
        problem_id: problemId,
        submitted_code: submittedCode,
        hints_used: existing ? Math.max(existing.hints_used, hintsUsed) : hintsUsed,
        completed,
        updated_at: new Date().toISOString(),
        created_at: existing?.created_at || new Date().toISOString()
      };
      devAttempts.set(key, attempt);
      return sendSuccess(res, attempt, completed ? 'Problem marked as completed!' : 'Attempt saved');
    }
  } catch (err) {
    next(err);
  }
}

export async function getUserAttempts(req, res, next) {
  try {
    const userId = req.user.id;
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient(req.user.token);
      const { data, error } = await client
        .from('practice_attempts')
        .select('*, practice_problems(title, language, topic, difficulty)')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return sendSuccess(res, data || []);
    } else {
      const list = Array.from(devAttempts.values()).filter(a => a.user_id === userId);
      return sendSuccess(res, list);
    }
  } catch (err) {
    next(err);
  }
}
