const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const { getDbMode } = require('./config/db');
const { LocalUserModel } = require('./data/localStore');

dotenv.config();

const sampleUsers = [
  {
    name: 'Sarah Connor',
    email: 'admin@userhub.com',
    password: 'Admin@123456',
    role: 'admin',
    status: 'active',
    department: 'Executive',
    phone: '+1 (555) 019-2834',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  },
  {
    name: 'Marcus Vance',
    email: 'manager@userhub.com',
    password: 'Manager@123456',
    role: 'manager',
    status: 'active',
    department: 'Engineering',
    phone: '+1 (555) 304-9812',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  },
  {
    name: 'Elena Rostova',
    email: 'elena.rostova@userhub.com',
    password: 'User@123456',
    role: 'user',
    status: 'active',
    department: 'Product Design',
    phone: '+1 (555) 492-1049',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  },
  {
    name: 'David Chen',
    email: 'david.chen@userhub.com',
    password: 'User@123456',
    role: 'user',
    status: 'active',
    department: 'Engineering',
    phone: '+1 (555) 837-2910',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
  },
  {
    name: 'Amara Okafor',
    email: 'amara.okafor@userhub.com',
    password: 'User@123456',
    role: 'user',
    status: 'active',
    department: 'Marketing',
    phone: '+1 (555) 918-2736',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
  },
  {
    name: 'Liam Gallagher',
    email: 'liam.g@userhub.com',
    password: 'User@123456',
    role: 'user',
    status: 'pending',
    department: 'Customer Support',
    phone: '+1 (555) 674-8291',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
  },
  {
    name: 'Sophia Martinez',
    email: 'sophia.m@userhub.com',
    password: 'User@123456',
    role: 'user',
    status: 'inactive',
    department: 'Human Resources',
    phone: '+1 (555) 438-9201',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
  },
  {
    name: 'Kenji Takahashi',
    email: 'kenji.t@userhub.com',
    password: 'User@123456',
    role: 'user',
    status: 'suspended',
    department: 'Finance',
    phone: '+1 (555) 238-5920',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
  },
];

const seedData = async () => {
  const mongoUri = process.env.MONGODB_URI;
  const isPlaceholder = !mongoUri || mongoUri.includes('<username>') || mongoUri.includes('cluster0.example.mongodb.net');

  if (isPlaceholder) {
    console.log('⚡ Seeding Local Storage Store (backend/data/users.json)...');
    const count = LocalUserModel.resetDefaults();
    console.log(`✅ Seeded ${count} users into local storage successfully!`);
    printCredentials();
    process.exit(0);
  }

  try {
    console.log(`Connecting to MongoDB Atlas at: ${mongoUri}...`);
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 6000 });
    console.log('Connected to MongoDB Atlas.');

    await User.deleteMany({});
    console.log('Cleared existing users table in MongoDB Atlas.');

    for (const u of sampleUsers) {
      await User.create(u);
    }

    console.log(`✅ MongoDB Atlas seeded successfully with ${sampleUsers.length} users!`);
    printCredentials();
    process.exit(0);
  } catch (error) {
    console.error(`❌ MongoDB Atlas connection failed: ${error.message}`);
    console.log('⚡ Falling back to seeding Local Storage (backend/data/users.json)...');
    LocalUserModel.resetDefaults();
    console.log(`✅ Seeded ${sampleUsers.length} users into local storage!`);
    printCredentials();
    process.exit(0);
  }
};

function printCredentials() {
  console.log(`\n======================================================`);
  console.log(`🎉 UserHub Sample Accounts Ready for Testing!`);
  console.log(`======================================================`);
  console.log(`Default Admin Login:`);
  console.log(`  Email:    admin@userhub.com`);
  console.log(`  Password: Admin@123456`);
  console.log(`------------------------------------------------------`);
  console.log(`Default Manager Login:`);
  console.log(`  Email:    manager@userhub.com`);
  console.log(`  Password: Manager@123456`);
  console.log(`------------------------------------------------------`);
  console.log(`Default User Login:`);
  console.log(`  Email:    david.chen@userhub.com`);
  console.log(`  Password: User@123456`);
  console.log(`======================================================\n`);
}

seedData();
