"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const authRoutes = (0, express_1.Router)();
const authController = new auth_controller_1.AuthController();
authRoutes.post("/register", authController.register.bind(authController));
authRoutes.post("/login", authController.login.bind(authController));
authRoutes.post("/logout", auth_middleware_1.authMiddleware, authController.logout.bind(authController));
authRoutes.post("/refresh-token", authController.refreshToken.bind(authController));
// authRoutes.get(
//   "/verify-email",
//   authController.verifyEmail.bind(authController)
// );
exports.default = authRoutes;
