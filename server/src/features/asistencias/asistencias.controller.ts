import { Response } from "express";
import { AuthRequest } from "../../middlewares/authMiddleware";
import { AsistenciasService } from "./asistencias.service";

const getErrorMessage = (error: unknown, defaultMessage: string) => {
  if (error instanceof Error) return error.message;
  return defaultMessage;
};

const CLIENT_ERROR_PATTERNS = ["inválido", "no encontrada", "activa", "Ya registraste"];

export class AsistenciasController {

  static async scan(req: AuthRequest, res: Response) {
    try {
      const result = await AsistenciasService.scanQR(req.body, req.user!.id);
      res.status(201).json(result);
    } catch (error) {
      const msg = getErrorMessage(error, "Error al registrar asistencia");
      const isClientError = CLIENT_ERROR_PATTERNS.some((p) => msg.includes(p));
      res.status(isClientError ? 400 : 500).json({ error: msg });
    }
  }

  static async balance(req: AuthRequest, res: Response) {
    try {
      const total = await AsistenciasService.getBalance(req.user!.id);
      res.status(200).json({ total });
    } catch (error) {
      res.status(400).json({ error: getErrorMessage(error, "Error al obtener balance") });
    }
  }

  static async historial(req: AuthRequest, res: Response) {
    try {
      const asistencias = await AsistenciasService.getHistorial(req.user!.id);
      res.status(200).json(asistencias);
    } catch (error) {
      res.status(400).json({ error: getErrorMessage(error, "Error al obtener historial") });
    }
  }
}
