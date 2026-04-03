import mongoose from "mongoose";

const connectDb = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    if (mongoose.connection.readyState >= 1) {
      return mongoose.connection;
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
};

export default connectDb;
