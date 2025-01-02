export interface RegisterDTO {
  username: string;
  email: string;
  password: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    username: string;
    isVerified?: boolean;
  };
  accessToken: string;
  refreshToken: string;
}

export interface TokenPayload {
  userId: string;
  type: "access" | "refresh" | "verification" | "reset";
}

export interface RefreshTokenResponse {
  user: any;
  accessToken: string;
  refreshToken: string;
}
