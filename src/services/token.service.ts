import jwt from "jsonwebtoken";
import { TokenPayload } from "../types/auth";

export class TokenService {
  generateAccessToken(userId: string): string {
    return jwt.sign(
      { userId, type: "access" } as TokenPayload,
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: "15m" }
    );
  }

  generateRefreshToken(userId: string): string {
    return jwt.sign(
      { userId, type: "refresh" } as TokenPayload,
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: "7d" }
    );
  }

  // generateVerificationToken(userId: string): string {
  //   return jwt.sign(
  //     { userId, type: "verification" } as TokenPayload,
  //     process.env.JWT_VERIFICATION_SECRET!,
  //     { expiresIn: "24h" }
  //   );
  // }

  // generatePasswordResetToken(userId: string): string {
  //   return jwt.sign(
  //     { userId, type: "reset" } as TokenPayload,
  //     process.env.JWT_RESET_SECRET!,
  //     { expiresIn: "1h" }
  //   );
  // }

  verifyToken(token: string, type: TokenPayload["type"]): TokenPayload {
    const secret = this.getSecretForType(type);

    return jwt.verify(token, secret) as TokenPayload;
  }

  private getSecretForType(type: TokenPayload["type"]): string {
    switch (type) {
      case "access":
        return process.env.JWT_ACCESS_SECRET!;
      case "refresh":
        return process.env.JWT_REFRESH_SECRET!;
      case "verification":
        return process.env.JWT_VERIFICATION_SECRET!;
      case "reset":
        return process.env.JWT_RESET_SECRET!;
      default:
        throw new Error("Invalid token type");
    }
  }
}
