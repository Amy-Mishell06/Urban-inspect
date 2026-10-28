import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, timeout } from 'rxjs';

export interface Clima { temperatura: number; precipitacion: number; descripcion: string; }

// Códigos WMO de Open-Meteo → texto
function describir(c: number): string {
  if (c === 0) return 'Despejado';
  if (c <= 3) return 'Parcialmente nublado';
  if (c <= 48) return 'Niebla';
  if (c <= 57) return 'Llovizna';
  if (c <= 67) return 'Lluvia';
  if (c <= 77) return 'Nieve';
  if (c <= 82) return 'Chubascos';
  if (c <= 99) return 'Tormenta';
  return 'Sin descripción';
}

@Injectable({ providedIn: 'root' })
export class ClimaService {
  private http = inject(HttpClient);

  async consultar(lat: number, lon: number): Promise<Clima> {
    const params = {
      latitude: lat, longitude: lon,
      current: 'temperature_2m,weather_code',
      hourly: 'precipitation',
      forecast_days: 1,
      timezone: 'auto'
    };
    const r: any = await firstValueFrom(
      this.http.get('https://api.open-meteo.com/v1/forecast', { params }).pipe(timeout(8000))
    );

    const temp = r?.current?.temperature_2m;
    // en Open-Meteo es la suma de la hora anterior.
    const hora = String(r?.current?.time ?? '').slice(0, 13) + ':00';
    const idx = (r?.hourly?.time ?? []).indexOf(hora);
    const lluvia = idx >= 0 ? r.hourly.precipitation[idx] : null;

    // se trata como "sin datos"
    if (typeof temp !== 'number' || typeof lluvia !== 'number') throw new Error('SIN_DATOS');
    return { temperatura: temp, precipitacion: lluvia, descripcion: describir(r.current.weather_code) };
  }
}