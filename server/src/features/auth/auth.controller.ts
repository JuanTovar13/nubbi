import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { LoginDTO, RegisterDTO } from "./auth.types";
import { AuthRequest } from "../../middlewares/authMiddleware";

const getErrorMessage = (error: unknown, defaultMessage: string) => {
  if (error instanceof Error) {
    return error.message;
  }

  return defaultMessage;
};

export class AuthController {

  static async register(req: Request<unknown, unknown, RegisterDTO>, res: Response) {
    try {
      const result = await AuthService.register(req.body);
      res.status(201).json(result);
    } catch (error: unknown) {
      res.status(400).json({ error: getErrorMessage(error, "Registro fallido") });
    }
  }

  static async login(req: Request<unknown, unknown, LoginDTO>, res: Response) {
    try {
      const result = await AuthService.login(req.body);
      res.status(200).json(result);
    } catch (error: unknown) {
      res.status(401).json({ error: getErrorMessage(error, "Login fallido") });
    }
  }

  static async me(req: AuthRequest, res: Response) {
    try {
      const user = req.user; // viene del middleware

      if (!user?.id) {
        throw new Error("Usuario no autenticado");
      }

      const profile = await AuthService.getProfile(user.id);
      res.status(200).json(profile);
    } catch (error: unknown) {
      res.status(401).json({ error: getErrorMessage(error, "No se pudo obtener el perfil") });
    }
  }
}