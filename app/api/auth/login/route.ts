import { NextRequest } from "next/server";
import { connectDB } from "../../mongodb";
import User from "../../../../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "tonsecretultrasecurise";

export async function POST(req: NextRequest): Promise<Response> {
  try {
    await connectDB();

    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: "Email et mot de passe requis" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const user = await User.findOne({ email });
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Utilisateur introuvable" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return new Response(
        JSON.stringify({ error: "Mot de passe incorrect" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    return new Response(JSON.stringify({ token }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    console.error("LOGIN ERROR:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return new Response(
      JSON.stringify({
        error: "Erreur serveur",
        details: message, // <--- très important pour comprendre
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
