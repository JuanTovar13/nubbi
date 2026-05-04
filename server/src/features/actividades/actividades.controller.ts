import { Response } from "express";
import Boom from "@hapi/boom";
import { AuthRequest } from "../../middlewares/authMiddleware";
import {
  createActividadService,
  deleteActividadService,
  getActividadByIdService,
  listActividadesService,
  updateActividadService,
} from "./actividades.service";

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

export class ActividadesController {

  static async create(req: AuthRequest, res: Response) {
    try {
      const actividad = await createActividadService(req.body, req.user!.id);
      res.status(201).json(actividad);
    } catch (error) {
      res
        .status(getStatusCode(error, 400))
        .json({ error: getErrorMessage(error, "Error al crear actividad") });
    }
  }

  static async list(req: AuthRequest, res: Response) {
    try {
      const soloActivas = req.query.activas === "true";
      const actividades = await listActividadesService(soloActivas);
      res.status(200).json(actividades);
    } catch (error) {
      res
        .status(getStatusCode(error, 400))
        .json({ error: getErrorMessage(error, "Error al listar actividades") });
    }
  }

  static async getById(req: AuthRequest, res: Response) {
    try {
      const actividad = await getActividadByIdService(req.params["id"] as string);
      res.status(200).json(actividad);
    } catch (error) {
      res
        .status(getStatusCode(error, 404))
        .json({ error: getErrorMessage(error, "Actividad no encontrada") });
    }
  }

  static async update(req: AuthRequest, res: Response) {
    try {
      const actividad = await updateActividadService(
        req.params["id"] as string,
        req.body,
        req.user!.id
      );
      res.status(200).json(actividad);
    } catch (error) {
      res
        .status(getStatusCode(error, 400))
        .json({ error: getErrorMessage(error, "Error al actualizar actividad") });
    }
  }

  static async delete(req: AuthRequest, res: Response) {
    try {
      await deleteActividadService(req.params["id"] as string, req.user!.id);
      res.status(204).send();
    } catch (error) {
      res
        .status(getStatusCode(error, 400))
        .json({ error: getErrorMessage(error, "Error al eliminar actividad") });
    }
  }
}
