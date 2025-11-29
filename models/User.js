import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
   password: { type: String, required: true },
   firstName: String,
    lastName: String,
    region: String,
    role: { type: String, enum: ["consumer", "producer"], default: "consumer" },
    consentNewsletter: Boolean,
    consentAnalytics: Boolean,
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
