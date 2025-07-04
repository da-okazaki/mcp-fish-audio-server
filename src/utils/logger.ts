/**
 * Logger utility for MCP environment
 * Writes debug messages to stderr only when DEBUG environment variable is set
 * This prevents interfering with MCP's JSON communication
 */

const isDebug = process.env.DEBUG === 'true' || process.env.DEBUG === '1';

export const logger = {
  debug: (message: string, ...args: any[]) => {
    if (isDebug) {
      process.stderr.write(`[DEBUG] ${message} ${args.length > 0 ? JSON.stringify(args) : ''}\n`);
    }
  },
  
  error: (message: string, error?: any) => {
    if (isDebug) {
      const errorInfo = error instanceof Error ? 
        `${error.message}\n${error.stack}` : 
        error ? JSON.stringify(error) : '';
      process.stderr.write(`[ERROR] ${message} ${errorInfo}\n`);
    }
  },
  
  info: (message: string, ...args: any[]) => {
    if (isDebug) {
      process.stderr.write(`[INFO] ${message} ${args.length > 0 ? JSON.stringify(args) : ''}\n`);
    }
  }
};