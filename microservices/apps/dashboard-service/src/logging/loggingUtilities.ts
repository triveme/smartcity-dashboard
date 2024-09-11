import * as fs from 'fs';
import * as path from 'node:path';
import * as process from 'node:process';

const logNameRegex = /(.*\.log)(?:\.(\d+))?$/;

export function readLogs(): string {
  const logPath = path.join(path.resolve(), process.env.LOG_PATH) ?? './logs';
  const logs = fs.readdirSync(logPath).filter((log) => log.match(logNameRegex));
  let completeLog = '';

  logs.forEach((log) => {
    completeLog += fs.readFileSync(`${logPath}/${log}`).toString();
  });

  return completeLog;
}

export function rotateLogs(): void {
  const logPath = process.env.LOG_PATH ?? './logs';
  const logDirectory = path.join(path.resolve(), logPath);

  try {
    if (!fs.existsSync(logDirectory)) fs.mkdirSync(logDirectory);

    const logs = fs.readdirSync(logDirectory);
    const deleted: string[] = [];

    logs.forEach((value) => {
      const match = value.match(logNameRegex);

      if (match) {
        fs.unlinkSync(path.join(logDirectory, value));
        deleted.push(value);
      } else {
        deleted.push(value);
      }
    });

    deleted.forEach((value) => {
      logs.splice(logs.indexOf(value));
    });

    const sortedLogs = logs.sort((a, b) => {
      const numA = extractNumber(a);
      const numB = extractNumber(b);

      if (numA === null) return 1;
      if (numB === null) return -1;

      return numB - numA;
    });

    for (let i = 0; i < sortedLogs.length; i++) {
      const logParts = sortedLogs[i].match(logNameRegex);

      fs.renameSync(
        `${logDirectory}/${sortedLogs[i]}`,
        `${logDirectory}/${logParts[1]}.${
          !isNaN(parseInt(logParts[2])) ? parseInt(logParts[2]) + 1 : 0
        }`,
      );
    }

    fs.writeFileSync(`${logDirectory}/dashboard.log`, '');
  } catch (e) {
    console.log(e);
  }
}

export function writeLogfile(message: string): void {
  const logPath = process.env.LOG_PATH ?? './logs';
  const logDirectory = path.join(path.resolve(), logPath);

  try {
    if (!fs.existsSync(logDirectory)) fs.mkdirSync(logDirectory);

    fs.appendFileSync(`${logDirectory}/dashboard.log`, `${message}\n`);
  } catch (e) {
    console.log(e);
  }
}

function extractNumber(value: string): number | null {
  const match = value.match(logNameRegex);

  return match && match[2] ? parseInt(match[2]) : null;
}
