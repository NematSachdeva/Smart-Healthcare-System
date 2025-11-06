const mongoose = require('mongoose');

/**
 * Database connection configuration with retry logic
 * Connects to MongoDB Atlas using Mongoose
 */

const connectDB = async (retries = 5, delay = 5000) => {
  const mongoURI = process.env.MONGO_URI;

  // Validate MongoDB URI is provided
  if (!mongoURI) {
    console.error('ERROR: MONGO_URI environment variable is not defined');
    process.exit(1);
  }

  // Mongoose connection options
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  };

  let attempt = 0;

  while (attempt < retries) {
    try {
      attempt++;
      console.log(`Attempting to connect to MongoDB (Attempt ${attempt}/${retries})...`);

      // Connect to MongoDB
      await mongoose.connect(mongoURI, options);

      // Connection successful
      console.log('✓ MongoDB connected successfully');
      console.log(`✓ Database: ${mongoose.connection.name}`);
      console.log(`✓ Host: ${mongoose.connection.host}`);

      // Verify connection is ready
      if (mongoose.connection.readyState === 1) {
        console.log('✓ Database connection verified and ready');
      }

      return mongoose.connection;

    } catch (error) {
      console.error(`✗ MongoDB connection attempt ${attempt} failed:`, error.message);

      if (attempt < retries) {
        console.log(`Retrying in ${delay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error('✗ All connection attempts failed. Exiting...');
        process.exit(1);
      }
    }
  }
};

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from MongoDB');
});

// Handle application termination
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
  } catch (err) {
    console.error('Error closing MongoDB connection:', err);
    process.exit(1);
  }
});

module.exports = connectDB;
