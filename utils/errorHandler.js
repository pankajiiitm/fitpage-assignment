// app/utils/errorHandler.js
const handleError = (res, statusCode, message) => {
    res.status(statusCode).json({ error: message });
};

export { handleError };