const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Middleware untuk logging
app.use((req, res, next) => {
  logger.log({
    level: 'info',
    message: `${req.method} ${req.url}`,
  });
  next();
});

// ...

// Handle error logging
app.use((err, req, res, next) => {
  logger.log({
    level: 'error',
    message: err.message,
  });
  next(err);
});
