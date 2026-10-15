import mongoose from "mongoose";
import { syncFallbackToDb } from "../utils/syncFallback.js";

let isConnected = false;

// Event listeners for Mongoose connection state
mongoose.connection.on("connected", () => {
  isConnected = true;
  console.log(`✅ MongoDB connected successfully to ${mongoose.connection.host}/${mongoose.connection.name}`);
});

mongoose.connection.on("error", (err) => {
  isConnected = false;
  console.error(`❌ MongoDB connection error: ${err.message}`);
});

mongoose.connection.on("disconnected", () => {
  isConnected = false;
  console.warn("⚠️  MongoDB connection disconnected.");
});

export const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.warn("ℹ️  No MONGO_URI provided in .env. Running in resilient persistent storage mode.");
    return false;
  }

  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000, // 15 seconds to connect to Atlas cluster
    });
    isConnected = true;
    console.log(`✅ MongoDB ready: connected to database '${mongoose.connection.name}' on host '${mongoose.connection.host}'`);
    // Sync any pre-existing local users/notes into MongoDB Atlas
    await syncFallbackToDb();
    return true;
  } catch (err) {
    isConnected = false;
    console.warn(`⚠️  MongoDB connection note: ${err.message}`);
    console.warn("ℹ️  Backend operating in persistent storage mode (data/notes.json). All notes persist!");
    return false;
  }
};

export const getDbStatus = () => {
  const ready = mongoose.connection.readyState === 1;
  return {
    connected: ready || isConnected,
    readyState: mongoose.connection.readyState,
    host: (ready || isConnected) ? mongoose.connection.host : null,
    name: (ready || isConnected) ? mongoose.connection.name : null,
  };
};
