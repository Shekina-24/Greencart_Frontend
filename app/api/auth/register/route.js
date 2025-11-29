import { connectDB } from "../../mongodb";
import User from "../../../../models/User";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    await connectDB();

    const {
      email,
      password,
      firstName,
      lastName,
      region,
      role,
      consentNewsletter,
      consentAnalytics
    } = await req.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ error: "Email et mot de passe requis" }), {
        status: 400,
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return new Response(JSON.stringify({ error: "Cet utilisateur existe déjà" }), {
        status: 400,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      region,
      role,
      consentNewsletter,
      consentAnalytics,
    });
    console.log("New user registered backend:", newUser);

    return new Response(JSON.stringify({ user: newUser }), { status: 201 });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return new Response(JSON.stringify({ error: "Erreur serveur" }), {
      status: 500,
    });
  }
}
