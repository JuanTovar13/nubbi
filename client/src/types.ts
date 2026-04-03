import type { User, Session } from "@supabase/supabase-js";

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
