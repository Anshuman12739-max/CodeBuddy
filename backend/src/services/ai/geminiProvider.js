import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIProvider } from './aiProvider.js';
import { logger } from '../../utils/logger.js';

export class GeminiProvider extends AIProvider {
  constructor({ apiKey, model = 'gemini-2.5-flash', timeoutMs = 60000 }) {
    super('gemini');
    this.apiKey = apiKey;
    this.modelName = model || 'gemini-2.5-flash';
    this.timeoutMs = timeoutMs;
    this.client = apiKey ? new GoogleGenerativeAI(apiKey) : null;
  }

  async healthCheck() {
    const startTime = Date.now();
    if (!this.apiKey) {
      return {
        isHealthy: false,
        provider: 'gemini',
        model: this.modelName,
        latencyMs: 0,
        error: 'GEMINI_API_KEY is missing from backend configuration.'
      };
    }

    try {
      const model = this.client.getGenerativeModel({ model: this.modelName });
      
      const pingPromise = model.generateContent({
        contents: [{ role: 'user', parts: [{ text: 'Respond with the word "OK"' }] }]
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout after 8000ms`)), 8000)
      );

      const result = await Promise.race([pingPromise, timeoutPromise]);
      const response = await result.response;
      const text = response.text();

      return {
        isHealthy: true,
        provider: 'gemini',
        model: this.modelName,
        latencyMs: Date.now() - startTime
      };
    } catch (err) {
      let friendlyError = err.message;
      if (err.message.includes('API_KEY_INVALID') || err.message.includes('403') || err.message.includes('401')) {
        friendlyError = 'Invalid Gemini API Key. Please verify your GEMINI_API_KEY in backend/.env.';
      } else if (err.message.includes('429') || err.message.includes('RESOURCE_EXHAUSTED')) {
        friendlyError = 'Gemini API quota exceeded or rate limit reached.';
      } else if (err.message.includes('models/') || err.message.includes('not found')) {
        friendlyError = `Gemini model '${this.modelName}' is not available or invalid. Check supported models in Google AI Studio.`;
      }

      return {
        isHealthy: false,
        provider: 'gemini',
        model: this.modelName,
        latencyMs: Date.now() - startTime,
        error: friendlyError
      };
    }
  }

  async chatCompletion(messages, options = {}) {
    if (!this.client || !this.apiKey) {
      throw new Error('Gemini API is not configured. Please set GEMINI_API_KEY in backend/.env.');
    }

    try {
      // Extract system instruction if present
      const systemMsg = messages.find(m => m.role === 'system');
      const conversationHistory = messages.filter(m => m.role !== 'system');

      const model = this.client.getGenerativeModel({
        model: this.modelName,
        systemInstruction: systemMsg ? systemMsg.content : undefined,
        generationConfig: {
          temperature: options.temperature ?? 0.3,
          maxOutputTokens: options.maxTokens ?? 2048,
        }
      });

      // Format conversation turns for Gemini (alternating 'user' and 'model')
      const formattedContents = [];
      for (const m of conversationHistory) {
        const geminiRole = m.role === 'assistant' ? 'model' : 'user';
        if (formattedContents.length === 0 && geminiRole !== 'user') {
          // Gemini requires the conversation to begin with a user turn
          continue;
        }

        const last = formattedContents[formattedContents.length - 1];
        if (last && last.role === geminiRole) {
          // Merge consecutive same-role turns into single message
          last.parts[0].text += '\n\n' + m.content;
        } else {
          formattedContents.push({
            role: geminiRole,
            parts: [{ text: m.content }]
          });
        }
      }

      // If empty (e.g. only assistant greeting was present), ensure at least one user turn
      if (formattedContents.length === 0) {
        formattedContents.push({
          role: 'user',
          parts: [{ text: 'Hello' }]
        });
      }

      // Wrap with timeout
      const generatePromise = model.generateContent({
        contents: formattedContents
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Gemini request timed out after ${this.timeoutMs}ms`)), this.timeoutMs)
      );

      const result = await Promise.race([generatePromise, timeoutPromise]);
      const response = await result.response;
      const text = response.text();

      return {
        content: text.trim(),
        provider: 'gemini',
        model: this.modelName,
        raw: result
      };
    } catch (err) {
      if (err.message.includes('API_KEY_INVALID')) {
        throw new Error('Google Gemini API Key is invalid or expired. Check backend/.env.');
      }
      if (err.message.includes('RESOURCE_EXHAUSTED') || err.message.includes('429')) {
        throw new Error('Google Gemini rate limit exceeded. Please wait a moment or switch to local Ollama provider.');
      }
      throw err;
    }
  }
}
