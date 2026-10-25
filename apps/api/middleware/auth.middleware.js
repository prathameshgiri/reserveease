const jwt = require('jsonwebtoken');
const config = require('../config');
const db = require('../services/db.service');

const authenticate = async (req, res, next) => {
  try {
    let token = null;

    // Check cookie
    if (req.cookies && req.cookies[config.sessionCookieName]) {
      token = req.cookies[config.sessionCookieName];
    }
    // Check Authorization header as fallback
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Check custom header
    else if (req.headers['x-access-token']) {
      token = req.headers['x-access-token'];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.'
      });
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await db.getById('users', decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Account not found or session expired.'
      });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    // Attach sanitized user to request
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
      address: user.address || ''
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please log in again.'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid session token.'
    });
  }
};

module.exports = authenticate;
