const https = require('https');

const LOG_ENDPOINT = 'https://20.244.56.144/evaluation-service/logs';
const LOG_TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJyaXNoYWJiaWphbHdhbjE5QGdtYWlsLmNvbSIsImV4cCI6MTc1MjU1NjQwMSwiaWF0IjoxNzUyNTU1NTAxLCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiZjJhNDRkNDUtZTMzZi00NDk3LTk4ZDUtYTg2YTM1ZTU4ZjhkIiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoicmlzaGFiaCBiaWphbHdhbiIsInN1YiI6ImNjNjVlZGVjLTQwNGItNGQ4Zi05OGNiLTI3ZmI1Y2FmNWQ5NiJ9LCJlbWFpbCI6InJpc2hhYmJpamFsd2FuMTlAZ21haWwuY29tIiwibmFtZSI6InJpc2hhYmggYmlqYWx3YW4iLCJyb2xsTm8iOiIyMjE5NDIxIiwiYWNjZXNzQ29kZSI6IlFBaERVciIsImNsaWVudElEIjoiY2M2NWVkZWMtNDA0Yi00ZDhmLTk4Y2ItMjdmYjVjYWY1ZDk2IiwiY2xpZW50U2VjcmV0IjoiQ2p6Rm1ZZUtzbWRldEhrYyJ9.-_s790NG353I2e1q1cmFuFS-e9Z0Lr97mTywzXpCN0k';

const logMessage = async (stack, level, message, pkg = 'custom') => {
  const data = JSON.stringify({
    stack: stack.toLowerCase(),
    level: level.toLowerCase(),
    package: pkg.toLowerCase(),
    message
  });

  const options = {
    hostname: '20.244.56.144',
    port: 443,
    path: '/evaluation-service/logs',
    method: 'POST',
    headers: {
      'Authorization': LOG_TOKEN,
      'Content-Type': 'application/json',
      'Content-Length': data.length
    },
    rejectUnauthorized: false
  };

  const req = https.request(options, () => {});
  req.on('error', () => {});
  req.write(data);
  req.end();
};

const loggerMiddleware = async (req, res, next) => {
  const msg = `${req.method} ${req.originalUrl} from ${req.ip}`;
  await logMessage('backend', 'info', msg, 'express');
  next();
};

module.exports = { loggerMiddleware, logMessage };
