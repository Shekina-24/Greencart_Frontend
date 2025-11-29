import { NextRequest } from "next/server";
import { connectDB } from "../../mongodb";
import User from "../../../../models/User";
import bcrypt from "bcryptjs";

interface RegisterBody {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  region?: string;
  role?: string;
  consentNewsletter?: boolean;
  consentAnalytics?: boolean;
}

export async function POST(req: NextRequest): Promise<Response> {
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
      consentAnalytics,
    }: RegisterBody = await req.json();

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: "Email et mot de passe requis" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return new Response(
        JSON.stringify({ error: "Cet utilisateur existe déjà" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
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

    const userSafe = {
      _id: newUser._id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      region: newUser.region,
      role: newUser.role,
      consentNewsletter: newUser.consentNewsletter,
      consentAnalytics: newUser.consentAnalytics,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    };

    return new Response(JSON.stringify({ user: userSafe }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    console.error("REGISTER ERROR:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return new Response(
      JSON.stringify({
        error: "Erreur serveur",
        details: message, // <--- pareil ici
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
