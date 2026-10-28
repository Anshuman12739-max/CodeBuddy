/**
 * Safe Logger utility for CodeBuddy AI
 * Guarantees no sensitive tokens, passwords, or API keys are ever leaked to stdout/logs.
 */

const SENSITIVE_PATTERNS = [
  /bearer\s+[a-zA-Z0-9_\-\.]+/gi,
  /api[_-]?key["':=\s]+[a-zA-Z0-9_\-]+/gi,
  /password["':=\s]+[^"',\s]+/gi
];

function sanitize(message) {
  if (typeof message !== 'string') {
    try {
      message = JSON.stringify(message);
    } catch {
      message = String(message);
    }
  }

  let sanitized = message;
  for (const pattern of SENSITIVE_PATTERNS) {
    sanitized = sanitized.replace(pattern, '[REDACTED_CREDENTIAL]');
  }
  return sanitized;
}

export const logger = {
  info: (...args) => {
    console.log(`[INFO] [${new Date().toISOString()}]`, ...args.map(sanitize));
  },
  warn: (...args) => {
    console.warn(`[WARN] [${new Date().toISOString()}]`, ...args.map(sanitize));
  },
  error: (...args) => {
    console.error(`[ERROR] [${new Date().toISOString()}]`, ...args.map(sanitize));
  },
  debug: (...args) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] [${new Date().toISOString()}]`, ...args.map(sanitize));
    }
  }
};
