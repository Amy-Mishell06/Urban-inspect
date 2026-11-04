import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon, IonText, IonProgressBar
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { add, list, bookmark, time, construct, checkmarkCircle, documents } from 'ionicons/icons';
import { forkJoin } from 'rxjs';
import { IncidenciasService } from '../services/incidencias.service';
import { SeguimientoService } from '../services/seguimiento.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [RouterLink, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon,
    IonText, IonProgressBar],
})
export class Tab1Page implements OnInit {
  private servicio = inject(IncidenciasService);
  seguimiento = inject(SeguimientoService);

  pendientes = signal(0);
  enProceso = signal(0);
  resueltas = signal(0);
  error = signal('');

  constructor() {
    addIcons({ add, list, bookmark, time, construct, checkmarkCircle, documents });
  }

  ngOnInit() {
    this.servicio.cambios.subscribe(() => this.cargar());
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

  porcentaje() {
    return this.total() ? Math.round((this.resueltas() * 100) / this.total()) : 0;
  }
}