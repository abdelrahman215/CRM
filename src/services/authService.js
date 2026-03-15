const { z } = require('zod');
const userRepository = require('../repositories/userRepository');
const { comparePassword } = require('../utils/password');
const {
  generateAccessToken,
  generateRefreshToken,
  storeRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken
} = require('../utils/tokens');
const { logActivity } = require('./activityService');

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

async function login(payload) {
  const { email, password } = loginSchema.parse(payload);

  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const valid = await comparePassword(password, user.password);
  if (!valid) {
    throw new Error('Invalid credentials');
  }

  const accessToken = generateAccessToken({ id: user.id, role: user.role, name: user.name });
  const refreshToken = generateRefreshToken({ id: user.id });

  const decodedRefresh = verifyRefreshToken(refreshToken);
  await storeRefreshToken(user.id, refreshToken, new Date(decodedRefresh.exp * 1000));

  await logActivity(user.id, 'login', user.id);

  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    accessToken,
    refreshToken
  };
}

async function refresh(token) {
  if (!token) {
    throw new Error('Missing refresh token');
  }
  const decoded = verifyRefreshToken(token);
  const user = await userRepository.findById(decoded.id);
  if (!user || !user.is_active) {
    throw new Error('Invalid user');
  }
  const accessToken = generateAccessToken({ id: user.id, role: user.role, name: user.name });
  return { accessToken };
}

async function logout(userId, token) {
  if (token) {
    await revokeRefreshToken(token);
  }
  await logActivity(userId, 'logout', userId);
}

module.exports = {
  login,
  refresh,
  logout
};

