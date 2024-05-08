// app/routes/locationRoutes.js
import express from 'express';
const router = express.Router();
import locationController from '../controllers/locationController.js';

// Define routes
router.get('/locations', locationController.getAllLocations);
router.post('/locations', locationController.addLocation);
router.get('/location/:locationId', locationController.getLocationById);
router.put('/locations/:locationId', locationController.updateLocation);
router.delete('/locations/:locationId', locationController.deleteLocation);

export default router;