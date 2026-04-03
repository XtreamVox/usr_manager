// src/utils/handleJwt.js
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import User from '../models/user.models.js';
import RefreshToken from '../models/refreshToken.models.js';

const JWT_SECRET = process.env.JWT_SECRET;
const ACCESS_TOKEN_EXPIRES = '15m';  // Corto
const REFRESH_TOKEN_DAYS = 7;        // Largo

/**
 * Genera access token (corta duración)
 */
export const generateAccessToken = (user) => {
  return jwt.sign(
    { _id: user._id, role: user.role },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRES }
  );
};

/**
 * Genera refresh token (larga duración)
 * Usa crypto para token opaco (no JWT)
 */
export const generateRefreshToken = () => {
  return crypto.randomBytes(64).toString('hex');
};

/**
 * Calcula fecha de expiración del refresh token
 */
export const getRefreshTokenExpiry = () => {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + REFRESH_TOKEN_DAYS);
  return expiry;
};

/**
 * Verifica access token
 */
export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
};

// Ejemplo de rotación de tokens
export const refreshTokens = async (req, res) => {
  const { refreshToken } = req.body;

  const storedToken = await RefreshToken.findOne({ token: refreshToken });

  if (!storedToken) {
    return res.status(401).json({ error: true, message: 'Token no encontrado' });
  }

  // Detectar reutilización de token revocado (posible robo)
  if (storedToken.revokedAt) {
    // Revocar TODOS los tokens del usuario por seguridad
    await RefreshToken.updateMany(
      { user: storedToken.user },
      { revokedAt: new Date() }
    );
    return res.status(401).json({ error: true, message: 'Token reutilizado - todas las sesiones revocadas' });
  }

  if (!storedToken.isActive()) {
    return res.status(401).json({ error: true, message: 'Token expirado' });
  }

  // Revocar token actual
  storedToken.revokedAt = new Date();
  await storedToken.save();

  // Generar nuevos tokens (rotación)
  const user = await User.findById(storedToken.user);
  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken();

  await RefreshToken.create({
    token: newRefreshToken,
    user: user._id,
    expiresAt: getRefreshTokenExpiry(),
    createdByIp: req.ip
  });

  res.json({
    accessToken: newAccessToken,
    refreshToken: newRefreshToken
  });
};