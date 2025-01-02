import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { hashPassword, comparePassword } from "../utils/password";
import { RegisterDTO, LoginDTO, AuthResponse } from "../types/auth";

export class AuthService {
  constructor(private prisma: PrismaClient) {}

  private generateToken(userId: string): string {
    return jwt.sign({ userId }, process.env.JWT_SECREt!, {
      expiresIn: "7d",
    });
  }

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
        password: data.password,
      },
      select: {
        id: true,
        email: true,
        username: true,
      },
    });

    const token = this.generateToken(user.id);

    return {
      token,
      user,
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

    const token = this.generateToken(user.id);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    };
  }
}
