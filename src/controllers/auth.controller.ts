import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const authService = new AuthService(prisma);

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { username, email, password } = req.body;

      const result = await authService.register({
        username,
        email,
        password,
      });

      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({
        error: error.message || "Failed to register",
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const result = await authService.login({
        email,
        password,
      });

      res.status(200).json(result);
    } catch (error: any) {
      res.status(401).json({
        error: error.message || "Invalid credentials",
      });
    }
  }
}
