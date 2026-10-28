import dotenv from 'dotenv';
import path from 'path';

// Load .env from backend directory
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  
  // Supabase
  supabase: {
    url: process.env.SUPABASE_URL || '',
    publishableKey: process.env.SUPABASE_PUBLISHABLE_KEY || '',
  },

  // AI Configuration
  ai: {
    provider: (process.env.AI_PROVIDER || 'ollama').toLowerCase(),
    timeoutMs: parseInt(process.env.AI_REQUEST_TIMEOUT_MS || '60000', 10),
    ollama: {
      baseUrl: process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434',
      model: process.env.OLLAMA_MODEL || 'gemma3:1b',
    },
    gemini: {
      apiKey: process.env.GEMINI_API_KEY || '',
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    }
  }
};

/**
 * Validate configuration at startup
 * Ensures informative diagnostics rather than silent or obscure crashes
 */
export function validateConfig() {
  const issues = [];
  
  if (!['ollama', 'gemini'].includes(config.ai.provider)) {
    issues.push(`Invalid AI_PROVIDER '${config.ai.provider}'. Must be 'ollama' or 'gemini'.`);
  }

  if (config.ai.provider === 'gemini' && !config.ai.gemini.apiKey) {
    issues.push('AI_PROVIDER is set to gemini, but GEMINI_API_KEY is not defined in environment.');
  }

  return {
    isValid: issues.length === 0,
    issues
  };
}
