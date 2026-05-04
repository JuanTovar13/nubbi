export interface Asistencia {
  id: string;
  user_id: string;
  actividad_id: string;
  created_at: string;
}

export interface ScanQRDTO {
  qr_payload: string;
}

export interface ScanResult {
  asistencia: Asistencia;
  puntos_ganados: number;
  puntos_total: number;
}

export interface PuntosBalance {
  user_id: string;
  total: number;
}
