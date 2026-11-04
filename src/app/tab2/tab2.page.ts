import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle,
  IonCardContent, IonBadge, IonInfiniteScroll, IonInfiniteScrollContent, IonRefresher,
  IonRefresherContent, IonButton, IonIcon, IonText, IonFab, IonFabButton, IonSegment,
  IonSegmentButton, IonLabel, IonSkeletonText, InfiniteScrollCustomEvent, SegmentCustomEvent
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  add, refresh, bulb, construct, warning, water, leaf, alertCircle, location, calendar, fileTrayOutline
} from 'ionicons/icons';
import { IncidenciasService } from '../services/incidencias.service';
import {
  Incidencia, Estado, textoEstado, colorEstado, textoTipo, iconoTipo, colorPrioridad
} from '../models/incidencia.model';
import { CloudinaryPipe } from '../pipes/cloudinary.pipe';

type Filtro = 'todas' | Estado;

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [CloudinaryPipe, DatePipe, RouterLink, IonHeader, IonToolbar, IonTitle, IonContent,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonBadge, IonInfiniteScroll,
    IonInfiniteScrollContent, IonRefresher, IonRefresherContent, IonButton, IonIcon, IonText,
    IonFab, IonFabButton, IonSegment, IonSegmentButton, IonLabel, IonSkeletonText],
})
export class Tab2Page implements OnInit {
  private servicio = inject(IncidenciasService);

  incidencias = signal<Incidencia[]>([]);
  hayMas = signal(true);
  cargando = signal(false);
  error = signal('');
  filtro = signal<Filtro>('todas');

  private pagina = 1;
  private peticion = 0;          // para ignorar respuestas de un filtro anterior
  readonly limite = 10;
  readonly esqueletos = [1, 2, 3];

  textoEstado = textoEstado;
  colorEstado = colorEstado;
  textoTipo = textoTipo;
  iconoTipo = iconoTipo;
  colorPrioridad = colorPrioridad;

  constructor() {
    addIcons({ add, refresh, bulb, construct, warning, water, leaf, alertCircle, location, calendar, fileTrayOutline });
  }

  ngOnInit() {
    this.reiniciar();
    this.servicio.cambios.subscribe(() => this.reiniciar());
  }

  cambiarFiltro(ev: SegmentCustomEvent) {
    this.filtro.set(ev.detail.value as Filtro);
    this.reiniciar();
  }

  reiniciar() {
    this.peticion++;             // invalida cualquier carga en curso
    this.incidencias.set([]);
    this.pagina = 1;
    this.hayMas.set(true);
    this.error.set('');
    this.cargarPagina();
  }

  cargarPagina(event?: InfiniteScrollCustomEvent) {
    if (!this.hayMas()) { event?.target.complete(); return; }
    const n = this.peticion;
    const estado = this.filtro() === 'todas' ? undefined : this.filtro();
    this.cargando.set(true);

    this.servicio.listar(this.pagina, this.limite, estado).subscribe({
      next: datos => {
        if (n !== this.peticion) { event?.target.complete(); return; }   // llegó tarde: se descarta
        this.incidencias.update(lista => [...lista, ...datos]);
        this.hayMas.set(datos.length === this.limite);
        this.pagina++;
        this.cargando.set(false);
        event?.target.complete();
      },
      error: () => {
        if (n !== this.peticion) { event?.target.complete(); return; }
        this.error.set('No se pudo consultar el servicio de incidencias. Revise su conexión.');
        this.cargando.set(false);
        event?.target.complete();
      }
    });
  }

  refrescar(ev: any) {
    this.reiniciar();
    setTimeout(() => ev.target.complete(), 500);
  }

  textoVacio(): string {
    const f = this.filtro();
    return f === 'todas'
      ? 'No existen incidencias registradas.'
      : `No hay incidencias en estado "${textoEstado(f)}".`;
  }
}