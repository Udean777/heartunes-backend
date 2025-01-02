var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import nodemailer from "nodemailer";
export class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || "587"),
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }
    sendVerificationEmail(email, token) {
        return __awaiter(this, void 0, void 0, function* () {
            const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
            yield this.transporter.sendMail({
                from: process.env.SMTP_FROM,
                to: email,
                subject: "Verify your email",
                html: `
          <h1>Welcome to Heartunes!</h1>
          <p>Please click the link below to verify your email:</p>
          <a href="${verificationUrl}">Verify Email</a>
        `,
            });
        });
    }
    sendPasswordResetEmail(email, token) {
        return __awaiter(this, void 0, void 0, function* () {
            const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
            yield this.transporter.sendMail({
                from: process.env.SMTP_FROM,
                to: email,
                subject: "Password Reset Request",
                html: `
        <h1>Password Reset Request</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>If you didn't request this, please ignore this email.</p>
      `,
            });
        });
    }
}
//# sourceMappingURL=email.service.js.map