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
exports.AuthService = void 0;
const password_1 = require("../utils/password");
class AuthService {
    constructor(prisma, 
    // private emailService: EmailService,
    tokenService) {
        this.prisma = prisma;
        this.tokenService = tokenService;
    }
    register(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingUser = yield this.prisma.user.findFirst({
                where: {
                    OR: [{ email: data.email }, { username: data.username }],
                },
            });
            if (existingUser) {
                throw new Error("User with this email or username already exists!");
            }
            const hashedPassword = yield (0, password_1.hashPassword)(data.password);
            const user = yield this.prisma.user.create({
                data: {
                    email: data.email,
                    username: data.username,
                    password: hashedPassword,
                    isVerified: false,
                },
            });
            const accessToken = this.tokenService.generateAccessToken(user.id);
            const refreshToken = this.tokenService.generateRefreshToken(user.id);
            yield this.prisma.user.update({
                where: { id: user.id },
                data: { refreshToken },
            });
            // const verificationToken = this.tokenService.generateVerificationToken(
            //   user.id
            // );
            // await this.emailService.sendVerificationEmail(
            //   user.email,
            //   verificationToken
            // );
            return {
                accessToken,
                refreshToken,
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    isVerified: user.isVerified,
                },
            };
        });
    }
    login(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.prisma.user.findUnique({
                where: { email: data.email },
            });
            if (!user) {
                throw new Error("Invalid credentials");
            }
            const isPasswordValid = yield (0, password_1.comparePassword)(data.password, user.password);
            if (!isPasswordValid) {
                throw new Error("Invalid credentials");
            }
            const accessToken = this.tokenService.generateAccessToken(user.id);
            const refreshToken = this.tokenService.generateRefreshToken(user.id);
            yield this.prisma.user.update({
                where: { id: user.id },
                data: { refreshToken },
            });
            return {
                accessToken,
                refreshToken,
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    isVerified: user.isVerified,
                },
            };
        });
    }
    logout(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.prisma.user.update({
                    where: { id: userId },
                    data: { refreshToken: null },
                });
            }
            catch (error) {
                console.error("Error in logout service:", error);
                throw new Error("Failed to update user");
            }
        });
    }
    // async verifyEmail(token: string): Promise<void> {
    //   const payload = this.tokenService.verifyToken(token, "verification");
    //   await this.prisma.user.update({
    //     where: { id: payload.userId },
    //     data: {
    //       isVerified: true,
    //       verifiedAt: new Date(),
    //     },
    //   });
    // }
    // async requestPasswordReset(email: string): Promise<void> {
    //   const user = await this.prisma.user.findUnique({
    //     where: { email },
    //   });
    //   if (!user) {
    //     return;
    //   }
    //   const resetToken = this.tokenService.generatePasswordResetToken(user.id);
    //   await this.emailService.sendPasswordResetEmail(email, resetToken);
    // }
    // async resetPassword(token: string, newPassword: string): Promise<void> {
    //   const payload = this.tokenService.verifyToken(token, "reset");
    //   const hashedPassword = await hashPassword(newPassword);
    //   await this.prisma.user.update({
    //     where: { id: payload.userId },
    //     data: { password: hashedPassword },
    //   });
    // }
    refreshToken(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const payload = this.tokenService.verifyToken(refreshToken, "refresh");
            const accessToken = this.tokenService.generateAccessToken(payload.userId);
            const newRefreshToken = this.tokenService.generateRefreshToken(payload.userId);
            const user = yield this.prisma.user.findUnique({
                where: { id: payload.userId },
            });
            if (!user) {
                throw new Error("User not found");
            }
            return {
                accessToken,
                refreshToken: newRefreshToken,
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    isVerified: user.isVerified,
                },
            };
        });
    }
}
exports.AuthService = AuthService;
