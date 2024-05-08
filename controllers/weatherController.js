import axios from 'axios';
import { config } from "dotenv";
import sequelize from '../config/database.js';
import Location from '../models/locationModel.js';
import { cacheData, getDataFromCache } from '../services/cachingService.js'
import NodeCache from 'node-cache';
import moment from 'moment'
config();
const apiKey = process.env.APIKEY;

const weatherController = {
    getWeatherByLocationId: async (req, res) => {
        const { locationId } = req.params;
        const { temperatureunit } = req.query;

        if (!locationId) {
            return res.status(400).json({ error: 'Location ID not provided in the request parameters' });
        }

        try {
            // Generate cache key using location_id
            const cacheKey = `location_${locationId}`;

            // Check if weather data is present in the cache
            const cachedWeatherInfo = getDataFromCache(cacheKey);
            if (cachedWeatherInfo) {
                return res.json(cachedWeatherInfo);
            }

            // Fetch location details from the database
            const locationData = await Location.findByPk(locationId);
            if (!locationData) {
                return res.status(404).json({ error: 'Location not found' });
            }

            // Fetch weather data from external API
            const url = `https://api.openweathermap.org/data/2.5/weather?q=${locationData.name}&units=${temperatureunit}&appid=${apiKey}`;
            const response = await axios.get(url);
            const data = response.data;

            const weatherInfo = {
                location: data.name,
                weather: {
                    description: data.weather[0].description,
                    temperature: data.main.temp,
                    feels_like: data.main.feels_like,
                    humidity: data.main.humidity,
                    wind_speed: data.wind.speed
                },
                timestamp: new Date(data.dt * 1000).toISOString(),
                units: {
                    temperature: temperatureunit === 'metric' ? 'Celsius' : 'Kelvin',
                }
            };

            // Cache the weather data with location_id as key
            cacheData(cacheKey, weatherInfo);

            res.json(weatherInfo);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch weather data' });
        }
    },

    getHistoricalData: async (req, res) => {
        const { locationName } = req.params;
        const { days } = req.query;

        if (!locationName) {
            return res.status(400).json({ error: 'Location name not provided in the request parameters' });
        }

        if (!days || isNaN(parseInt(days))) {
            return res.status(400).json({ error: 'Number of days must be provided as a valid integer in the query parameters' });
        }

        try {
            // Check if the location exists in the database
            let locationData = await Location.findOne({ where: sequelize.literal(`LOWER(name) = LOWER('${locationName}')`) });

            if (!locationData) {
                // Location not found in the database, fetch latitude and longitude from Geocoding API
                const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(locationName)}&limit=1&appid=${process.env.APIKEY}`;
                const geoResponse = await axios.get(geoUrl);
                const { lat, lon } = geoResponse.data[0];

                // Create a new entry for the location in the database
                locationData = await Location.create({
                    name: locationName,
                    latitude: lat,
                    longitude: lon
                });
            }

            // Generate cache key for location data
            const locationCacheKey = `location_${locationData.location_id}_historical_${days}days`;

            // Check if historical data is present in cache
            const cachedHistoricalData = getDataFromCache(locationCacheKey);
            if (cachedHistoricalData) {
                return res.json(cachedHistoricalData);
            }

            // Calculate start and end times for the desired time range
            const now = moment.utc();
            const startTime = now.clone().subtract(parseInt(days), 'days').unix();

            // Fetch historical data from OpenWeatherMap History API
            const historyUrl = `https://history.openweathermap.org/data/2.5/history/city?lat=${locationData.latitude}&lon=${locationData.longitude}&type=hour&start=${startTime}&end=${now.unix()}&appid=${process.env.APIKEY}`;
            const response = await axios.get(historyUrl);
            const historicalData = response.data;

            // Cache the historical data with location cache key
            cacheData(locationCacheKey, historicalData);

            res.json(historicalData);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch historical data' });
        }
    },

    getRealTimeData: async (req, res) => {
        const { locationName } = req.params;
        const { temperatureunit } = req.query;

        if (!locationName) {
            return res.status(400).json({ error: 'Location not provided in the request payload' });
        }

        try {
            // Check if the location exists in the database
            // Check if the location exists in the database (case-insensitive)
            let locationData = await Location.findOne({ where: sequelize.literal(`LOWER(name) = LOWER('${locationName}')`) });


            // If the location does not exist in the database, fetch it from OpenWeatherMap API
            if (!locationData) {
                const url = `https://api.openweathermap.org/data/2.5/weather?q=${locationName}&units=${temperatureunit}&appid=${apiKey}`;
                const response = await axios.get(url);
                const data = response.data;

                // Create new location in the database
                locationData = await Location.create({
                    name: data.name,
                    latitude: data.coord.lat,
                    longitude: data.coord.lon
                });
            }

            // Generate cache key using location_id
            const cacheKey = `location_${locationData.location_id}`;

            // Check if weather data is present in the cache
            const cachedWeatherInfo = getDataFromCache(cacheKey);
            if (cachedWeatherInfo) {
                return res.json(cachedWeatherInfo);
            }

            // Weather data not found in cache, fetch from OpenWeatherMap API
            const url = `https://api.openweathermap.org/data/2.5/weather?q=${locationName}&units=${temperatureunit}&appid=${apiKey}`;
            const response = await axios.get(url);
            const data = response.data;

            const weatherInfo = {
                location: data.name,
                weather: {
                    description: data.weather[0].description,
                    temperature: data.main.temp,
                    feels_like: data.main.feels_like,
                    humidity: data.main.humidity,
                    wind_speed: data.wind.speed
                },
                timestamp: new Date(data.dt * 1000).toISOString(),
                units: {
                    temperature: temperatureunit === 'metric' ? 'Celsius' : 'Kelvin',
                }
            };

            // Cache the weather data with location_id as key
            cacheData(cacheKey, weatherInfo);

            res.json(weatherInfo);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch weather data' });
        }
    }
};

export default weatherController;