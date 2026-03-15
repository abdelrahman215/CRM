const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpiresIn, refreshTokenSecret, refreshTokenExpiresIn } = require('../config/env');
const db = require('../config/db');

function generateAccessToken(payload) {
  return jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn });
}

function generateRefreshToken(payload) {
  return jwt.sign(payload, refreshTokenSecret, { expiresIn: refreshTokenExpiresIn });
}

function verifyAccessToken(token) {
  return jwt.verify(token, jwtSecret);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, refreshTokenSecret);
}

async function storeRefreshToken(userId, token, expiresAt) {
  await db.query(
    'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
    [userId, token, expiresAt]
  );
}

async function revokeRefreshToken(token) {
  await db.query('DELETE FROM refresh_tokens WHERE token = $1', [token]);
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  storeRefreshToken,
  revokeRefreshToken
};

