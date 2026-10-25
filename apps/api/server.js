const app = require('./app');
const config = require('./config');

const PORT = config.port || 5000;

const server = app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 ReserveEase Backend API listening on port ${PORT}`);
  console.log(`   Customer origin allowed: http://localhost:3000`);
  console.log(`   Admin origin allowed:    http://localhost:3001`);
  console.log(`   Database storage:        ${config.dbPath}`);
  console.log(`====================================================`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Closing HTTP server...');
  server.close(() => {
    console.log('HTTP server closed.');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received. Closing HTTP server...');
  server.close(() => {
    console.log('HTTP server closed.');
  });
});
