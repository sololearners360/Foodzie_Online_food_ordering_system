import mongoose from "mongoose";

export const connectDB = async () => {
  const mongoUrl = process.env.MONGO_URL || process.env.MONGODB_URI;

  if (!mongoUrl) {
    throw new Error("MONGO_URL (or MONGODB_URI) is required to connect to MongoDB");
  }

  await mongoose.connect(mongoUrl).then(() => {
    console.log("DB connected");
  });
};
