import mongoose from "mongoose";

const MONGODB_URI = "mongodb+srv://Shekina:JetaimE!@cluster0.fblyg6h.mongodb.net/?appName=Cluster0"

if (!MONGODB_URI) throw new Error("MONGODB_URI is not defined.");

let cached = global.mongoose;

if (!cached) cached = global.mongoose = { conn: null, promise: null };

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((m) => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
