const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB Atlas connection string (you'll need to replace this with your own)
const MONGODB_URI = 'mongodb+srv://your-username:your-password@cluster0.mongodb.net/turf-booking?retryWrites=true&w=majority';

// User Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  phone: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'owner', 'admin'],
    default: 'user'
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  profileImage: String,
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Turf Schema
const turfSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    required: true
  },
  sportType: {
    type: String,
    enum: ['football', 'cricket', 'tennis', 'basketball', 'badminton', 'volleyball', 'multi-sport'],
    required: true
  },
  location: {
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zipCode: {
      type: String,
      required: true
    },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  images: [String],
  amenities: [String],
  size: {
    length: Number,
    width: Number,
    unit: {
      type: String,
      enum: ['meters', 'feet']
    }
  },
  surface: {
    type: String,
    enum: ['natural_grass', 'artificial_grass', 'clay', 'hard_court', 'synthetic'],
    required: true
  },
  pricing: {
    hourlyRate: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'INR'
    }
  },
  operatingHours: {
    openTime: String,
    closeTime: String,
    daysOpen: [String]
  },
  rating: {
    average: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Booking Schema
const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  turf: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Turf',
    required: true
  },
  date: {
    type: String,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no_show'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'online', 'card'],
    default: 'online'
  },
  paymentId: String,
  specialRequests: String,
  cancellationReason: String,
  cancelledBy: {
    type: String,
    enum: ['user', 'owner', 'admin']
  },
  cancelledAt: Date,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Event Schema
const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  image: String,
  startDate: {
    type: String,
    required: true
  },
  endDate: {
    type: String,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  sportType: {
    type: String,
    enum: ['football', 'cricket', 'tennis', 'basketball', 'badminton', 'volleyball', 'multi-sport', 'general'],
    required: true
  },
  type: {
    type: String,
    enum: ['tournament', 'championship', 'league', 'exhibition', 'training', 'other'],
    required: true
  },
  entryFee: {
    type: Number,
    required: true
  },
  maxParticipants: Number,
  currentParticipants: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  registrationDeadline: String,
  prizes: [{
    position: String,
    prize: String
  }],
  rules: [String],
  contactInfo: {
    name: String,
    phone: String,
    email: String
  }
}, {
  timestamps: true
});

// Create models
const User = mongoose.model('User', userSchema);
const Turf = mongoose.model('Turf', turfSchema);
const Booking = mongoose.model('Booking', bookingSchema);
const Event = mongoose.model('Event', eventSchema);

// Sample data
const sampleData = {
  users: [
    {
      name: 'Admin User',
      email: 'admin@khelwell.com',
      password: 'admin123',
      phone: '9876543210',
      role: 'admin',
      address: {
        street: '123 Admin Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001'
      }
    },
    {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      phone: '9876543211',
      role: 'user',
      address: {
        street: '456 User Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400002'
      }
    },
    {
      name: 'Turf Owner',
      email: 'owner@example.com',
      password: 'owner123',
      phone: '9876543212',
      role: 'owner',
      address: {
        street: '789 Owner Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400003'
      }
    }
  ],
  turfs: [
    {
      name: 'Premium Football Ground',
      description: 'High-quality artificial grass football ground with floodlights',
      sportType: 'football',
      location: {
        address: 'Sports Complex, Andheri West',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400058'
      },
      images: ['https://via.placeholder.com/400x300?text=Football+Ground'],
      amenities: ['Floodlights', 'Parking', 'Changing Rooms', 'Water Dispenser'],
      surface: 'artificial_grass',
      pricing: {
        hourlyRate: 1500,
        currency: 'INR'
      },
      operatingHours: {
        openTime: '06:00',
        closeTime: '22:00',
        daysOpen: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      },
      rating: {
        average: 4.5,
        count: 25
      }
    },
    {
      name: 'Cricket Academy Ground',
      description: 'Professional cricket ground with practice nets',
      sportType: 'cricket',
      location: {
        address: 'Cricket Academy, Bandra East',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400051'
      },
      images: ['https://via.placeholder.com/400x300?text=Cricket+Ground'],
      amenities: ['Practice Nets', 'Pavilion', 'Parking', 'Refreshments'],
      surface: 'natural_grass',
      pricing: {
        hourlyRate: 2000,
        currency: 'INR'
      },
      operatingHours: {
        openTime: '07:00',
        closeTime: '21:00',
        daysOpen: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      },
      rating: {
        average: 4.8,
        count: 18
      }
    }
  ]
};

async function setupDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully!');

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Turf.deleteMany({});
    await Booking.deleteMany({});
    await Event.deleteMany({});

    // Create users
    console.log('Creating users...');
    const createdUsers = [];
    for (const userData of sampleData.users) {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      const user = await User.create({
        ...userData,
        password: hashedPassword,
        isVerified: true,
        isActive: true
      });
      createdUsers.push(user);
      console.log(`Created user: ${user.name} (${user.email})`);
    }

    // Create turfs
    console.log('Creating turfs...');
    const owner = createdUsers.find(user => user.role === 'owner');
    for (const turfData of sampleData.turfs) {
      const turf = await Turf.create({
        ...turfData,
        owner: owner._id,
        isVerified: true,
        isActive: true
      });
      console.log(`Created turf: ${turf.name}`);
    }

    // Create indexes
    console.log('Creating indexes...');
    await User.collection.createIndex({ email: 1 });
    await Turf.collection.createIndex({ 'location.city': 1 });
    await Turf.collection.createIndex({ sportType: 1 });
    await Turf.collection.createIndex({ owner: 1 });
    await Booking.collection.createIndex({ user: 1 });
    await Booking.collection.createIndex({ turf: 1 });
    await Booking.collection.createIndex({ date: 1 });
    await Event.collection.createIndex({ status: 1 });
    await Event.collection.createIndex({ sportType: 1 });

    console.log('Database setup completed successfully!');
    console.log('\nSample data created:');
    console.log(`- ${createdUsers.length} users`);
    console.log(`- ${sampleData.turfs.length} turfs`);
    console.log('\nYou can now start your application!');

  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the setup
setupDatabase(); 