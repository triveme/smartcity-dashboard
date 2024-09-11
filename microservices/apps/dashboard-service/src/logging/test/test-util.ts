import * as fs from 'node:fs';
import * as path from 'node:path';

export function deleteLogPath(): void {
  const logPath = process.env.LOG_PATH;
  const logDirectory = path.join(path.resolve(), logPath);

  if (fs.existsSync(logDirectory)) {
    fs.rmSync(logDirectory, { recursive: true });
  }
}

export function isLogFileExisting(): boolean {
  const logPath = process.env.LOG_PATH;
  const logDirectory = path.join(path.resolve(), logPath, '/dashboard.log');

  return fs.existsSync(logDirectory);
}
