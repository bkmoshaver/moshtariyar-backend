const mongoose = require('mongoose');

const connectDB = async () => {
  // Check for common MongoDB URI variable names
  const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.DATABASE_URL;

  if (!mongoURI) {
    console.log('MongoDB URI not found in environment variables!');
    console.log('Please set MONGO_URI, MONGODB_URI, or DATABASE_URL in your Railway project settings.');
    // Do not exit process, let the server run so logs can be seen
    return;
  }

  try {
    mongoose.set('strictQuery', false); // Fix deprecation warning
    const conn = await mongoose.connect(mongoURI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.log(`Error connecting to MongoDB: ${err.message}`);
    // Do not exit process
  }
};

module.exports = connectDB;
