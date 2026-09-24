import "dotenv/config";
import mongoose from "mongoose";
import { app } from "./app";
import { connectDB } from "./config/db";

const start = async () => {
  try {
    const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/taskflow";
    await connectDB(uri);
    const port = Number(process.env.PORT) || 5000;
    app.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`TaskFlow API running on http://localhost:${port}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err.message);
});

void start();