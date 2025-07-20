const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');
const Turf = require('./Turf');

const Booking = sequelize.define('Booking', {
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
  turf_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'turfs',
      key: 'id'
    }
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  start_time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  end_time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'completed', 'no_show'),
    defaultValue: 'pending'
  },
  payment_status: {
    type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
    defaultValue: 'pending'
  },
  payment_method: {
    type: DataTypes.ENUM('cash', 'online', 'card'),
    defaultValue: 'online'
  },
  payment_id: {
    type: DataTypes.STRING,
    allowNull: true
  },
  special_requests: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  cancellation_reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  cancelled_by: {
    type: DataTypes.ENUM('user', 'owner', 'admin'),
    allowNull: true
  },
  cancelled_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'bookings'
});

// Define associations
Booking.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Booking.belongsTo(Turf, { foreignKey: 'turf_id', as: 'turf' });

// Override toJSON to format data for frontend
Booking.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  
  // Rename fields to match frontend expectations
  values._id = values.id;
  delete values.id;
  values.user = values.user_id;
  delete values.user_id;
  values.turf = values.turf_id;
  delete values.turf_id;
  values.startTime = values.start_time;
  delete values.start_time;
  values.endTime = values.end_time;
  delete values.end_time;
  values.totalAmount = parseFloat(values.total_amount);
  delete values.total_amount;
  values.paymentStatus = values.payment_status;
  delete values.payment_status;
  values.paymentMethod = values.payment_method;
  delete values.payment_method;
  values.paymentId = values.payment_id;
  delete values.payment_id;
  values.specialRequests = values.special_requests;
  delete values.special_requests;
  values.cancellationReason = values.cancellation_reason;
  delete values.cancellation_reason;
  values.cancelledBy = values.cancelled_by;
  delete values.cancelled_by;
  values.cancelledAt = values.cancelled_at;
  delete values.cancelled_at;
  values.isActive = values.is_active;
  delete values.is_active;
  
  return values;
};

module.exports = Booking; 