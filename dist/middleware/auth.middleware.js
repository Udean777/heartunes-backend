import { TokenService } from "../services/token.service";
const tokenService = new TokenService();
export const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!(authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith("Bearer "))) {
            res.status(401).json({ error: "Authorization header required" });
            return;
        }
        const token = authHeader.split(" ")[1];
        const payload = tokenService.verifyToken(token, "access");
        req.userId = payload.userId;
        next();
    }
    catch (error) {
        if (error.name === "TokenExpiredError") {
            res.status(401).json({ error: "Token expired" });
            return;
        }
        res.status(401).json({ error: "Invalid token" });
    }
};
//# sourceMappingURL=auth.middleware.js.map