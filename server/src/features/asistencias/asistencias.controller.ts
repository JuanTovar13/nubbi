import { Response } from "express";
import Boom from "@hapi/boom";
import { AuthRequest } from "../../middlewares/authMiddleware";
import {
  getBalanceService,
  getHistorialService,
  scanQRService,
} from "./asistencias.service";

const getErrorMessage = (error: unknown, defaultMessage: string) => {
  if (error instanceof Error) return error.message;
  return defaultMessage;
};

const getStatusCode = (error: unknown, defaultStatus: number) => {
  if (Boom.isBoom(error)) {
    return error.output.statusCode;
  }
  return defaultStatus;
};

export class AsistenciasController {

  static async scan(req: AuthRequest, res: Response) {
    try {
      const result = await scanQRService(req.body, req.user!.id);
      res.status(201).json(result);
    } catch (error) {
      res
        .status(getStatusCode(error, 400))
        .json({ error: getErrorMessage(error, "Error al registrar asistencia") });
    }
  }

  static async balance(req: AuthRequest, res: Response) {
    try {
      const total = await getBalanceService(req.user!.id);
      res.status(200).json({ total });
    } catch (error) {
      res
        .status(getStatusCode(error, 400))
        .json({ error: getErrorMessage(error, "Error al obtener balance") });
    }
  }

  static async historial(req: AuthRequest, res: Response) {
    try {
      const asistencias = await getHistorialService(req.user!.id);
      res.status(200).json(asistencias);
    } catch (error) {
      res
        .status(getStatusCode(error, 400))
        .json({ error: getErrorMessage(error, "Error al obtener historial") });
    }
  }
}
