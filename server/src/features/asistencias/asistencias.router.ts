import { Router } from "express";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { roleMiddleware } from "../../middlewares/roleMiddleware";
import { AsistenciasController } from "./asistencias.controller";

export const router = Router();

router.post("/scan", authMiddleware, roleMiddleware(["familia"]), AsistenciasController.scan);
router.get("/balance", authMiddleware, roleMiddleware(["familia"]), AsistenciasController.balance);
router.get("/historial", authMiddleware, roleMiddleware(["familia"]), AsistenciasController.historial);

export default router;
