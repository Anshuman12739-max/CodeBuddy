import api from './api';

export const aiService = {
  getSystemHealth: () => api.get('/health'),
  getAIHealth: () => api.get('/health/ai'),

  explainCode: (language, code) => 
    api.post('/ai/explain', { language, code }),

  debugCode: (language, code, errorMessage, expectedBehavior) => 
    api.post('/ai/debug', { language, code, errorMessage, expectedBehavior }),

  generatePracticeProblem: (language, topic, difficulty) => 
    api.post('/ai/practice/generate', { language, topic, difficulty }),

  getHint: (level, problemContext, studentCode, problemId) => 
    api.post('/ai/hints', { level, problemContext, studentCode, problemId }),

  getFullSolution: (problemContext, problemId) => 
    api.post('/ai/solution', { problemContext, problemId }),

  chat: (message, history, language, conversationId) => 
    api.post('/ai/chat', { message, history, language, conversationId }),
};
