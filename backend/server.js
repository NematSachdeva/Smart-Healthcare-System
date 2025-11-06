require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const { errorHandler } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patients');
const doctorRoutes = require('./routes/doctors');
const appointmentRoutes = require('./routes/appointments');
const prescriptionRoutes = require('./routes/prescriptions');
const adminRoutes = require('./routes/admin');

/**
 * Validate required environment variables
 * Throws error if any required variable is missing
 */
const validateEnvVariables = () => {
  const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
  
  console.log('✓ All required environment variables are present');
};

/**
 * Initialize and start the Express server
 * Connects to database before starting the server
 */

const startServer = async () => {
  try {
    // Validate environment variables
    validateEnvVariables();
    
    // Connect to MongoDB before starting server
    await connectDB();

    // Initialize Express app
    const app = express();

    // Middleware
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Register routes
    app.use('/api/auth', authRoutes);
    app.use('/api/patients', patientRoutes);
    app.use('/api/doctors', doctorRoutes);
    app.use('/api/appointments', appointmentRoutes);
    app.use('/api/prescriptions', prescriptionRoutes);
    app.use('/api/admin', adminRoutes);

    // Root endpoint
    app.get('/', (req, res) => {
      res.status(200).json({ 
        message: 'Smart Healthcare API',
        version: '1.0.0',
        status: 'running',
        endpoints: {
          health: '/health',
          api: '/api',
          auth: '/api/auth',
          patients: '/api/patients',
          doctors: '/api/doctors',
          appointments: '/api/appointments',
          prescriptions: '/api/prescriptions',
          admin: '/api/admin'
        }
      });
    });

    // Health check endpoint
    app.get('/health', (req, res) => {
      res.status(200).json({ status: 'OK', message: 'Server is running' });
    });

    // Error handling middleware (must be last)
    app.use(errorHandler);

    const PORT = process.env.PORT || 5000;
    
    app.listen(PORT, () => {
      console.log('\n=================================');
      console.log('Server initialization complete');
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Server running on port: ${PORT}`);
      console.log('=================================\n');
    });
    
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

// Start the server
startServer();
