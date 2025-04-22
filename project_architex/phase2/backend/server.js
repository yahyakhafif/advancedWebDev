// server.js
const app = require('./app');

const PORT = process.env.PORT || 5000;

// Only listen when not running tests
if (process.env.NODE_ENV !== 'test') {
    const server = app.listen(PORT, () =>
        console.log(`Server running on port ${PORT}`)
    );

    // Gracefully handle unhandled promise rejections
    process.on('unhandledRejection', (err, promise) => {
        console.error(`Unhandled Rejection: ${err.message}`);
        server.close(() => process.exit(1));
    });
}
