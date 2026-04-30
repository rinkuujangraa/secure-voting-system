import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// Fallback connection function with better error handling
async function connectDB(): Promise<typeof mongoose> {
  if (cached!.conn) {
    return cached!.conn;
  }

  if (!cached!.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      heartbeatFrequencyMS: 10000, // Send a ping every 10 seconds
    };

    cached!.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ MongoDB connected successfully');
      return mongoose;
    }).catch((error) => {
      console.error('❌ MongoDB connection failed:', error.message);
      
      // If it's a local connection error, provide helpful message
      if (error.message.includes('ECONNREFUSED')) {
        console.log('💡 MongoDB is not running locally. Please:');
        console.log('   1. Install MongoDB: https://www.mongodb.com/try/download/community');
        console.log('   2. Start MongoDB service, or');
        console.log('   3. Use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas');
        console.log('   4. Run with Docker: docker run --name voting-mongodb -d -p 27017:27017 mongo:latest');
      }
      
      // Reset promise so next attempt can try again
      cached!.promise = null;
      throw error;
    });
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (e) {
    cached!.promise = null;
    throw e;
  }

  return cached!.conn;
}

// Export both the connection function and a health check
export default connectDB;

export async function checkDBHealth(): Promise<{ connected: boolean; error?: string }> {
  try {
    await connectDB();
    return { connected: true };
  } catch (error: any) {
    return { 
      connected: false, 
      error: error.message 
    };
  }
}