const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const OTP = sequelize.define('OTP', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  phone: {
    type: DataTypes.STRING(15),
    allowNull: false
  },
  otp_code: {
    type: DataTypes.STRING(6),
    allowNull: false
  },
  is_used: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'otps',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = OTP; 