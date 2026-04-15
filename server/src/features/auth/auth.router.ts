import { Router } from "express";
import { AuthController } from "./auth.controller";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { roleMiddleware } from "../../middlewares/roleMiddleware";

export const router = Router();

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.get("/me", authMiddleware, AuthController.me);

router.post(
  "/admin-only",
  authMiddleware,
  roleMiddleware(["gestor"]),
  (req, res) => {
    res.json({ message: "Solo gestores" });
  }
);

export default router;