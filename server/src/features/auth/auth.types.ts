export type UserRole = "familia" | "gestor";

export interface RegisterDTO {
  email: string;
  password: string;
  full_name: string;
  role?: UserRole;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    role: UserRole;
    full_name: string;
  };
}

export interface JwtPayload {
  sub: string; // user id
  email: string;
  role: UserRole;
}