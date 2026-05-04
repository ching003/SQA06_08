import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { prisma } from '@shared/infrastructure/database/client.js';
import { app as firebaseApp } from '@shared/infrastructure/config/firebase.config.js';
import { startCronScheduler } from './cron/scheduler.js';

const PORT = process.env.PORT || 4000;

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log('\n🔍 Checking services...');

  // Start cron scheduler
  startCronScheduler();

  // Check Database on startup
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database: Connected');
  } catch (error) {
    console.log('❌ Database: Connection failed');
    console.log(`   Error: ${(error as Error).message}`);
  }

  // Check Firebase on startup
  if (firebaseApp) {
    console.log('✅ Firebase: Initialized');
    if (process.env.FIREBASE_DATABASE_URL) {
      console.log(`   Database URL: ${process.env.FIREBASE_DATABASE_URL}`);
    }
    if (process.env.FIREBASE_STORAGE_BUCKET) {
      console.log(`   Storage Bucket: ${process.env.FIREBASE_STORAGE_BUCKET}`);
    }
  } else {
    console.log('⚠️  Firebase: Not initialized');
  }

  console.log('');
});
