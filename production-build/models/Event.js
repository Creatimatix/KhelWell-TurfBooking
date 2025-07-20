const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const Event = sequelize.define('Event', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  end_date: {
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
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  sport_type: {
    type: DataTypes.ENUM('football', 'cricket', 'tennis', 'basketball', 'badminton', 'volleyball', 'multi-sport', 'general'),
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('tournament', 'championship', 'league', 'exhibition', 'training', 'other'),
    allowNull: false
  },
  entry_fee: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  max_participants: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  current_participants: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('upcoming', 'ongoing', 'completed', 'cancelled'),
    defaultValue: 'upcoming'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  registration_deadline: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  prizes: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  rules: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  contact_info: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'events',
  hooks: {
    beforeCreate: (event) => {
      // Ensure arrays are properly initialized
      if (!Array.isArray(event.prizes)) event.prizes = [];
      if (!Array.isArray(event.rules)) event.rules = [];
    }
  }
});

// Define associations
Event.belongsTo(User, { foreignKey: 'created_by', as: 'createdBy' });

// Override toJSON to format data for frontend
Event.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  
  // Rename fields to match frontend expectations
  values._id = values.id;
  delete values.id;
  values.startDate = values.start_date;
  delete values.start_date;
  values.endDate = values.end_date;
  delete values.end_date;
  values.startTime = values.start_time;
  delete values.start_time;
  values.endTime = values.end_time;
  delete values.end_time;
  values.sportType = values.sport_type;
  delete values.sport_type;
  values.entryFee = parseFloat(values.entry_fee);
  delete values.entry_fee;
  values.maxParticipants = values.max_participants;
  delete values.max_participants;
  values.currentParticipants = values.current_participants;
  delete values.current_participants;
  values.createdBy = values.created_by;
  delete values.created_by;
  values.registrationDeadline = values.registration_deadline;
  delete values.registration_deadline;
  values.contactInfo = values.contact_info;
  delete values.contact_info;
  values.isActive = values.is_active;
  delete values.is_active;
  
  return values;
};

module.exports = Event;