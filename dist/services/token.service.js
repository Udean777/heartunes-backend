"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class TokenService {
    generateAccessToken(userId) {
        return jsonwebtoken_1.default.sign({ userId, type: "access" }, process.env.JWT_ACCESS_SECRET, { expiresIn: "15m" });
    }
    generateRefreshToken(userId) {
        return jsonwebtoken_1.default.sign({ userId, type: "refresh" }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
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
    verifyToken(token, type) {
        const secret = this.getSecretForType(type);
        return jsonwebtoken_1.default.verify(token, secret);
    }
    getSecretForType(type) {
        switch (type) {
            case "access":
                return process.env.JWT_ACCESS_SECRET;
            case "refresh":
                return process.env.JWT_REFRESH_SECRET;
            case "verification":
                return process.env.JWT_VERIFICATION_SECRET;
            case "reset":
                return process.env.JWT_RESET_SECRET;
            default:
                throw new Error("Invalid token type");
        }
    }
}
exports.TokenService = TokenService;
