const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const Turf = sequelize.define('Turf', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 100]
    }
  },
  owner_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  sport_type: {
    type: DataTypes.ENUM('football', 'cricket', 'tennis', 'basketball', 'badminton', 'volleyball', 'multi-sport'),
    allowNull: false
  },
  location_address: {
    type: DataTypes.STRING,
    allowNull: false
  },
  location_city: {
    type: DataTypes.STRING,
    allowNull: false
  },
  location_state: {
    type: DataTypes.STRING,
    allowNull: false
  },
  location_zip_code: {
    type: DataTypes.STRING,
    allowNull: false
  },
  location_lat: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true
  },
  location_lng: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true
  },
  images: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  amenities: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  size_length: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true
  },
  size_width: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true
  },
  size_unit: {
    type: DataTypes.ENUM('meters', 'feet'),
    defaultValue: 'meters'
  },
  surface: {
    type: DataTypes.ENUM('natural_grass', 'artificial_grass', 'clay', 'hard_court', 'synthetic'),
    allowNull: false
  },
  pricing_hourly_rate: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  pricing_currency: {
    type: DataTypes.STRING,
    defaultValue: 'INR'
  },
  operating_hours_open: {
    type: DataTypes.STRING,
    allowNull: true
  },
  operating_hours_close: {
    type: DataTypes.STRING,
    allowNull: true
  },
  operating_hours_days: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  rating_average: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0,
    validate: {
      min: 0,
      max: 5
    }
  },
  rating_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'turfs',
  hooks: {
    beforeCreate: (turf) => {
      // Ensure images and amenities are arrays
      if (!Array.isArray(turf.images)) turf.images = [];
      if (!Array.isArray(turf.amenities)) turf.amenities = [];
      if (!Array.isArray(turf.operating_hours_days)) turf.operating_hours_days = [];
    }
  }
});

// Define associations
Turf.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });

// Instance method to get location object
Turf.prototype.getLocation = function() {
  return {
    address: this.location_address || '',
    city: this.location_city || '',
    state: this.location_state || '',
    zipCode: this.location_zip_code || '',
    coordinates: this.location_lat && this.location_lng ? {
      lat: parseFloat(this.location_lat),
      lng: parseFloat(this.location_lng)
    } : null
  };
};

// Instance method to set location
Turf.prototype.setLocation = function(location) {
  if (location) {
    this.location_address = location.address;
    this.location_city = location.city;
    this.location_state = location.state;
    this.location_zip_code = location.zipCode;
    if (location.coordinates) {
      this.location_lat = location.coordinates.lat;
      this.location_lng = location.coordinates.lng;
    }
  }
};

// Instance method to get pricing object
Turf.prototype.getPricing = function() {
  return {
    hourlyRate: parseFloat(this.pricing_hourly_rate) || 0,
    currency: this.pricing_currency || 'INR'
  };
};

// Instance method to set pricing
Turf.prototype.setPricing = function(pricing) {
  if (pricing) {
    this.pricing_hourly_rate = pricing.hourlyRate;
    this.pricing_currency = pricing.currency || 'INR';
  }
};

// Instance method to get operating hours object
Turf.prototype.getOperatingHours = function() {
  if (!this.operating_hours_open && !this.operating_hours_close) {
    return null;
  }
  return {
    openTime: this.operating_hours_open,
    closeTime: this.operating_hours_close,
    daysOpen: this.operating_hours_days
  };
};

// Instance method to set operating hours
Turf.prototype.setOperatingHours = function(operatingHours) {
  if (operatingHours) {
    this.operating_hours_open = operatingHours.openTime;
    this.operating_hours_close = operatingHours.closeTime;
    this.operating_hours_days = operatingHours.daysOpen || [];
  }
};

// Instance method to get rating object
Turf.prototype.getRating = function() {
  return {
    average: parseFloat(this.rating_average) || 0,
    count: parseInt(this.rating_count) || 0
  };
};

// Instance method to set rating
Turf.prototype.setRating = function(rating) {
  if (rating) {
    this.rating_average = rating.average;
    this.rating_count = rating.count;
  }
};

// Override toJSON to format nested objects
Turf.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  
  // Format location
  values.location = this.getLocation();
  delete values.location_address;
  delete values.location_city;
  delete values.location_state;
  delete values.location_zip_code;
  delete values.location_lat;
  delete values.location_lng;
  
  // Format pricing
  values.pricing = this.getPricing();
  delete values.pricing_hourly_rate;
  delete values.pricing_currency;
  
  // Format operating hours
  const operatingHours = this.getOperatingHours();
  if (operatingHours) {
    values.operatingHours = operatingHours;
  }
  delete values.operating_hours_open;
  delete values.operating_hours_close;
  delete values.operating_hours_days;
  
  // Format rating
  values.rating = this.getRating();
  delete values.rating_average;
  delete values.rating_count;
  
  // Rename fields to match frontend expectations
  values._id = values.id;
  delete values.id;
  values.sportType = values.sport_type;
  delete values.sport_type;
  // Don't rename owner if it's already an object (from include)
  if (typeof values.owner === 'number') {
    values.owner = values.owner_id;
    delete values.owner_id;
  } else if (values.owner && typeof values.owner === 'object') {
    // If owner is an object, remove the owner_id field
    delete values.owner_id;
  }
  values.isActive = values.is_active;
  delete values.is_active;
  values.isVerified = values.is_verified;
  delete values.is_verified;
  
  return values;
};

module.exports = Turf; 