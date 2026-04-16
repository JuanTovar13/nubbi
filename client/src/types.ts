import type { User, Session } from "@supabase/supabase-js";

// ─── TIPOS DE SUPABASE (ya estaban) ──────────────────────────────────────────
export interface AuthData {
  user: User;
  session: Session;
}

export interface Creator {
  userName: string;
  email: string;
}

export interface Room {
  id: string;
  name: string;
  created_at: string;
  created_by: Creator;
}

export interface Message {
  id: string;
  content: string;
  room_id: string;
  created_at: string;
  created_by: Creator;
}

// ─── TIPOS DE NUBBI ───────────────────────────────────────────────────────────

// Los dos roles que existen en la app
export type UserRole = "familia" | "gestor";

// Todas las pantallas posibles de la app
export type Screen =
  | "home-familia"
  | "comunidad"
  | "escanear-qr"
  | "progreso"
  | "home-gestor"
  | "crear-actividad"
  | "dashboard";

// Props que recibe casi cada pantalla (para navegar entre ellas)
export interface ScreenProps {
  onNav: (screen: Screen) => void;
}