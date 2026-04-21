import express from 'express';
import helmet from 'helmet';
import { sanitizeBody } from './middleware/sanitize.middleware.js';
import limiter from './middleware/rateLimit.middleware.js';
import { join } from 'node:path';
import router from './routes/index.js';
import { errorHandler, notFound } from './middleware/error-handler.middleware.js';
import { initializeNotificationListeners } from './services/notification.service.js';
import morganBody from 'morgan-body';
import { loggerStream } from './utils/handleLogger.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Después de express.json(), antes de las rutas
morganBody(app, {
  noColors: true,
  skip: (req, res) => res.statusCode < 400, // Solo errores
  stream: loggerStream
});
app.use(helmet());

app.use(sanitizeBody);

app.use(limiter);

initializeNotificationListeners();

app.use('/uploads', express.static(join(import.meta.dirname, '../uploads')));

app.use('/api', router);

app.use(notFound);

app.use(errorHandler);

export default app;