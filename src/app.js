import express from 'express';
import helmet from 'helmet';
import { sanitizeBody } from './middleware/sanitize.middleware.js';
import limiter from './middleware/rateLimit.middleware.js';
import { join } from 'node:path';
import router from './routes/user.routes.js';
import { errorHandler, notFound } from './middleware/error-handler.middleware.js';
import { initializeNotificationListeners } from './services/notification.service.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(helmet());

app.use(sanitizeBody);

app.use(limiter);

initializeNotificationListeners();

app.use('/uploads', express.static(join(import.meta.dirname, '../uploads')));

app.use('/api/user', router);

app.use(notFound);

app.use(errorHandler);

export default app;