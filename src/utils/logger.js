const fs = require('fs');
const path = require('path');

// Criar pasta de logs se não existir
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const getTimestamp = () => {
  return new Date().toISOString();
};

const log = (level, message, error = null) => {
  const timestamp = getTimestamp();
  const logMessage = error
    ? `[${timestamp}] [${level}] ${message} - ${error.message}`
    : `[${timestamp}] [${level}] ${message}`;

  // Log no console
  console.log(logMessage);

  // Log em arquivo
  const logFile = path.join(logsDir, `${new Date().toISOString().split('T')[0]}.log`);
  fs.appendFileSync(logFile, logMessage + '\n');
};

const logger = {
  info: (message) => log('INFO', message),
  warn: (message) => log('WARN', message),
  error: (message, error) => log('ERROR', message, error),
  debug: (message) => {
    if (process.env.NODE_ENV === 'development') {
      log('DEBUG', message);
    }
  }
};

module.exports = logger;
