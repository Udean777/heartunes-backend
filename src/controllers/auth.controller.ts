import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { PrismaClient } from "@prisma/client";
import { TokenService } from "../services/token.service";
import { EmailService } from "../services/email.service";

const prisma = new PrismaClient();
const tokenService = new TokenService();
const emailService = new EmailService();
const authService = new AuthService(prisma, emailService, tokenService);

interface AuthenticatedRequest extends Request {
  userId: string;
}

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        res.status(400).json({
          error: "Username, email and password are required",
        });
        return;
      }

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

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({
          error: "Email and password are required",
        });
      }

      const result = await authService.login({
        email,
        password,
      });

      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({
        accessToken: result.accessToken,
        user: result.user,
      });
    } catch (error: any) {
      res.status(401).json({
        error: error.message || "Invalid credentials",
      });
    }
  }

  async logout(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId as string;
      await authService.logout(userId);

      res.clearCookie("refreshToken");

      res.json({ message: "Logged out successfully" });
    } catch (error: any) {
      res.status(500).json({
        error: error.message || "Failed to logout",
      });
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        res.status(401).json({
          error: "Refresh token not found",
        });
        return;
      }

      const result = await authService.refreshToken(refreshToken);

      // Update refresh token cookie
      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({
        accessToken: result.accessToken,
        user: result.user,
      });
    } catch (error: any) {
      res.status(401).json({
        error: error.message || "Invalid refresh token",
      });
    }
  }

  public async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.query;

      if (!token || typeof token !== "string") {
        res.status(400).json({
          error: "Verification token is required",
        });
        return;
      }

      await authService.verifyEmail(token);

      res.json({
        message: "Email verified successfully",
      });
    } catch (error: any) {
      if (error.name === "TokenExpiredError") {
        res.status(401).json({
          error: "Verification token has expired",
        });
      }

      res.status(400).json({
        error: error.message || "Failed to verify email",
      });
    }
  }
}
