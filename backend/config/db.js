import mongoose from "mongoose";
import { syncFallbackToDb } from "../utils/syncFallback.js";

let isConnected = false;

export const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.warn("ℹ️  No MONGO_URI provided in .env. Running in resilient persistent storage mode.");
    return false;
  }

  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 1500,
    });
    isConnected = true;
    console.log(`✅ MongoDB connected successfully to ${mongoose.connection.host}/${mongoose.connection.name}`);
    // Sync any pre-existing local users/notes into MongoDB Atlas
    await syncFallbackToDb();
    return true;
  } catch (err) {
    isConnected = false;
    await mongoose.disconnect().catch(() => {});
    console.warn(`⚠️  MongoDB connection note: ${err.message}`);
    console.warn("ℹ️  Backend operating in persistent storage mode (data/notes.json). All notes persist!");
    return false;
  }
};

export const getDbStatus = () => ({
  connected: isConnected,
  host: isConnected ? mongoose.connection.host : null,
  name: isConnected ? mongoose.connection.name : null,
});
