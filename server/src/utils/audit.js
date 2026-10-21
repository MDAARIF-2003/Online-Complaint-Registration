const AuditLog = require('../models/AuditLog');

const recordAudit = async ({ req, actor, action, targetType, targetId, details }) => {
  try {
    const user = actor || (req && req.user);
    if (!user) return;

    const ip = req ? req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress : 'system';

    await AuditLog.create({
      actor: user._id,
      actorEmail: user.email,
      actorRole: user.role,
      action,
      targetType,
      targetId: String(targetId || ''),
      details: details || {},
      ipAddress: String(ip || ''),
    });
  } catch (error) {
    console.error('[Audit Log Error]', error.message);
  }
};

module.exports = { recordAudit };
