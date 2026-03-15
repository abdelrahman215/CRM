require('dotenv').config();

const config = {
  port: process.env.PORT || 4000,
  jwtSecret: process.env.JWT_SECRET || 'change_me_in_production',
  jwtExpiresIn: '1h',
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || 'change_refresh_secret',
  refreshTokenExpiresIn: '7d'
};

module.exports = config;

