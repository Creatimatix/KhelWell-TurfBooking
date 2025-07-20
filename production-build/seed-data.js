const { sequelize } = require('./config/database');
const User = require('./models/User');
const Turf = require('./models/Turf');
const Event = require('./models/Event');
const bcrypt = require('bcryptjs');

// Sample data
const sampleData = {
  users: [
    {
      name: 'Admin User',
      email: 'admin@khelwell.com',
      password: 'admin123',
      phone: '+919876543210',
      role: 'admin',
      address_street: '123 Admin Street',
      address_city: 'Mumbai',
      address_state: 'Maharashtra',
      address_zip_code: '400001',
      is_verified: true,
      is_active: true
    },
    {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      phone: '+919876543211',
      role: 'user',
      address_street: '456 User Street',
      address_city: 'Mumbai',
      address_state: 'Maharashtra',
      address_zip_code: '400002',
      is_verified: true,
      is_active: true
    },
    {
      name: 'Turf Owner',
      email: 'owner@example.com',
      password: 'owner123',
      phone: '+919876543212',
      role: 'owner',
      address_street: '789 Owner Street',
      address_city: 'Mumbai',
      address_state: 'Maharashtra',
      address_zip_code: '400003',
      is_verified: true,
      is_active: true
    }
  ],
  turfs: [
    {
      name: 'Premium Football Ground',
      description: 'High-quality artificial grass football ground with floodlights',
      sport_type: 'football',
      location_address: 'Sports Complex, Andheri West',
      location_city: 'Mumbai',
      location_state: 'Maharashtra',
      location_zip_code: '400058',
      images: [
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop'
      ],
      amenities: ['Floodlights', 'Parking', 'Changing Rooms', 'Water Dispenser'],
      surface: 'artificial_grass',
      pricing_hourly_rate: 1500,
      pricing_currency: 'INR',
      operating_hours_open: '06:00',
      operating_hours_close: '22:00',
      operating_hours_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      rating_average: 4.5,
      rating_count: 25,
      is_verified: true,
      is_active: true
    },
    {
      name: 'Cricket Academy Ground',
      description: 'Professional cricket ground with practice nets',
      sport_type: 'cricket',
      location_address: 'Cricket Academy, Bandra East',
      location_city: 'Mumbai',
      location_state: 'Maharashtra',
      location_zip_code: '400051',
      images: [
        'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1544555163-46a013bb70d5?w=800&h=600&fit=crop'
      ],
      amenities: ['Practice Nets', 'Pavilion', 'Parking', 'Refreshments'],
      surface: 'natural_grass',
      pricing_hourly_rate: 2000,
      pricing_currency: 'INR',
      operating_hours_open: '07:00',
      operating_hours_close: '21:00',
      operating_hours_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      rating_average: 4.8,
      rating_count: 18,
      is_verified: true,
      is_active: true
    }
  ],
  events: [
    {
      title: 'Nalasopara Cricket League',
      description: 'The Nalasopara Cricket League is back!!\nThis time the reward price is Rs. 5,00,000/-. Participation is from all over India. Get ready to see cricket madness.',
      image: 'https://media.istockphoto.com/id/1470486041/photo/india-championship-concept-star-shaped-confetti-falling-onto-a-gold-trophy-cup-with-indian.jpg?s=1024x1024&w=is&k=20&c=_0ZB01XWCpSM1ge2yu-0iwS4aUxRYDN8aqbrgF3urAI=',
      start_date: '2025-07-31',
      end_date: '2025-08-05',
      start_time: '08:30:00',
      end_time: '21:00:00',
      location: 'Nalasopara',
      sport_type: 'cricket',
      type: 'league',
      entry_fee: 5000,
      max_participants: 10,
      current_participants: 0,
      status: 'upcoming',
      is_active: true
    }
  ]
};

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database with sample data...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Create users
    console.log('👥 Creating users...');
    const createdUsers = [];
    for (const userData of sampleData.users) {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      const user = await User.create({
        ...userData,
        password: hashedPassword
      });
      createdUsers.push(user);
      console.log(`✅ Created user: ${user.name} (${user.email})`);
    }
    
    // Create turfs
    console.log('🏟️ Creating turfs...');
    const owner = createdUsers.find(user => user.role === 'owner');
    for (const turfData of sampleData.turfs) {
      const turf = await Turf.create({
        ...turfData,
        owner_id: owner.id
      });
      console.log(`✅ Created turf: ${turf.name}`);
    }

    // Create events
    console.log('🎯 Creating events...');
    const admin = createdUsers.find(user => user.role === 'admin');
    for (const eventData of sampleData.events) {
      const event = await Event.create({
        ...eventData,
        created_by: admin.id
      });
      console.log(`✅ Created event: ${event.title}`);
    }
    
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Sample data created:');
    console.log(`- ${createdUsers.length} users`);
    console.log(`- ${sampleData.turfs.length} turfs`);
    console.log(`- ${sampleData.events.length} events`);
    console.log('\n🔑 Sample login credentials:');
    console.log('- Admin: admin@khelwell.com / admin123');
    console.log('- User: john@example.com / password123');
    console.log('- Owner: owner@example.com / owner123');
    console.log('\n📱 For OTP login, use phone numbers:');
    console.log('- +919876543210 (Admin)');
    console.log('- +919876543211 (User)');
    console.log('- +919876543212 (Owner)');
    console.log('\n🚀 You can now start your application!');

  } catch (error) {
    console.error('❌ Database seeding error:', error);
    console.log('\n💡 Make sure:');
    console.log('1. Database is set up (run: npm run setup-db)');
    console.log('2. Database credentials are correct in config.env');
    console.log('3. All tables exist');
  } finally {
    await sequelize.close();
    console.log('🔌 Database connection closed.');
  }
}

// Run the seeding
seedDatabase(); 