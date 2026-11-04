import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonButton,
  IonIcon, IonSpinner, IonText, IonBadge
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  trash, bookmarkOutline, list, bulb, construct, warning, water, leaf, alertCircle, location
} from 'ionicons/icons';
import { forkJoin, of, map, catchError } from 'rxjs';
import { IncidenciasService } from '../services/incidencias.service';
import { SeguimientoService } from '../services/seguimiento.service';
import {
  Incidencia, textoEstado, colorEstado, textoTipo, iconoTipo, colorPrioridad
} from '../models/incidencia.model';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: true,
  imports: [RouterLink, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem,
    IonLabel, IonButton, IonIcon, IonSpinner, IonText, IonBadge],
})
export class Tab3Page {
  private servicio = inject(IncidenciasService);
  private seguimiento = inject(SeguimientoService);

  items = signal<Incidencia[]>([]);
  cargando = signal(false);
  error = signal('');

  textoEstado = textoEstado;
  colorEstado = colorEstado;
  textoTipo = textoTipo;
  iconoTipo = iconoTipo;
  colorPrioridad = colorPrioridad;

  constructor() {
    addIcons({ trash, bookmarkOutline, list, bulb, construct, warning, water, leaf, alertCircle, location });
  }

  async ionViewWillEnter() {
    await this.seguimiento.esperar();
    this.cargar();
  }

  cargar() {
    const codigos = this.seguimiento.codigos();
    this.error.set('');
    if (codigos.length === 0) { this.items.set([]); return; }

    this.cargando.set(true);
    forkJoin(codigos.map(c =>
      this.servicio.filtrar('codigo', c).pipe(
        map(lista => lista.find(x => x.codigo === c) ?? null),
        catchError(() => of(null))
      )
    )).subscribe(res => {
      const encontrados = res.filter((x): x is Incidencia => x !== null);
      if (encontrados.length === 0) this.error.set('No se pudo consultar el servicio.');
      this.items.set(encontrados);
      this.cargando.set(false);
    });
  }

  async desmarcar(inc: Incidencia) {
    await this.seguimiento.alternar(inc.codigo);
    this.items.update(l => l.filter(x => x.codigo !== inc.codigo));
  }
}