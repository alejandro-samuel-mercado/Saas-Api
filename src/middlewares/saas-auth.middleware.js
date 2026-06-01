const jwt = require('jsonwebtoken');

const SAAS_SECRET = process.env.SAAS_JWT_SECRET || process.env.JWT_SECRET || 'saas_fallback_secret';

/**
 * Middleware para autenticar al dueño del SaaS.
 * Verifica un JWT que contenga { role: 'SAAS_OWNER' }
 */
const authenticateSaasOwner = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No autorizado.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, SAAS_SECRET);

    if (decoded.role !== 'SAAS_OWNER') {
      return res.status(403).json({ success: false, message: 'Acceso denegado. Solo para el dueño del SaaS.' });
    }

    req.saasOwner = decoded;
    next();
  } catch (error) {
    console.error('[SaaSAuth] Error:', error.message);
    return res.status(401).json({ success: false, message: 'Token inválido o expirado.' });
  }
};

module.exports = { authenticateSaasOwner };
