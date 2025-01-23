import mongoose from 'mongoose';

// Retrieve the MongoDB URI from environment variables
const MONGODB_URI = process.env.MONGODB_URI;

// Ensure the MongoDB URI is defined
if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

// Use a global variable to store the connection promise
let cached = global.mongoose;

// Initialize the cached object if it doesn't exist
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// Function to connect to the MongoDB database
async function connectDB() {
  // Return the existing connection if it's already established
  if (cached.conn) {
    return cached.conn;
  }

  // If no connection promise exists, create a new one
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI);
  }
  
  // Await the connection promise and store the connection
  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectDB;