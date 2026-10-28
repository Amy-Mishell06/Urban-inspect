import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonGrid, IonRow, IonCol, IonCard,
  IonCardContent, IonButton, IonIcon, IonText
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { add, list, bookmark } from 'ionicons/icons';
import { forkJoin } from 'rxjs';
import { IncidenciasService } from '../services/incidencias.service';
import { SeguimientoService } from '../services/seguimiento.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  standalone: true,
  imports: [RouterLink, IonHeader, IonToolbar, IonTitle, IonContent, IonGrid, IonRow, IonCol,
    IonCard, IonCardContent, IonButton, IonIcon, IonText],
})
export class Tab1Page implements OnInit {
  private servicio = inject(IncidenciasService);
  seguimiento = inject(SeguimientoService);

  pendientes = signal(0);
  enProceso = signal(0);
  resueltas = signal(0);
  error = signal('');

  constructor() { addIcons({ add, list, bookmark }); }

  ngOnInit() {
    this.servicio.cambios.subscribe(() => this.cargar()); // se actualiza con altas/cambios
  }

  ionViewWillEnter() { this.cargar(); }

  cargar() {
    this.error.set('');
    forkJoin({
      p: this.servicio.filtrar('estado', 'pendiente'),
      e: this.servicio.filtrar('estado', 'en_proceso'),
      r: this.servicio.filtrar('estado', 'resuelta'),
    }).subscribe({
      next: ({ p, e, r }) => {
        this.pendientes.set(p.length);
        this.enProceso.set(e.length);
        this.resueltas.set(r.length);
      },
      error: () => this.error.set('No se pudieron cargar los indicadores.'),
    });
  }

  total() { return this.pendientes() + this.enProceso() + this.resueltas(); }
}