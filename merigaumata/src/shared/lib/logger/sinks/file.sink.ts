import { Sink } from '@logtape/logtape';

/**
 * Creates a safe, runtime-aware File Sink.
 * 
 * Ephemeral file writing is unsupported on serverless runtimes (like Edge or browser environments).
 * This sink dynamically imports Node 'fs' capabilities only when:
 * 1. Running on Node.js server side.
 * 2. LOG_FILE_PATH environment variable is configured.
 * 
 * Falls back safely to return null if unsupported.
 */
export function createFileSink(): Sink | null {
  if (typeof window !== 'undefined') return null; // Browser safety

  const logPath = process.env.LOG_FILE_PATH; // ts-audit-ignore
  if (!logPath) return null;

  try {
    // Use dynamic require so Edge compiler does not attempt to resolve these packages.
    const fs = require('fs');
    const path = require('path');

    // Ensure output log directory exists
    const dir = path.dirname(logPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const stream = fs.createWriteStream(logPath, { flags: 'a', encoding: 'utf8' });

    return (record) => {
      // Structured metadata serialization
      const meta = record.properties && Object.keys(record.properties).length > 0
        ? ` | Metadata: ${JSON.stringify(record.properties)}`
        : '';
        
      const line = `[${new Date(record.timestamp).toISOString()}] [${record.level.toUpperCase()}] [${record.category.join('/')}] ${record.message}${meta}\n`;
      
      stream.write(line);
    };
  } catch {
    // Fail silently on read-only environments
    return null;
  }
}
