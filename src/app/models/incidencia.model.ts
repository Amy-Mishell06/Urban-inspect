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

const NOMBRES_TIPO: Record<string, string> = {
  luminaria: 'Luminaria', bache: 'Bache', senalizacion: 'Señalización',
  alcantarilla: 'Alcantarilla', parque: 'Parque',
};
const ICONOS_TIPO: Record<string, string> = {
  luminaria: 'bulb', bache: 'construct', senalizacion: 'warning',
  alcantarilla: 'water', parque: 'leaf',
};

export function textoTipo(t: string): string { return NOMBRES_TIPO[t] ?? t; }
export function iconoTipo(t: string): string { return ICONOS_TIPO[t] ?? 'alert-circle'; }
export function colorPrioridad(p: Prioridad): string {
  return { baja: 'medium', media: 'secondary', alta: 'danger' }[p];
}