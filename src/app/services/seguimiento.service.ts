import { Injectable, signal } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

const CLAVE = 'seguimiento';

// guardada SOLO en el dispositivo
@Injectable({ providedIn: 'root' })
export class SeguimientoService {
  codigos = signal<string[]>([]);
  private listo: Promise<void>;

  constructor() { this.listo = this.cargar(); }

  private async cargar() {
    const { value } = await Preferences.get({ key: CLAVE });
    this.codigos.set(value ? JSON.parse(value) : []);
  }

  esperar() { return this.listo; }

  async alternar(codigo: string) {
    await this.listo;
    const actual = this.codigos();
    const nueva = actual.includes(codigo)
      ? actual.filter(c => c !== codigo)   // desmarcar
      : [...actual, codigo];               // marcar
    this.codigos.set(nueva);
    await Preferences.set({ key: CLAVE, value: JSON.stringify(nueva) });
  }
}