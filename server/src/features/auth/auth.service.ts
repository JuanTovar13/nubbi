import { supabase } from "../../config/supabase";
import { RegisterDTO, LoginDTO, AuthResponse } from "./auth.types";
import Boom from "@hapi/boom";

export const registerUserService = async (
  data: RegisterDTO
): Promise<AuthResponse> => {
  const { email, password, full_name, role = "familia" } = data;

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    throw Boom.badRequest(authError.message);
  }

  const userId = authData.user?.id;
  if (!userId) {
    throw Boom.internal("Error creando usuario");
  }

  const { error: profileError } = await supabase.from("profiles").insert({
    id: userId,
    email,
    full_name,
    role,
  });

  if (profileError) {
    throw Boom.internal(profileError.message);
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
};

export const loginUserService = async (
  data: LoginDTO
): Promise<AuthResponse> => {
  const { email, password } = data;

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw Boom.unauthorized(error.message || "Credenciales inválidas");
  }

  const user = authData.user;
  if (!user) {
    throw Boom.unauthorized("Usuario no encontrado");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError) {
    throw Boom.notFound(profileError.message || "Perfil no encontrado");
  }

  return {
    access_token: authData.session?.access_token || "",
    refresh_token: authData.session?.refresh_token || "",
    user: {
      id: user.id,
      email: user.email || email,
      role: profile.role,
      full_name: profile.full_name,
    },
  };
};

export const getProfileService = async (userId: string) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    throw Boom.notFound("No se pudo obtener el perfil");
  }

  return data;
};