import rateLimit from 'express-rate-limit';

// Configuración global
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 peticiones por ventana
  message: {
    error: true,
    message: 'Demasiadas peticiones, intenta en 15 minutos',
    code: 'RATE_LIMIT'
  },
  standardHeaders: true, // Headers RateLimit-*
  legacyHeaders: false   // Desactiva X-RateLimit-*
});

export default limiter;
