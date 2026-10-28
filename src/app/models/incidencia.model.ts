export type Estado = 'pendiente' | 'en_proceso' | 'resuelta';
export type Prioridad = 'baja' | 'media' | 'alta';

export interface Incidencia {
  id?: string;
  codigo: string;
  tipo: string;
  descripcion: string;
  direccion: string;
  sector: string;
  fecha: string;
  estado: Estado;
  prioridad: Prioridad;
  fotoUrl?: string;
  latitud?: number | null;
  longitud?: number | null;
  observacion?: string;
}

export const TIPOS = ['luminaria', 'bache', 'senalizacion', 'alcantarilla', 'parque'];

export function textoEstado(e: Estado): string {
  return { pendiente: 'Pendiente', en_proceso: 'En proceso', resuelta: 'Resuelta' }[e];
}

export function colorEstado(e: Estado): string {
  return { pendiente: 'warning', en_proceso: 'primary', resuelta: 'success' }[e];
}