/**
 * Abstract Base Class for AI Providers
 * Enforces unified contract for all LLM backends (Ollama, Gemini, etc.)
 */
export class AIProvider {
  constructor(name) {
    if (new.target === AIProvider) {
      throw new TypeError('Cannot construct AIProvider instances directly. Subclass must be used.');
    }
    this.name = name;
  }

  /**
   * Health check to test provider availability
   * @returns {Promise<{ isHealthy: boolean, provider: string, model: string, latencyMs: number, error?: string }>}
   */
  async healthCheck() {
    throw new Error('healthCheck() must be implemented by subclass');
  }

  /**
   * Core chat completion method
   * @param {Array<{ role: 'system'|'user'|'assistant', content: string }>} messages
   * @param {Object} options
   * @returns {Promise<{ content: string, raw?: any }>}
   */
  async chatCompletion(messages, options = {}) {
    throw new Error('chatCompletion() must be implemented by subclass');
  }
}
