import mongoose from "mongoose";

const userLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
      index: true,
    },
    username: {
      type: String,
      default: "anonymous",
      trim: true,
      index: true,
    },
    action: {
      type: String,
      required: [true, "Log action is required"],
      index: true,
    },
    status: {
      type: String,
      enum: ["SUCCESS", "FAILED", "WARNING", "INFO"],
      default: "INFO",
      index: true,
    },
    ip: {
      type: String,
      default: "",
    },
    userAgent: {
      type: String,
      default: "",
    },
    endpoint: {
      type: String,
      default: "",
    },
    method: {
      type: String,
      default: "",
    },
    statusCode: {
      type: Number,
      default: null,
    },
    durationMs: {
      type: Number,
      default: null,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

userLogSchema.index({ createdAt: -1 });

// Stored in the "user_logs" collection in MongoDB (viewable in MongoDB Compass)
export default mongoose.model("UserLog", userLogSchema, "user_logs");
