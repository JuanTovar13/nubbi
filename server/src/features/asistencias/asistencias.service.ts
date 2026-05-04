import { supabase } from "../../config/supabase";
import { pool } from "../../config/database";
import { getActividadByQrPayloadService } from "../actividades/actividades.service";
import { ScanQRDTO, ScanResult } from "./asistencias.types";
import Boom from "@hapi/boom";

export const scanQRService = async (
  data: ScanQRDTO,
  userId: string
): Promise<ScanResult> => {
  const { qr_payload } = data;

  const actividad = await getActividadByQrPayloadService(qr_payload);
  if (!actividad) {
    throw Boom.badRequest("QR inválido o actividad no encontrada");
  }

  if (!actividad.activa) {
    throw Boom.conflict("Esta actividad ya no está activa");
  }

  const { data: existing } = await supabase
    .from("asistencias")
    .select("id")
    .eq("user_id", userId)
    .eq("actividad_id", actividad.id)
    .single();

  if (existing) {
    throw Boom.conflict("Ya registraste tu asistencia a esta actividad");
  }

  const { data: asistencia, error: asistenciaError } = await supabase
    .from("asistencias")
    .insert({ user_id: userId, actividad_id: actividad.id })
    .select()
    .single();

  if (asistenciaError) {
    throw Boom.internal(asistenciaError.message);
  }

  const puntos_ganados = actividad.puntos;
  const result = await pool.query<{ total: number }>(
    `INSERT INTO public.puntos_balance (user_id, total)
     VALUES ($1, $2)
     ON CONFLICT (user_id)
     DO UPDATE SET total = puntos_balance.total + $2
     RETURNING total`,
    [userId, puntos_ganados]
  );

  const puntos_total = result.rows[0]?.total ?? puntos_ganados;

  return { asistencia, puntos_ganados, puntos_total };
};

export const getBalanceService = async (userId: string): Promise<number> => {
  const { data, error } = await supabase
    .from("puntos_balance")
    .select("total")
    .eq("user_id", userId)
    .single();

  if (error || !data) return 0;
  return data.total;
};

export const getHistorialService = async (userId: string) => {
  const { data, error } = await supabase
    .from("asistencias")
    .select("*, actividades(titulo, fecha, puntos)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw Boom.internal(error.message);
  }
  return data || [];
};
