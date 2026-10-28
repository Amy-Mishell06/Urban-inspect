import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe, UpperCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle,
  IonCardSubtitle, IonCardContent, IonBadge, IonInfiniteScroll, IonInfiniteScrollContent,
  IonRefresher, IonRefresherContent, IonButton, IonIcon, IonSpinner, IonText, IonFab,
  IonFabButton, InfiniteScrollCustomEvent
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { add, refresh } from 'ionicons/icons';
import { IncidenciasService } from '../services/incidencias.service';
import { Incidencia, textoEstado, colorEstado } from '../models/incidencia.model';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  standalone: true,
  imports: [DatePipe, UpperCasePipe, RouterLink, IonHeader, IonToolbar, IonTitle, IonContent,
    IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonBadge,
    IonInfiniteScroll, IonInfiniteScrollContent, IonRefresher, IonRefresherContent, IonButton,
    IonIcon, IonSpinner, IonText, IonFab, IonFabButton],
})
export class Tab2Page implements OnInit {
  private servicio = inject(IncidenciasService);

  // Signals: al cambiar su valor, la pantalla se actualiza sola
  incidencias = signal<Incidencia[]>([]);
  hayMas = signal(true);
  cargando = signal(false);
  error = signal('');

  private pagina = 1;
  readonly limite = 10;

  textoEstado = textoEstado;
  colorEstado = colorEstado;

  constructor() { addIcons({ add, refresh }); }

  ngOnInit() {
    this.reiniciar();
    this.servicio.cambios.subscribe(() => this.reiniciar());
  }

  reiniciar() {
    this.incidencias.set([]);
    this.pagina = 1;
    this.hayMas.set(true);
    this.error.set('');
    this.cargarPagina();
  }

  cargarPagina(event?: InfiniteScrollCustomEvent) {
    if (!this.hayMas()) { event?.target.complete(); return; }
    this.cargando.set(true);
    this.servicio.listar(this.pagina, this.limite).subscribe({
      next: datos => {
        this.incidencias.update(lista => [...lista, ...datos]);
        this.hayMas.set(datos.length === this.limite);
        this.pagina++;
        this.cargando.set(false);
        event?.target.complete();
      },
      error: () => {
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
}