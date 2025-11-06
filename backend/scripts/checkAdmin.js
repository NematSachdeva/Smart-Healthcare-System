require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * Script to check admin user and verify password
 * Usage: node scripts/checkAdmin.js
 */

// Simple User schema for this script
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  createdAt: Date,
  updatedAt: Date
});

const User = mongoose.model('User', userSchema);

const checkAdmin = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find admin user
    const admin = await User.findOne({ email: 'admin@healthcare.com' });

    if (!admin) {
      console.log('❌ Admin user not found with email: admin@healthcare.com\n');
      console.log('Run this command to create admin:');
      console.log('node scripts/createAdmin.js\n');
      process.exit(1);
    }

    console.log('✅ Admin user found!\n');
    console.log('═══════════════════════════════════════');
    console.log('📧 Email:', admin.email);
    console.log('👤 Name:', admin.name);
    console.log('🎭 Role:', admin.role);
    console.log('📅 Created:', admin.createdAt);
    console.log('═══════════════════════════════════════\n');

    // Test password
    const testPassword = 'admin123';
    console.log('🔐 Testing password:', testPassword);
    
    const isMatch = await bcrypt.compare(testPassword, admin.password);
    
    if (isMatch) {
      console.log('✅ Password is correct!\n');
      console.log('You can login with:');
      console.log('Email: admin@healthcare.com');
      console.log('Password: admin123\n');
    } else {
      console.log('❌ Password does NOT match!\n');
      console.log('The stored password hash does not match "admin123"');
      console.log('\nWould you like to reset the password? (Y/n)');
      console.log('Run: node scripts/resetAdminPassword.js\n');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

// Run the script
checkAdmin();
