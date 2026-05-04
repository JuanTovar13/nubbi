import { randomUUID } from "crypto";
import { supabase } from "../../config/supabase";
import { Actividad, CreateActividadDTO, UpdateActividadDTO } from "./actividades.types";

export class ActividadesService {

  static async create(data: CreateActividadDTO, gestorId: string): Promise<Actividad> {
    const { titulo, descripcion, fecha, ubicacion, puntos = 10 } = data;

    const { data: actividad, error } = await supabase
      .from("actividades")
      .insert({
        titulo,
        descripcion,
        fecha,
        ubicacion,
        qr_payload: randomUUID(),
        puntos,
        activa: true,
        created_by: gestorId,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return actividad;
  }

  static async list(soloActivas = false): Promise<Actividad[]> {
    let query = supabase
      .from("actividades")
      .select("*")
      .order("created_at", { ascending: false });

    if (soloActivas) query = query.eq("activa", true);

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data || [];
  }

  static async getById(id: string): Promise<Actividad> {
    const { data, error } = await supabase
      .from("actividades")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) throw new Error("Actividad no encontrada");
    return data;
  }

  static async update(id: string, data: UpdateActividadDTO, gestorId: string): Promise<Actividad> {
    const existing = await this.getById(id);
    if (existing.created_by !== gestorId) throw new Error("No autorizado");

    const { data: updated, error } = await supabase
      .from("actividades")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return updated;
  }

  static async delete(id: string, gestorId: string): Promise<void> {
    const existing = await this.getById(id);
    if (existing.created_by !== gestorId) throw new Error("No autorizado");

    const { error } = await supabase.from("actividades").delete().eq("id", id);
    if (error) throw new Error(error.message);
  }

  static async getByQrPayload(qr_payload: string): Promise<Actividad | null> {
    const { data, error } = await supabase
      .from("actividades")
      .select("*")
      .eq("qr_payload", qr_payload)
      .single();

    if (error) return null;
    return data;
  }
}
