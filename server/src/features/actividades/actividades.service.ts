import { randomUUID } from "crypto";
import { supabase } from "../../config/supabase";
import Boom from "@hapi/boom";
import { Actividad, CreateActividadDTO, UpdateActividadDTO } from "./actividades.types";

export const createActividadService = async (
  data: CreateActividadDTO,
  gestorId: string
): Promise<Actividad> => {
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

  if (error) {
    throw Boom.internal(error.message);
  }
  return actividad;
};

export const listActividadesService = async (
  soloActivas = false
): Promise<Actividad[]> => {
  let query = supabase
    .from("actividades")
    .select("*")
    .order("created_at", { ascending: false });

  if (soloActivas) query = query.eq("activa", true);

  const { data, error } = await query;
  if (error) {
    throw Boom.internal(error.message);
  }
  return data || [];
};

export const getActividadByIdService = async (
  id: string
): Promise<Actividad> => {
  const { data, error } = await supabase
    .from("actividades")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    throw Boom.notFound("Actividad no encontrada");
  }
  return data;
};

export const updateActividadService = async (
  id: string,
  data: UpdateActividadDTO,
  gestorId: string
): Promise<Actividad> => {
  const existing = await getActividadByIdService(id);
  if (existing.created_by !== gestorId) {
    throw Boom.forbidden("No autorizado");
  }

  const { data: updated, error } = await supabase
    .from("actividades")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw Boom.internal(error.message);
  }
  return updated;
};

export const deleteActividadService = async (
  id: string,
  gestorId: string
): Promise<void> => {
  const existing = await getActividadByIdService(id);
  if (existing.created_by !== gestorId) {
    throw Boom.forbidden("No autorizado");
  }

  const { error } = await supabase.from("actividades").delete().eq("id", id);
  if (error) {
    throw Boom.internal(error.message);
  }
};

export const getActividadByQrPayloadService = async (
  qr_payload: string
): Promise<Actividad | null> => {
  const { data, error } = await supabase
    .from("actividades")
    .select("*")
    .eq("qr_payload", qr_payload)
    .single();

  if (error) return null;
  return data;
};
