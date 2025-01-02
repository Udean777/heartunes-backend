"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const client_1 = require("@prisma/client");
const token_service_1 = require("../services/token.service");
// import { EmailService } from "../services/email.service";
const prisma = new client_1.PrismaClient();
const tokenService = new token_service_1.TokenService();
// const emailService = new EmailService();
const authService = new auth_service_1.AuthService(prisma, tokenService);
class AuthController {
    register(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { username, email, password } = req.body;
                if (!username || !email || !password) {
                    res.status(400).json({
                        error: "Username, email and password are required",
                    });
                    return;
                }
                const result = yield authService.register({
                    username,
                    email,
                    password,
                });
                res.status(201).json(result);
            }
            catch (error) {
                res.status(400).json({
                    error: error.message || "Failed to register",
                });
            }
        });
    }
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                if (!email || !password) {
                    res.status(400).json({
                        error: "Email and password are required",
                    });
                }
                const result = yield authService.login({
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
            }
            catch (error) {
                res.status(401).json({
                    error: error.message || "Invalid credentials",
                });
            }
        });
    }
    logout(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.userId;
                yield authService.logout(userId);
                res.clearCookie("refreshToken");
                res.json({ message: "Logged out successfully" });
            }
            catch (error) {
                res.status(500).json({
                    error: error.message || "Failed to logout",
                });
            }
        });
    }
    refreshToken(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const refreshToken = req.cookies.refreshToken;
                if (!refreshToken) {
                    res.status(401).json({
                        error: "Refresh token not found",
                    });
                    return;
                }
                const result = yield authService.refreshToken(refreshToken);
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
            }
            catch (error) {
                res.status(401).json({
                    error: error.message || "Invalid refresh token",
                });
            }
        });
    }
}
exports.AuthController = AuthController;
