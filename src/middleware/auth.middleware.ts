import { Request, Response, NextFunction } from "express";
import { TokenService } from "../services/token.service";

declare global {
  namespace Express {
    interface Request {
      userId: string;
    }
  }
}

const tokenService = new TokenService();

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ error: "Authorization header required" });
      return;
    }

    const token = authHeader.split(" ")[1];
    const payload = tokenService.verifyToken(token, "access");
    req.userId = payload.userId;
    next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      res.status(401).json({ error: "Token expired" });
      return;
    }
    res.status(401).json({ error: "Invalid token" });
  }
};
