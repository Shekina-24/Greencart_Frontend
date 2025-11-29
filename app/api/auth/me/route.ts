import { NextRequest } from "next/server";
import { connectDB } from "../../mongodb";
import User from "../../../../models/User";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "tonsecretultrasecurise";

export async function GET(req: NextRequest): Promise<Response> {
  try {
    await connectDB();

    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Token manquant" }),
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      console.error("JWT VERIFY ERROR:", error);
      return new Response(
        JSON.stringify({ error: "Token invalide ou expiré" }),
        { status: 401 }
      );
    }

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Utilisateur introuvable" }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({ user }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );

  } catch (err) {
    console.error("ME ROUTE ERROR:", err);
    return new Response(
      JSON.stringify({ error: "Erreur serveur" }),
      { status: 500 }
    );
  }
}
