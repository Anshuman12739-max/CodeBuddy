/**
 * Code Execution Interface
 *
 * SECURITY NOTICE:
 * In accordance with production security standards, arbitrary student code
 * is NEVER executed on the application server via child_process, eval, or shell commands.
 *
 * This service defines the pluggable contract for isolated sandbox runners
 * (e.g., Docker container pools, Judge0 API, gVisor microVMs, or WebAssembly Pyodide).
 */

export class ExecutionService {
  constructor() {
    this.sandboxType = 'unsupported';
  }

  /**
   * Safe execution placeholder
   * @param {Object} params
   * @param {string} params.language - 'python' | 'c' | 'cpp' | 'javascript'
   * @param {string} params.code - Source code
   * @param {string} [params.input] - Stdin input
   * @returns {Promise<{ executed: boolean, message: string }>}
   */
  async executeCode({ language, code, input = '' }) {
    return {
      executed: false,
      isSimulation: true,
      message: 'Server-side direct execution is disabled for safety. Code analysis and debugging are handled by CodeBuddy AI Static Analysis. To execute code safely, configure an isolated Docker sandbox or WebAssembly worker.'
    };
  }
}

export const executionService = new ExecutionService();
