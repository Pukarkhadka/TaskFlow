import mongoose from "mongoose";

export const connectDB = async (uri: string): Promise<void> => {
  const conn = await mongoose.connect(uri);
  // eslint-disable-next-line no-console
  console.log(`MongoDB connected: ${conn.connection.host}`);
};