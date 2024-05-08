// app/services/cachingService.js
import NodeCache from 'node-cache';

// Initialize a new instance of NodeCache
const cache = new NodeCache();

// Function to cache data
const cacheData = (key, data) => {
    // Store the data in the cache with the specified key
    cache.set(key, data);
};

// Function to retrieve data from the cache
const getDataFromCache = (key) => {
    // Retrieve data from the cache using the specified key
    return cache.get(key);
};

export { cacheData, getDataFromCache };

