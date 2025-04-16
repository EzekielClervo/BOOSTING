// utils/database.js
const mongoose = require('mongoose');

async function connectDB() {
  try {
    // Replace the following URI with your MongoDB connection string
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/facebook_automation';
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
}

module.exports = { connectDB };
