const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
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
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [6, 255]
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('user', 'owner', 'admin'),
    defaultValue: 'user'
  },
  address_street: {
    type: DataTypes.STRING,
    allowNull: true
  },
  address_city: {
    type: DataTypes.STRING,
    allowNull: true
  },
  address_state: {
    type: DataTypes.STRING,
    allowNull: true
  },
  address_zip_code: {
    type: DataTypes.STRING,
    allowNull: true
  },
  profile_image: {
    type: DataTypes.STRING,
    allowNull: true
  },
  interested_sports: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  date_of_birth: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  gender: {
    type: DataTypes.ENUM('Male', 'Female', 'Other', 'Prefer not to say'),
    allowNull: true
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'users',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// Instance method to compare password
User.prototype.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    console.error('Password comparison error:', error);
    return false;
  }
};

// Instance method to get address object
User.prototype.getAddress = function() {
  if (!this.address_street && !this.address_city && !this.address_state && !this.address_zip_code) {
    return null;
  }
  return {
    street: this.address_street,
    city: this.address_city,
    state: this.address_state,
    zipCode: this.address_zip_code
  };
};

// Instance method to set address
User.prototype.setAddress = function(address) {
  if (address) {
    this.address_street = address.street;
    this.address_city = address.city;
    this.address_state = address.state;
    this.address_zip_code = address.zipCode;
  }
};

// Override toJSON to exclude password and format address
User.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  delete values.password;
  
  // Format address
  if (values.address_street || values.address_city || values.address_state || values.address_zip_code) {
    values.address = {
      street: values.address_street,
      city: values.address_city,
      state: values.address_state,
      zipCode: values.address_zip_code
    };
  }
  
  // Remove individual address fields
  delete values.address_street;
  delete values.address_city;
  delete values.address_state;
  delete values.address_zip_code;
  
  // Ensure interested_sports is always an array
  if (!values.interested_sports) {
    values.interested_sports = [];
  }
  
  return values;
};

// Define associations
User.associate = (models) => {
  User.hasMany(models.Review, { foreignKey: 'user_id', as: 'reviews' });
  User.hasMany(models.Booking, { foreignKey: 'user_id', as: 'bookings' });
  User.hasMany(models.Turf, { foreignKey: 'owner_id', as: 'ownedTurfs' });
};

module.exports = User; 