const cron = require('node-cron');
const BackupService = require('../services/backup.service');

const initializeBackupCron = () => {
    // Correr todos los días a las 02:00 AM 
    cron.schedule('0 2 * * *', async () => {
        try {
            console.log(`[BackupCron] Starting automatic global DB backup...`);
            await BackupService.generateBackupFolder();
            console.log(`[BackupCron] Automatic global DB backup completed successfully.`);
        } catch (error) {
            console.error('[BackupCron] Error during automatic backup:', error);
        }
    });
};

module.exports = {
    initializeBackupCron
};
