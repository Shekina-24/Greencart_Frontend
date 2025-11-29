import mongoose, { Schema, Document, Model } from "mongoose";

// 1️⃣ Définition de l’interface TypeScript pour un User
export interface IUser extends Document {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  region?: string;
  role: "consumer" | "producer";
  consentNewsletter?: boolean;
  consentAnalytics?: boolean;
}

// 2️⃣ Définition du schéma Mongoose
const UserSchema: Schema<IUser> = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String },
    lastName: { type: String },
    region: { type: String },
    role: {
      type: String,
      enum: ["consumer", "producer"],
      default: "consumer",
    },
    consentNewsletter: { type: Boolean },
    consentAnalytics: { type: Boolean },
  },
  {
    timestamps: true, // createdAt / updatedAt
  }
);

// 3️⃣ Gestion du cache modèle (évite erreur "Cannot overwrite model")
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
