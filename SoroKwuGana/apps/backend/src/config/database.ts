import mongoose from 'mongoose';

const MONGODB_URI =
  process.env.MONGODB_URI ?? 'mongodb://localhost:27017/sorokwugana';

// Mongoose global settings
mongoose.set('strictQuery', true);

export async function connectDB(): Promise<void> {
  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      // Keep alive so the connection doesn't time out between requests
      serverSelectionTimeoutMS: 5000,  // fail fast if MongoDB is unreachable
      socketTimeoutMS: 45000,
    });

    console.log(`🍃 MongoDB connected: ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}`);
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err);
    process.exit(1);
  }
}

// Graceful disconnect — called on process exit
export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
  console.log('🔌 MongoDB disconnected');
}

// Re-export mongoose so the rest of the app imports from one place
export default mongoose;
