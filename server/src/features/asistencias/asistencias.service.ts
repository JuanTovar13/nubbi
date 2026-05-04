import { supabase } from "../../config/supabase";
import { pool } from "../../config/database";
import { ActividadesService } from "../actividades/actividades.service";
import { ScanQRDTO, ScanResult } from "./asistencias.types";

export class AsistenciasService {

  static async scanQR(data: ScanQRDTO, userId: string): Promise<ScanResult> {
    const { qr_payload } = data;

    // 1. Find activity by qr_payload
    const actividad = await ActividadesService.getByQrPayload(qr_payload);
    if (!actividad) throw new Error("QR inválido o actividad no encontrada");

    // 2. Validate activity is active
    if (!actividad.activa) throw new Error("Esta actividad ya no está activa");

    // 3. Check for duplicate attendance
    const { data: existing } = await supabase
      .from("asistencias")
      .select("id")
      .eq("user_id", userId)
      .eq("actividad_id", actividad.id)
      .single();

    if (existing) throw new Error("Ya registraste tu asistencia a esta actividad");

    // 4. Register attendance
    const { data: asistencia, error: asistenciaError } = await supabase
      .from("asistencias")
      .insert({ user_id: userId, actividad_id: actividad.id })
      .select()
      .single();

    if (asistenciaError) throw new Error(asistenciaError.message);

    // 5. Atomic points increment via pg pool
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
  }

  static async getBalance(userId: string): Promise<number> {
    const { data, error } = await supabase
      .from("puntos_balance")
      .select("total")
      .eq("user_id", userId)
      .single();

    if (error || !data) return 0;
    return data.total;
  }

  static async getHistorial(userId: string) {
    const { data, error } = await supabase
      .from("asistencias")
      .select("*, actividades(titulo, fecha, puntos)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }
}
