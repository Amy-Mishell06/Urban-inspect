import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatePipe, UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonButton, IonIcon,
  IonList, IonItem, IonLabel, IonBadge, IonSelect, IonSelectOption, IonTextarea, IonSpinner,
  IonText, ToastController
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { bookmark, bookmarkOutline } from 'ionicons/icons';
import { IncidenciasService } from '../../services/incidencias.service';
import { SeguimientoService } from '../../services/seguimiento.service';
import { Incidencia, Estado, textoEstado, colorEstado } from '../../models/incidencia.model';

@Component({
  selector: 'app-detalle',
  templateUrl: 'detalle.page.html',
  standalone: true,
  imports: [DatePipe, UpperCasePipe, FormsModule, IonHeader, IonToolbar, IonTitle, IonContent,
    IonButtons, IonBackButton, IonButton, IonIcon, IonList, IonItem, IonLabel, IonBadge,
    IonSelect, IonSelectOption, IonTextarea, IonSpinner, IonText],
})
export class DetallePage implements OnInit {
  private route = inject(ActivatedRoute);
  private servicio = inject(IncidenciasService);
  private seguimiento = inject(SeguimientoService);
  private toast = inject(ToastController);

  inc = signal<Incidencia | null>(null);
  cargando = signal(true);
  error = signal('');
  guardando = signal(false);

  nuevoEstado: Estado | '' = '';
  observacion = '';

  textoEstado = textoEstado;
  colorEstado = colorEstado;

  // reglas de transición
  readonly transiciones: Record<Estado, Estado[]> = {
    pendiente: ['en_proceso', 'resuelta'],
    en_proceso: ['resuelta'],
    resuelta: [],   // una resuelta no puede volver atrás
  };

  opciones = computed(() => {
    const i = this.inc();
    return i ? this.transiciones[i.estado] : [];
  });

  marcada = computed(() => {
    const i = this.inc();
    return !!i && this.seguimiento.codigos().includes(i.codigo);
  });

  constructor() { addIcons({ bookmark, bookmarkOutline }); }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.servicio.obtener(id).subscribe({
      next: d => { this.inc.set(d); this.cargando.set(false); },
      error: () => { this.error.set('No se pudo cargar la incidencia.'); this.cargando.set(false); }
    });
  }

  async alternarSeguimiento() {
    const i = this.inc();
    if (i) await this.seguimiento.alternar(i.codigo);
  }

  guardarEstado() {
    const i = this.inc();
    const destino = this.nuevoEstado;
    if (!i || !destino) return;

    if (!this.transiciones[i.estado].includes(destino)) {
      this.mostrar('Transición no permitida.', 'danger');
      return;
    }
    if (destino === 'resuelta' && !this.observacion.trim()) {
      this.mostrar('Para marcar como resuelta debe ingresar una observación.', 'warning');
      return;
    }

    this.guardando.set(true);
    const datos: Partial<Incidencia> = { estado: destino };
    if (this.observacion.trim()) datos.observacion = this.observacion.trim();

    this.servicio.actualizar(i.id!, datos).subscribe({
      next: act => {
        this.inc.set(act);
        this.nuevoEstado = '';
        this.observacion = '';
        this.guardando.set(false);
        this.servicio.cambios.next();          // el listado se recarga
        this.mostrar('Estado actualizado en el servicio.', 'success');
      },
      error: () => {
        this.guardando.set(false);
        this.mostrar('No se pudo actualizar. Intente de nuevo.', 'danger');
      }
    });
  }

  private async mostrar(message: string, color: string) {
    const t = await this.toast.create({ message, color, duration: 2500, position: 'top' });
    await t.present();
  }
}