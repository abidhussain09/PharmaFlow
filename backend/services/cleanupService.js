const cron = require('node-cron');
const { cleanupExpiredGuests } = require('../controllers/authController');

class CleanupService {
  constructor() {
    this.isRunning = false;
  }

  // Start the cleanup service
  start() {
    if (this.isRunning) {
      console.log('Cleanup service is already running');
      return;
    }

    // Run cleanup every 15 minutes
    this.cronJob = cron.schedule('*/15 * * * *', async () => {
      console.log('Running guest account cleanup...');
      try {
        const cleanedCount = await cleanupExpiredGuests();
        if (cleanedCount > 0) {
          console.log(`Cleaned up ${cleanedCount} expired guest accounts`);
        }
      } catch (error) {
        console.error('Error during scheduled cleanup:', error);
      }
    }, {
      scheduled: false // Don't start immediately
    });

    this.cronJob.start();
    this.isRunning = true;
    console.log('Guest cleanup service started - running every 15 minutes');
  }

  // Stop the cleanup service
  stop() {
    if (this.cronJob) {
      this.cronJob.stop();
      this.isRunning = false;
      console.log('Guest cleanup service stopped');
    }
  }

  // Run cleanup manually
  async runCleanup() {
    console.log('Running manual guest account cleanup...');
    try {
      const cleanedCount = await cleanupExpiredGuests();
      console.log(`Manually cleaned up ${cleanedCount} expired guest accounts`);
      return cleanedCount;
    } catch (error) {
      console.error('Error during manual cleanup:', error);
      throw error;
    }
  }

  // Get service status
  getStatus() {
    return {
      isRunning: this.isRunning,
      nextRun: this.cronJob ? this.cronJob.nextDates().toString() : null
    };
  }
}

// Create singleton instance
const cleanupService = new CleanupService();

module.exports = cleanupService;
