import { connectDB } from "../../mongodb";
import User from "../../../../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// UNE SEULE source de vérité pour le secret :
const JWT_SECRET = process.env.JWT_SECRET || "tonsecretultrasecurise";

export async function POST(req) {
  await connectDB();

  const { email, password } = await req.json();

  const user = await User.findOne({ email });
  if (!user) {
    return new Response(JSON.stringify({ error: "Utilisateur introuvable" }), {
      status: 400,
    });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return new Response(JSON.stringify({ error: "Mot de passe incorrect" }), {
      status: 400,
    });
  }

  // ICI on utilise bien JWT_SECRET (pas process.env.JWT_SECRET direct)
  const token = jwt.sign({ id: user._id }, JWT_SECRET, {
    expiresIn: "7d",
  });

  return new Response(JSON.stringify({ token }), { status: 200 });
}
