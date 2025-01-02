import { PrismaClient } from "@prisma/client";
import { hashPassword, comparePassword } from "../utils/password";
import {
  RegisterDTO,
  LoginDTO,
  AuthResponse,
  RefreshTokenResponse,
} from "../types/auth";
import { EmailService } from "./email.service";
import { TokenService } from "./token.service";

export class AuthService {
  constructor(
    private prisma: PrismaClient,
    // private emailService: EmailService,
    private tokenService: TokenService
  ) {}

  async register(data: RegisterDTO): Promise<AuthResponse> {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: data.email }, { username: data.username }],
      },
    });

    if (existingUser) {
      throw new Error("User with this email or username already exists!");
    }

    const hashedPassword = await hashPassword(data.password);
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        password: hashedPassword,
        isVerified: false,
      },
    });

    const accessToken = this.tokenService.generateAccessToken(user.id);
    const refreshToken = this.tokenService.generateRefreshToken(user.id);

    await this.prisma.user.update({
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
  }

  async login(data: LoginDTO): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isPasswordValid = await comparePassword(data.password, user.password);

    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    const accessToken = this.tokenService.generateAccessToken(user.id);
    const refreshToken = this.tokenService.generateRefreshToken(user.id);

    await this.prisma.user.update({
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
  }

  async logout(userId: string): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: { refreshToken: null },
      });
    } catch (error: any) {
      console.error("Error in logout service:", error);
      throw new Error("Failed to update user");
    }
  }

  async verifyEmail(token: string): Promise<void> {
    const payload = this.tokenService.verifyToken(token, "verification");

    await this.prisma.user.update({
      where: { id: payload.userId },
      data: {
        isVerified: true,
        verifiedAt: new Date(),
      },
    });
  }

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

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const payload = this.tokenService.verifyToken(token, "reset");
    const hashedPassword = await hashPassword(newPassword);

    await this.prisma.user.update({
      where: { id: payload.userId },
      data: { password: hashedPassword },
    });
  }

  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const payload = this.tokenService.verifyToken(refreshToken, "refresh");

    const accessToken = this.tokenService.generateAccessToken(payload.userId);
    const newRefreshToken = this.tokenService.generateRefreshToken(
      payload.userId
    );

    const user = await this.prisma.user.findUnique({
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
  }
}
