import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject, of, throwError, catchError } from 'rxjs';
import { environment } from '../../environments/environment';
import { Incidencia } from '../models/incidencia.model';

@Injectable({ providedIn: 'root' })
export class IncidenciasService {
  private http = inject(HttpClient);
  private url = environment.apiUrl;

  readonly cambios = new Subject<void>();

  listar(pagina: number, limite: number): Observable<Incidencia[]> {
    const params = new HttpParams()
      .set('page', pagina)
      .set('limit', limite)
      .set('sortBy', 'fecha')
      .set('order', 'desc');
    return this.http.get<Incidencia[]>(this.url, { params }).pipe(
      // MockAPI a veces responde 404 cuando no hay resultados - se trata como lista vacía
      catchError(err => err.status === 404 ? of([]) : throwError(() => err))
    );
  }

  obtener(id: string): Observable<Incidencia> {
    return this.http.get<Incidencia>(`${this.url}/${id}`);
  }

  filtrar(campo: string, valor: string): Observable<Incidencia[]> {
    return this.http.get<Incidencia[]>(this.url, { params: { [campo]: valor } }).pipe(
      catchError(err => err.status === 404 ? of([]) : throwError(() => err))
    );
  }

  crear(inc: Incidencia): Observable<Incidencia> {
    return this.http.post<Incidencia>(this.url, inc);
  }

  actualizar(id: string, datos: Partial<Incidencia>): Observable<Incidencia> {
    return this.http.put<Incidencia>(`${this.url}/${id}`, datos);
  }
}