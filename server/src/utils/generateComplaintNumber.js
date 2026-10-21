const crypto = require('crypto');

/**
 * Generates a clean, unique complaint reference identifier.
 * Example format: CMP-20261021-A89F2
 */
const generateComplaintNumber = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `CMP-${dateStr}-${randomSuffix}`;
};

module.exports = generateComplaintNumber;
