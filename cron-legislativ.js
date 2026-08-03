import cron from 'node-cron';
cron.schedule('0 0 1 * *', async () => {
  const taxe = await fetch('API_MO_SAU_SCRAPER');
  // Updatează baza de date
});