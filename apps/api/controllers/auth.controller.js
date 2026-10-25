const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../services/db.service');
const config = require('../config');

// Helper to sign JWT
const signToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
};

// Helper to set HTTP-only cookie
const setAuthCookie = (res, token) => {
  res.cookie(config.sessionCookieName, token, {
    httpOnly: true,
    secure: false, // development localhost
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await db.findOne('users', u => u.email.toLowerCase() === normalizedEmail);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await db.create('users', {
      id: `USR-${Date.now().toString().slice(-6)}`,
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: 'customer', // Public registration ALWAYS assigns customer role
      phone: phone ? phone.trim() : '',
      address: address ? address.trim() : '',
      status: 'active'
    });

    const token = signToken(newUser);
    setAuthCookie(res, token);

    await db.logAudit({
      actorId: newUser.id,
      actorName: newUser.name,
      actorRole: newUser.role,
      action: 'CUSTOMER_REGISTRATION',
      details: `New customer registered: ${newUser.email}`
    });

    const sanitizedUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      phone: newUser.phone,
      address: newUser.address
    };

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to ReserveEase.',
      user: sanitizedUser,
      token
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await db.findOne('users', u => u.email.toLowerCase() === normalizedEmail);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({
        success: false,
        message: 'Your account is deactivated. Please contact support.'
      });
    }

    const token = signToken(user);
    setAuthCookie(res, token);

    await db.logAudit({
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      action: 'USER_LOGIN',
      details: `${user.role.toUpperCase()} logged in: ${user.email}`
    });

    const sanitizedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
      address: user.address || ''
    };

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      user: sanitizedUser,
      token
    });
  } catch (error) {
    next(error);
  }
};

exports.adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Admin email and password are required.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await db.findOne('users', u => u.email.toLowerCase() === normalizedEmail);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid administrator credentials.'
      });
    }

    // Role check: Strictly reject customers from admin login
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Administrator privileges are required.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid administrator credentials.'
      });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({
        success: false,
        message: 'Admin account is currently inactive.'
      });
    }

    const token = signToken(user);
    setAuthCookie(res, token);

    await db.logAudit({
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      action: 'ADMIN_LOGIN',
      details: `Admin logged into management portal: ${user.email}`
    });

    const sanitizedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
      address: user.address || ''
    };

    return res.status(200).json({
      success: true,
      message: 'Admin authentication successful.',
      user: sanitizedUser,
      token
    });
  } catch (error) {
    next(error);
  }
};

exports.logout = (req, res) => {
  res.clearCookie(config.sessionCookieName, {
    httpOnly: true,
    sameSite: 'lax'
  });

  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.'
  });
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await db.getById('users', req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    const sanitizedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
      address: user.address || '',
      createdAt: user.createdAt
    };

    return res.status(200).json({
      success: true,
      user: sanitizedUser
    });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address } = req.body;
    const updates = {};

    if (name && name.trim()) updates.name = name.trim();
    if (phone !== undefined) updates.phone = phone.trim();
    if (address !== undefined) updates.address = address.trim();

    const updated = await db.update('users', req.user.id, updates);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.'
      });
    }

    await db.logAudit({
      actorId: req.user.id,
      actorName: updated.name,
      actorRole: updated.role,
      action: 'UPDATE_PROFILE',
      details: `Profile updated for ${updated.email}`
    });

    const sanitizedUser = {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      phone: updated.phone || '',
      address: updated.address || '',
      createdAt: updated.createdAt
    };

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: sanitizedUser
    });
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.'
      });
    }

    const user = await db.getById('users', req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.'
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await db.update('users', req.user.id, { password: hashedPassword });

    await db.logAudit({
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      action: 'CHANGE_PASSWORD',
      details: `Password changed for user ${user.email}`
    });

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully.'
    });
  } catch (error) {
    next(error);
  }
};
