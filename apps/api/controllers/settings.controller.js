const db = require('../services/db.service');

exports.getSettings = async (req, res, next) => {
  try {
    const settings = await db.getSettings();
    return res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    next(error);
  }
};

exports.updateSettings = async (req, res, next) => {
  try {
    const {
      appName,
      tagline,
      currency,
      currencySymbol,
      taxRatePercent,
      contactEmail,
      contactPhone,
      address,
      cancellationMinHours,
      maxBookingsPerCustomerPerDay,
      paymentMethods,
      allowInstantConfirmation
    } = req.body;

    const updates = {};
    if (appName !== undefined) updates.appName = appName.trim();
    if (tagline !== undefined) updates.tagline = tagline.trim();
    if (currency !== undefined) updates.currency = currency.trim();
    if (currencySymbol !== undefined) updates.currencySymbol = currencySymbol.trim();
    if (taxRatePercent !== undefined) updates.taxRatePercent = Number(taxRatePercent);
    if (contactEmail !== undefined) updates.contactEmail = contactEmail.trim();
    if (contactPhone !== undefined) updates.contactPhone = contactPhone.trim();
    if (address !== undefined) updates.address = address.trim();
    if (cancellationMinHours !== undefined) updates.cancellationMinHours = Number(cancellationMinHours);
    if (maxBookingsPerCustomerPerDay !== undefined) updates.maxBookingsPerCustomerPerDay = Number(maxBookingsPerCustomerPerDay);
    if (Array.isArray(paymentMethods)) updates.paymentMethods = paymentMethods;
    if (allowInstantConfirmation !== undefined) updates.allowInstantConfirmation = Boolean(allowInstantConfirmation);

    const updated = await db.updateSettings(updates);

    await db.logAudit({
      actorId: req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'UPDATE_SETTINGS',
      details: 'System settings updated by administrator'
    });

    return res.status(200).json({
      success: true,
      message: 'System settings updated successfully.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

exports.getAuditLogs = async (req, res, next) => {
  try {
    const logs = await db.getAll('auditLogs');
    return res.status(200).json({
      success: true,
      count: logs.length,
      data: logs.slice(0, 100) // latest 100 logs
    });
  } catch (error) {
    next(error);
  }
};
