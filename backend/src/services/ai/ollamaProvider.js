import { AIProvider } from './aiProvider.js';
import { logger } from '../../utils/logger.js';

export class OllamaProvider extends AIProvider {
  constructor({ baseUrl = 'http://127.0.0.1:11434', model = 'gemma3:1b', timeoutMs = 60000 }) {
    super('ollama');
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.model = model;
    this.timeoutMs = timeoutMs;
  }

  async healthCheck() {
    const startTime = Date.now();
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });

      if (!response.ok) {
        return {
          isHealthy: false,
          provider: 'ollama',
          model: this.model,
          latencyMs: Date.now() - startTime,
          error: `Ollama returned HTTP ${response.status}: ${response.statusText}`
        };
      }

      const data = await response.json();
      const models = data.models || [];
      const hasModel = models.some(m => m.name === this.model || m.name.startsWith(this.model + ':') || m.model === this.model);

      if (!hasModel) {
        return {
          isHealthy: false,
          provider: 'ollama',
          model: this.model,
          latencyMs: Date.now() - startTime,
          error: `Ollama service is online, but model '${this.model}' is not pulled. Run 'ollama pull ${this.model}' in PowerShell.`
        };
      }

      return {
        isHealthy: true,
        provider: 'ollama',
        model: this.model,
        latencyMs: Date.now() - startTime
      };
    } catch (err) {
      const message = err.name === 'TimeoutError'
        ? `Connection to Ollama timed out at ${this.baseUrl}`
        : `Ollama service unreachable at ${this.baseUrl}. Please run 'ollama serve' or check if Ollama is running.`;
      
      return {
        isHealthy: false,
        provider: 'ollama',
        model: this.model,
        latencyMs: Date.now() - startTime,
        error: message
      };
    }
  }

  async chatCompletion(messages, options = {}) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages.map(m => ({
            role: m.role,
            content: m.content
          })),
          stream: false,
          options: {
            temperature: options.temperature ?? 0.3,
            top_p: options.top_p ?? 0.9,
          }
        }),
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errText = await response.text();
        if (response.status === 404) {
          throw new Error(`Ollama model '${this.model}' was not found. Please run 'ollama pull ${this.model}'.`);
        }
        throw new Error(`Ollama API error (${response.status}): ${errText}`);
      }

      const data = await response.json();
      const content = data.message?.content || '';

      return {
        content: content.trim(),
        provider: 'ollama',
        model: this.model,
        raw: data
      };
    } catch (err) {
      clearTimeout(timeout);
      if (err.name === 'AbortError') {
        throw new Error(`AI request timed out after ${this.timeoutMs}ms. Please try with smaller input or check Ollama performance.`);
      }
      if (err.cause?.code === 'ECONNREFUSED' || err.message.includes('fetch failed')) {
        throw new Error(`Cannot connect to Ollama at ${this.baseUrl}. Ensure Ollama is running on your machine.`);
      }
      throw err;
    }
  }
}
