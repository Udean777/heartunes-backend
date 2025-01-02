"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
// Explicitly define the error handler type
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    if (err.name === "JsonWebTokenError") {
        return res.status(401).json({ error: "Invalid token" });
    }
    if (err.name === "TokenExpiredError") {
        return res.status(401).json({ error: "Token expired" });
    }
    res.status(500).json({
        error: process.env.NODE_ENV === "production"
            ? "Internal server error"
            : err.message,
    });
};
exports.errorHandler = errorHandler;
