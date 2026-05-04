import { Response } from "express";
import { AuthRequest } from "../../middlewares/authMiddleware";
import { ActividadesService } from "./actividades.service";

const getErrorMessage = (error: unknown, defaultMessage: string) => {
  if (error instanceof Error) return error.message;
  return defaultMessage;
};

export class ActividadesController {

  static async create(req: AuthRequest, res: Response) {
    try {
      const actividad = await ActividadesService.create(req.body, req.user!.id);
      res.status(201).json(actividad);
    } catch (error) {
      res.status(400).json({ error: getErrorMessage(error, "Error al crear actividad") });
    }
  }

  static async list(req: AuthRequest, res: Response) {
    try {
      const soloActivas = req.query.activas === "true";
      const actividades = await ActividadesService.list(soloActivas);
      res.status(200).json(actividades);
    } catch (error) {
      res.status(400).json({ error: getErrorMessage(error, "Error al listar actividades") });
    }
  }

  static async getById(req: AuthRequest, res: Response) {
    try {
      const actividad = await ActividadesService.getById(req.params["id"] as string);
      res.status(200).json(actividad);
    } catch (error) {
      res.status(404).json({ error: getErrorMessage(error, "Actividad no encontrada") });
    }
  }

  static async update(req: AuthRequest, res: Response) {
    try {
      const actividad = await ActividadesService.update(req.params["id"] as string, req.body, req.user!.id);
      res.status(200).json(actividad);
    } catch (error) {
      res.status(400).json({ error: getErrorMessage(error, "Error al actualizar actividad") });
    }
  }

  static async delete(req: AuthRequest, res: Response) {
    try {
      await ActividadesService.delete(req.params["id"] as string, req.user!.id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: getErrorMessage(error, "Error al eliminar actividad") });
    }
  }
}
