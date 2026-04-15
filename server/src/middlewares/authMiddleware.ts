import { Request, Response, NextFunction } from "express";
import { supabase } from "../config/supabase";
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: "familia" | "gestor";
  };
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "No autorizado" });
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({ error: "Token inválido" });
    }

    req.user = {
      id: data.user.id,
      email: data.user.email,
    };

    next();
  } catch (err) {
    res.status(401).json({ error: "Error de autenticación" });
  }
};