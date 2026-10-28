import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

export interface Borrador {
  tipo: string; descripcion: string; direccion: string; sector: string; prioridad: string;
  foto: string | null; latitud: any; longitud: any;
}
const CLAVE = 'borrador_incidencia';

@Injectable({ providedIn: 'root' })
export class BorradorService {
  async guardar(b: Borrador) {
    try {
      await Preferences.set({ key: CLAVE, value: JSON.stringify(b) });
    } catch {
      // Si la foto es grande se guarda lo demas
      await Preferences.set({ key: CLAVE, value: JSON.stringify({ ...b, foto: null }) });
    }
  }
  async obtener(): Promise<Borrador | null> {
    const { value } = await Preferences.get({ key: CLAVE });
    return value ? JSON.parse(value) : null;
  }
  borrar() { return Preferences.remove({ key: CLAVE }); }
}