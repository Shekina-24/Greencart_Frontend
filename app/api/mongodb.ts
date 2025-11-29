import mongoose, { Mongoose } from "mongoose";

const 
MONGODB_URI="mongodb+srv://Shekina:JetaimE%21@cluster0.fblyg6h.mongodb.net/Greencart?retryWrites=true&w=majority&appName=Cluster0"

if (!MONGODB_URI) {
  throw new Error("❌ MONGODB_URI manquant dans .env.local");
}

declare global {
  // évite erreur TS lors du hot reload Next.js
  // eslint-disable-next-line no-var
  var mongoose: {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
  } | undefined;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB(): Promise<Mongoose> {
  if (cached!.conn) return cached!.conn;

  if (!cached!.promise) {
    console.log("📡 Connexion à MongoDB…");
    cached!.promise = mongoose
      .connect(MONGODB_URI)
      .then((mongoose) => {
        console.log("✅ Connecté à MongoDB");
        return mongoose;
      })
      .catch((err) => {
        console.error("❌ Erreur connexion MongoDB:", err);
        throw err;
      });
  }

  cached!.conn = await cached!.promise;
  return cached!.conn!;
}
