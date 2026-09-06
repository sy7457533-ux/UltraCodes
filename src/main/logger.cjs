/**
 * ProfileNest Browser - Main Process Logger
 * Safe logging without exposing credentials, tokens, or sensitive cookies
 */

const fs = require('fs');
const path = require('path');

class Logger {
  constructor(logsDir) {
    this.logsDir = logsDir || path.join(process.cwd(), 'data', 'logs');
    this.memoryLogs = [];
    this.maxMemoryLogs = 1000;
    this.init();
  }

  init() {
    try {
      if (!fs.existsSync(this.logsDir)) {
        fs.mkdirSync(this.logsDir, { recursive: true });
      }
    } catch (err) {
      console.error('[Logger] Failed to create logs directory:', err);
    }
  }

  sanitize(message) {
    if (typeof message !== 'string') {
      try {
        message = JSON.stringify(message);
      } catch {
        message = String(message);
      }
    }
    // Scrub common sensitive patterns (passwords, auth tokens, cookie secrets)
    return message
      .replace(/(password|passwd|pwd|token|secret|cookie)\s*[:=]\s*["']?[^"'\s,]+["']?/gi, '$1=***REDACTED***')
      .replace(/Bearer\s+[A-Za-z0-9-_.]+/gi, 'Bearer ***REDACTED***');
  }

  log(severity, moduleName, rawMessage) {
    const timestamp = new Date().toISOString();
    const cleanMessage = this.sanitize(rawMessage);
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp,
      severity: severity.toLowerCase(),
      module: moduleName,
      message: cleanMessage
    };

    this.memoryLogs.unshift(entry);
    if (this.memoryLogs.length > this.maxMemoryLogs) {
      this.memoryLogs.pop();
    }

    const logLine = `[${timestamp}] [${entry.severity.toUpperCase()}] [${moduleName}]: ${cleanMessage}\n`;
    console.log(logLine.trim());

    // Asynchronously append to daily log file
    const logDate = timestamp.split('T')[0];
    const logFilePath = path.join(this.logsDir, `profilenest-${logDate}.log`);
    fs.appendFile(logFilePath, logLine, (err) => {
      if (err) {
        // Silent catch to prevent crash loops
      }
    });

    return entry;
  }

  info(moduleName, message) {
    return this.log('info', moduleName, message);
  }

  warn(moduleName, message) {
    return this.log('warn', moduleName, message);
  }

  error(moduleName, message) {
    return this.log('error', moduleName, message);
  }

  getRecentLogs(limit = 100) {
    return this.memoryLogs.slice(0, limit);
  }
}

module.exports = Logger;
