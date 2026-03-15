const { login, refresh, logout } = require('../services/authService');

async function loginHandler(req, res) {
  try {
    const result = await login(req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message || 'Login failed' });
  }
}

async function refreshHandler(req, res) {
  try {
    const { refreshToken } = req.body;
    const result = await refresh(refreshToken);
    res.json(result);
  } catch (err) {
    res.status(401).json({ message: err.message || 'Token refresh failed' });
  }
}

async function logoutHandler(req, res) {
  try {
    const { refreshToken } = req.body;
    await logout(req.user?.id, refreshToken);
    res.json({ message: 'Logged out' });
  } catch (err) {
    res.status(400).json({ message: err.message || 'Logout failed' });
  }
}

module.exports = {
  loginHandler,
  refreshHandler,
  logoutHandler
};

