import { PrismaClient } from '@prisma/client';
import { ExpireJobsUseCase } from '../use-cases/ExpireJobsUseCase.js';
import { ExpireInvitationsUseCase } from '../use-cases/ExpireInvitationsUseCase.js';

const prisma = new PrismaClient();

async function runDailyCleanup() {
  const startTime = new Date();
  console.log(`\n========================================`);
  console.log(`Daily Cleanup Job Started at ${startTime.toISOString()}`);
  console.log(`========================================\n`);

  try {
    // 1. Expire Jobs
    console.log('1. Checking for expired jobs...');
    const expireJobsUseCase = new ExpireJobsUseCase({ prisma });
    const jobsResult = await expireJobsUseCase.execute();
    console.log(`   ✓ Expired ${jobsResult.expiredCount} jobs\n`);

    // 2. Expire Invitations
    console.log('2. Checking for expired invitations...');
    const expireInvitationsUseCase = new ExpireInvitationsUseCase({ prisma });
    const invitationsResult = await expireInvitationsUseCase.execute();
    console.log(`   ✓ Expired ${invitationsResult.expiredCount} invitations\n`);

    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();

    console.log(`========================================`);
    console.log(`Daily Cleanup Job Completed`);
    console.log(`Duration: ${duration}ms`);
    console.log(`Summary:`);
    console.log(`  - Expired Jobs: ${jobsResult.expiredCount}`);
    console.log(`  - Expired Invitations: ${invitationsResult.expiredCount}`);
    console.log(`========================================\n`);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Daily Cleanup Job Failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the job
runDailyCleanup();
