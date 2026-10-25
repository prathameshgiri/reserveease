const fs = require('fs');
const path = require('path');
const config = require('../config');

class DatabaseService {
  constructor() {
    this.dbDir = config.dbPath;
    this.queues = new Map(); // collectionName -> Promise queue for serialized writes
    this.initDatabase();
  }

  getFilePath(collection) {
    return path.join(this.dbDir, `${collection}.json`);
  }

  // Ensure database directory and files exist
  initDatabase() {
    if (!fs.existsSync(this.dbDir)) {
      fs.mkdirSync(this.dbDir, { recursive: true });
    }

    const collections = ['users', 'services', 'reservations', 'payments', 'settings', 'auditLogs'];
    for (const col of collections) {
      const filePath = this.getFilePath(col);
      if (!fs.existsSync(filePath)) {
        if (col === 'settings') {
          fs.writeFileSync(filePath, JSON.stringify({
            appName: 'ReserveEase',
            tagline: 'Customer Reservation & Booking Management System',
            currency: 'INR',
            currencySymbol: '₹',
            taxRatePercent: 18,
            contactEmail: 'support@reserveease.com',
            contactPhone: '+91 22 4589 1200',
            address: '401 Tech Park, Bandra Kurla Complex, Mumbai, Maharashtra 400051',
            cancellationMinHours: 24,
            maxBookingsPerCustomerPerDay: 3,
            paymentMethods: ['UPI', 'Credit/Debit Card', 'Net Banking'],
            allowInstantConfirmation: true
          }, null, 2), 'utf-8');
        } else {
          fs.writeFileSync(filePath, JSON.stringify([], null, 2), 'utf-8');
        }
      }
    }
  }

  // Serialized queue executor to prevent concurrent write collisions
  enqueue(collection, task) {
    if (!this.queues.has(collection)) {
      this.queues.set(collection, Promise.resolve());
    }
    const currentQueue = this.queues.get(collection);
    const nextQueue = currentQueue.then(() => task()).catch(err => {
      console.error(`DB Write Error in [${collection}]:`, err);
      throw err;
    });
    this.queues.set(collection, nextQueue);
    return nextQueue;
  }

  async read(collection) {
    const filePath = this.getFilePath(collection);
    try {
      if (!fs.existsSync(filePath)) {
        return collection === 'settings' ? {} : [];
      }
      const raw = await fs.promises.readFile(filePath, 'utf-8');
      if (!raw.trim()) {
        return collection === 'settings' ? {} : [];
      }
      return JSON.parse(raw);
    } catch (error) {
      console.error(`Error reading ${collection}.json:`, error);
      return collection === 'settings' ? {} : [];
    }
  }

  async write(collection, data) {
    return this.enqueue(collection, async () => {
      const filePath = this.getFilePath(collection);
      const tempPath = `${filePath}.tmp.${Date.now()}`;
      const payload = JSON.stringify(data, null, 2);
      await fs.promises.writeFile(tempPath, payload, 'utf-8');
      await fs.promises.rename(tempPath, filePath);
      return data;
    });
  }

  async getAll(collection) {
    const data = await this.read(collection);
    return Array.isArray(data) ? data : [];
  }

  async getById(collection, id) {
    const list = await this.getAll(collection);
    return list.find(item => String(item.id) === String(id)) || null;
  }

  async find(collection, predicate) {
    const list = await this.getAll(collection);
    return list.filter(predicate);
  }

  async findOne(collection, predicate) {
    const list = await this.getAll(collection);
    return list.find(predicate) || null;
  }

  async create(collection, item) {
    const list = await this.getAll(collection);
    const newItem = {
      id: item.id || `${collection.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`,
      ...item,
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    list.unshift(newItem);
    await this.write(collection, list);
    return newItem;
  }

  async update(collection, id, updates) {
    const list = await this.getAll(collection);
    const index = list.findIndex(item => String(item.id) === String(id));
    if (index === -1) {
      return null;
    }
    const updated = {
      ...list[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    list[index] = updated;
    await this.write(collection, list);
    return updated;
  }

  async delete(collection, id) {
    const list = await this.getAll(collection);
    const index = list.findIndex(item => String(item.id) === String(id));
    if (index === -1) {
      return false;
    }
    list.splice(index, 1);
    await this.write(collection, list);
    return true;
  }

  // Settings specific
  async getSettings() {
    const data = await this.read('settings');
    return data || {};
  }

  async updateSettings(updates) {
    return this.enqueue('settings', async () => {
      const current = await this.read('settings');
      const updated = { ...current, ...updates, updatedAt: new Date().toISOString() };
      const filePath = this.getFilePath('settings');
      await fs.promises.writeFile(filePath, JSON.stringify(updated, null, 2), 'utf-8');
      return updated;
    });
  }

  // Audit Log helper
  async logAudit({ actorId = 'SYSTEM', actorName = 'System', actorRole = 'system', action, details, meta = {} }) {
    try {
      const logEntry = {
        id: `LOG-${Date.now().toString().slice(-6)}`,
        actorId,
        actorName,
        actorRole,
        action,
        details,
        meta,
        timestamp: new Date().toISOString()
      };
      const logs = await this.getAll('auditLogs');
      logs.unshift(logEntry);
      // Keep only latest 1000 logs
      if (logs.length > 1000) {
        logs.length = 1000;
      }
      await this.write('auditLogs', logs);
      return logEntry;
    } catch (err) {
      console.error('Audit Log Error:', err);
    }
  }
}

module.exports = new DatabaseService();
