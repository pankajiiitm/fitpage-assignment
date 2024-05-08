import express from 'express';
const router = express.Router();
import weatherController from '../controllers/weatherController.js';

// Define routes
router.get('/weatherbylocationid/:locationId', weatherController.getWeatherByLocationId);
router.get('/historicaldata/:locationName', weatherController.getHistoricalData);
router.get('/weather/:locationName', weatherController.getRealTimeData);

export default router;