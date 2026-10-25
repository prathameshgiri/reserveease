const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'reserveease_jwt_super_secret_key_mca_project_2026',
  jwtExpiresIn: '7d',
  sessionCookieName: process.env.SESSION_COOKIE_NAME || 'reserveease_token',
  corsOrigins: [
    process.env.FRONTEND_CUSTOMER_URL || 'http://localhost:3000',
    process.env.FRONTEND_ADMIN_URL || 'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001'
  ],
  dbPath: path.resolve(__dirname, '../../../database')
};

module.exports = config;
