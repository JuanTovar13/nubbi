import { supabase } from "../../config/supabase";
import { RegisterDTO, LoginDTO, AuthResponse } from "./auth.types";

export class AuthService {
  
  static async register(data: RegisterDTO): Promise<AuthResponse> {
    const { email, password, full_name, role = "familia" } = data;

    // 1. Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      throw new Error(authError.message);
    }

    const userId = authData.user?.id;
    if (!userId) throw new Error("Error creando usuario");

    // 2. Crear profile
    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      email,
      full_name,
      role,
    });

    if (profileError) {
      throw new Error(profileError.message);
    }

    return {
      access_token: authData.session?.access_token || "",
      refresh_token: authData.session?.refresh_token || "",
      user: {
        id: userId,
        email,
        role,
        full_name,
      },
    };
  }

  static async login(data: LoginDTO): Promise<AuthResponse> {
    const { email, password } = data;

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error("Credenciales inválidas");
    }

    const user = authData.user;
    if (!user) throw new Error("Usuario no encontrado");

    // Obtener perfil
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError) {
      throw new Error("Perfil no encontrado");
    }

    return {
      access_token: authData.session.access_token,
      refresh_token: authData.session.refresh_token,
      user: {
        id: user.id,
        email: user.email!,
        role: profile.role,
        full_name: profile.full_name,
      },
    };
  }

  static async getProfile(userId: string) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw new Error("No se pudo obtener el perfil");

    return data;
  }
}