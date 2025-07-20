const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');
const Booking = require('./Booking');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  booking_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'bookings',
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('booking_created', 'booking_confirmed', 'booking_cancelled', 'booking_reminder', 'payment_received', 'general'),
    defaultValue: 'general'
  },
  is_read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'notifications'
});

// Define associations
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Notification.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });

// Override toJSON to format data for frontend
Notification.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  
  // Rename fields to match frontend expectations
  values._id = values.id;
  delete values.id;
  
  // Handle user association
  if (values.user) {
    // User object is already populated
    delete values.user_id;
  } else if (values.user_id) {
    // Only user_id is available, keep it as is
    values.user = values.user_id;
    delete values.user_id;
  }
  
  // Handle booking association
  if (values.booking) {
    // Booking object is already populated
    delete values.booking_id;
  } else if (values.booking_id) {
    // Only booking_id is available, keep it as is
    values.booking = values.booking_id;
    delete values.booking_id;
  }
  
  values.isRead = Boolean(values.is_read);
  delete values.is_read;
  values.isActive = Boolean(values.is_active);
  delete values.is_active;
  
  return values;
};

module.exports = Notification; 