import mongoose from 'mongoose';

const connectDatabase = async (): Promise<void> => {
  try {
    mongoose.set('bufferCommands', false);
    const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/daystar_forms';
    
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000,
      bufferCommands: false,
    });

    console.log('MongoDB connected successfully');

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    mongoose.connection.on('error', (error) => {
      console.warn('MongoDB connection error:', error);
    });

  } catch (error) {
    console.warn('[AI Studio] Database offline — continuing in mock/fallback mode');
  }
};

export default connectDatabase;