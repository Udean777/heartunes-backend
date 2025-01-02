// Explicitly define the error handler type
export const errorHandler = (err, req, res, next) => {
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
//# sourceMappingURL=error.middleware.js.map