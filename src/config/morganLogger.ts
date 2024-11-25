import { Request } from 'express';
import fs from 'fs';
import path from 'path';
import morgan, { StreamOptions } from 'morgan';
import moment from 'moment-timezone';

const logsDir = path.resolve(__dirname, '../logs');
const accessLogPath = path.join(logsDir, 'access.log');

let accessLogStream: fs.WriteStream | undefined;
if (process.env.NODE_ENV === 'development')
  accessLogStream = fs.createWriteStream(accessLogPath, { flags: 'a' });

morgan.token('date', () =>
  moment().tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss'),
);

morgan.token('origin', (req: Request) => req.headers.origin || '-');

morgan.token('isCrossOrigin', (req: Request) => {
  const origin = req.headers.origin;
  const serverOrigin = `${req.protocol}://${req.get('host')}`;
  if (origin && origin !== serverOrigin) {
    return 'CORS';
  }
  return 'Same-Origin';
});

const customLoggerFormat =
  ':remote-addr - :remote-user [:date] ":method :url HTTP/:http-version" ' +
  ':status :res[content-length] ":referrer" ":user-agent" "Origin: :origin" "CORS Status: :isCrossOrigin"';

const loggerStream: StreamOptions = {
  write: (message) => {
    accessLogStream!.write(message);
  },
};

export { customLoggerFormat, loggerStream };
