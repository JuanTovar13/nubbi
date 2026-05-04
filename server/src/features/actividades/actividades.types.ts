export interface Actividad {
  id: string;
  titulo: string;
  descripcion: string | null;
  fecha: string;
  ubicacion: string | null;
  qr_payload: string;
  puntos: number;
  activa: boolean;
  created_by: string;
  created_at: string;
}

export interface CreateActividadDTO {
  titulo: string;
  descripcion?: string;
  fecha: string;
  ubicacion?: string;
  puntos?: number;
}

export interface UpdateActividadDTO {
  titulo?: string;
  descripcion?: string;
  fecha?: string;
  ubicacion?: string;
  puntos?: number;
  activa?: boolean;
}
