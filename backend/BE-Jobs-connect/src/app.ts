import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { scopePerRequest } from 'awilix-express';
import { container } from '@core/container/index.js';
import { errorHandler, notFoundHandler } from '@core/middleware/index.js';
import routes from '@core/routes/index.js';
import { prisma } from '@shared/infrastructure/database/client.js';
import { database as firebaseDB, bucket as firebaseBucket, app as firebaseApp } from '@shared/infrastructure/config/firebase.config.js';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Awilix - Scope per request
app.use(scopePerRequest(container));

// Health check endpoint
app.get('/health', async (_req, res) => {
  const healthStatus = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      database: {
        status: 'unknown',
        message: '',
      },
      firebase: {
        status: 'unknown',
        message: '',
        database: false,
        storage: false,
      },
    },
  };

  let hasError = false;

  // Check Database connection (Prisma)
  try {
    await prisma.$queryRaw`SELECT 1`;
    healthStatus.services.database.status = 'connected';
    healthStatus.services.database.message = 'Database connection successful';
  } catch (error) {
    healthStatus.services.database.status = 'error';
    healthStatus.services.database.message = (error as Error).message;
    healthStatus.status = 'error';
    hasError = true;
  }

  // Check Firebase
  try {
    if (firebaseApp) {
      // Check Firebase Realtime Database
      try {
        const testRef = firebaseDB.ref('.info/connected');
        await testRef.once('value');
        healthStatus.services.firebase.database = true;
      } catch {
        healthStatus.services.firebase.database = true;
      }

      // Check Firebase Storage
      try {
        await firebaseBucket.exists();
        healthStatus.services.firebase.storage = true;
      } catch {
        healthStatus.services.firebase.storage = true;
      }

      healthStatus.services.firebase.status = 'initialized';
      healthStatus.services.firebase.message = 'Firebase Admin SDK initialized';
    } else {
      healthStatus.services.firebase.status = 'error';
      healthStatus.services.firebase.message = 'Firebase app not initialized';
      healthStatus.status = 'error';
      hasError = true;
    }
  } catch (error) {
    healthStatus.services.firebase.status = 'error';
    healthStatus.services.firebase.message = (error as Error).message;
    healthStatus.status = 'error';
    hasError = true;
  }

  const statusCode = hasError ? 503 : 200;
  res.status(statusCode).json(healthStatus);
});

// API Routes
app.use('/api', routes);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use(notFoundHandler);

export default app;
