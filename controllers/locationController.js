// app/controllers/locationController.js
import Location from '../models/locationModel.js';

const locationController = {
    getAllLocations: async (req, res) => {
        try {
            const locations = await Location.findAll();
            res.json(locations);
        } catch (error) {
            res.status(500).json({ error: 'Failed to retrieve locations' });
        }
    },
    addLocation: async (req, res) => {
        try {
            const { name, latitude, longitude } = req.body;
            const newLocation = await Location.create({ name, latitude, longitude });
            res.status(201).json(newLocation);
        } catch (error) {
            res.status(500).json({ error: 'Failed to add location' });
        }
    },
    getLocationById: async (req, res) => {
        try {
            const { locationId } = req.params;
            const location = await Location.findByPk(locationId);
            if (!location) {
                return res.status(404).json({ error: 'Location not found' });
            }
            res.json(location);
        } catch (error) {
            res.status(500).json({ error: 'Failed to retrieve location by ID' });
        }
    },

    updateLocation: async (req, res) => {
        try {
            const { locationId } = req.params;
            const { name, latitude, longitude } = req.body;
            const [updated] = await Location.update({ name, latitude, longitude }, {
                where: { location_id: locationId }
            });
            if (!updated) {
                return res.status(404).json({ error: 'Location not found' });
            }
            res.json({ message: `Location with ID ${locationId} updated successfully` });
        } catch (error) {
            res.status(500).json({ error: 'Failed to update location' });
        }
    },
    deleteLocation: async (req, res) => {
        try {
            const { locationId } = req.params;
            const deleted = await Location.destroy({
                where: { location_id: locationId }
            });
            if (!deleted) {
                return res.status(404).json({ error: 'Location not found' });
            }
            res.json({ message: `Location with ID ${locationId} deleted successfully` });
        } catch (error) {
            res.status(500).json({ error: 'Failed to delete location' });
        }
    }
};

export default locationController;
