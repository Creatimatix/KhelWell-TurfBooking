const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Turf = require('./Turf');

const Slot = sequelize.define('Slot', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
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
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  is_available: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'slots',
  indexes: [
    {
      unique: true,
      fields: ['turf_id', 'date', 'start_time', 'end_time']
    }
  ]
});

// Define associations
Slot.belongsTo(Turf, { foreignKey: 'turf_id', as: 'turf' });

// Override toJSON to format data for frontend
Slot.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  
  // Rename fields to match frontend expectations
  values._id = values.id;
  delete values.id;
  values.turf = values.turf_id;
  delete values.turf_id;
  values.startTime = values.start_time;
  delete values.start_time;
  values.endTime = values.end_time;
  delete values.end_time;
  values.isAvailable = values.is_available;
  delete values.is_available;
  values.isActive = values.is_active;
  delete values.is_active;
  
  return values;
};

module.exports = Slot; 