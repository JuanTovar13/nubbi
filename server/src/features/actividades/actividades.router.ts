import { Router } from "express";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { roleMiddleware } from "../../middlewares/roleMiddleware";
import { ActividadesController } from "./actividades.controller";

export const router = Router();

router.post("/", authMiddleware, roleMiddleware(["gestor"]), ActividadesController.create);
router.patch("/:id", authMiddleware, roleMiddleware(["gestor"]), ActividadesController.update);
router.delete("/:id", authMiddleware, roleMiddleware(["gestor"]), ActividadesController.delete);

router.get("/", authMiddleware, ActividadesController.list);
router.get("/:id", authMiddleware, ActividadesController.getById);

export default router;
