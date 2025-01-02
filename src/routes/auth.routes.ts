import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const authRoutes = Router();
const authController = new AuthController();

authRoutes.post("/register", authController.register.bind(authController));
authRoutes.post("/login", authController.login.bind(authController));
authRoutes.post(
  "/logout",
  authMiddleware,
  authController.logout.bind(authController)
);
authRoutes.post(
  "/refresh-token",
  authController.refreshToken.bind(authController)
);
authRoutes.get(
  "/verify-email",
  authController.verifyEmail.bind(authController)
);

export default authRoutes;
