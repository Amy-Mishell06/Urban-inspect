import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonButton, IonIcon,
  IonList, IonItem, IonInput, IonTextarea, IonSelect, IonSelectOption, IonCard, IonCardHeader,
  IonCardTitle, IonCardContent, IonSpinner, IonText, AlertController, ToastController
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { camera, locate, trash, cloud } from 'ionicons/icons';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { IncidenciasService } from '../../services/incidencias.service';
import { ClimaService, Clima } from '../../services/clima.service';
import { FotosService } from '../../services/fotos.service';
import { BorradorService, Borrador } from '../../services/borrador.service';
import { Incidencia, Prioridad, TIPOS } from '../../models/incidencia.model';

function aNumero(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}

@Component({
  selector: 'app-nueva',
  templateUrl: 'nueva.page.html',
  standalone: true,
  imports: [FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton,
    IonButton, IonIcon, IonList, IonItem, IonInput, IonTextarea, IonSelect, IonSelectOption,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonSpinner, IonText],
})
export class NuevaPage implements OnInit {
  private servicio = inject(IncidenciasService);
  private climaSrv = inject(ClimaService);
  private fotos = inject(FotosService);
  private borrador = inject(BorradorService);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  tipos = TIPOS;

  tipo = signal('');
  descripcion = signal('');
  direccion = signal('');
  sector = signal('');
  prioridad = signal<Prioridad | ''>('');
  foto = signal<string | null>(null);
  latitud = signal<any>(null);
  longitud = signal<any>(null);

  gpsMensaje = signal('');
  climaEstado = signal<'idle' | 'cargando' | 'ok' | 'error'>('idle');
  climaDatos = signal<Clima | null>(null);
  climaMensaje = signal('');
  errores = signal<string[]>([]);
  guardando = signal(false);

  private climaCoords = '';   // coordenadas del último clima consultado
  private climaPeticion = 0;  // para ignorar respuestas viejas

  latNum = computed(() => aNumero(this.latitud()));
  lonNum = computed(() => aNumero(this.longitud()));
  coordsValidas = computed(() => {
    const la = this.latNum(), lo = this.lonNum();
    return la !== null && lo !== null && !isNaN(la) && !isNaN(lo)
      && la >= -90 && la <= 90 && lo >= -180 && lo <= 180;
  });
  lluviaFuerte = computed(() => (this.climaDatos()?.precipitacion ?? 0) > 5);

  constructor() { addIcons({ camera, locate, trash, cloud }); }

 //borrador
  async ngOnInit() {
    const b = await this.borrador.obtener();
    if (!b) return;
    if (this.route.snapshot.queryParamMap.get('restaurar')) { this.aplicar(b); return; }
    const a = await this.alertCtrl.create({
      header: 'Registro incompleto',
      message: 'Hay un registro sin terminar. ¿Desea continuarlo?',
      backdropDismiss: false,
      buttons: [
        { text: 'Descartar', role: 'cancel', handler: () => { this.borrador.borrar(); } },
        { text: 'Continuar', handler: () => { this.aplicar(b); } },
      ],
    });
    await a.present();
  }

  private aplicar(b: Borrador) {
    this.tipo.set(b.tipo ?? '');
    this.descripcion.set(b.descripcion ?? '');
    this.direccion.set(b.direccion ?? '');
    this.sector.set(b.sector ?? '');
    this.prioridad.set((b.prioridad as Prioridad) ?? '');
    this.foto.set(b.foto ?? null);
    this.latitud.set(b.latitud ?? null);
    this.longitud.set(b.longitud ?? null);
    if (this.coordsValidas()) this.consultarClima();
  }

  guardarBorrador() {
    const b: Borrador = {
      tipo: this.tipo(), descripcion: this.descripcion(), direccion: this.direccion(),
      sector: this.sector(), prioridad: this.prioridad(), foto: this.foto(),
      latitud: this.latitud(), longitud: this.longitud(),
    };
    const vacio = !b.tipo && !b.descripcion && !b.direccion && !b.sector && !b.prioridad && !b.foto
      && b.latitud == null && b.longitud == null;
    vacio ? this.borrador.borrar() : this.borrador.guardar(b);
  }

  //foto
  async tomarFoto() {
    try {
      const p = await Camera.requestPermissions({ permissions: ['camera'] });
      if (p.camera === 'denied') { await this.avisoCamaraDenegada(); return; }
    } catch { /* en el navegador no existe este permiso */ }

    try {
      const img = await Camera.getPhoto({
        quality: 60, width: 1024, resultType: CameraResultType.DataUrl, source: CameraSource.Camera,
      });
      this.foto.set(img.dataUrl ?? null);   // vista previa
      this.guardarBorrador();
    } catch (e: any) {
      const msg = String(e?.message ?? '').toLowerCase();
      if (msg.includes('cancel')) this.toast('Captura cancelada. Sus datos se conservan.', 'medium');
      else if (msg.includes('permission') || msg.includes('denied')) await this.avisoCamaraDenegada();
      else this.toast('No se pudo tomar la fotografía.', 'danger');
    }
  }

  quitarFoto() { this.foto.set(null); this.guardarBorrador(); }

  private async avisoCamaraDenegada() {
    const msg = this.prioridad() === 'alta'
      ? 'Sin permiso de cámara no puede adjuntar la fotografía, que es OBLIGATORIA para prioridad alta. No se podrá guardar hasta que active el permiso en Ajustes o cambie la prioridad.'
      : 'Permiso de cámara denegado. La fotografía es opcional para esta prioridad.';
    const a = await this.alertCtrl.create({ header: 'Permiso de cámara', message: msg, buttons: ['Entendido'] });
    await a.present();
  }

  //ubicacion
  async obtenerUbicacion() {
    this.gpsMensaje.set('Obteniendo ubicación...');
    let denegado = false;
    try { denegado = (await Geolocation.requestPermissions()).location === 'denied'; } catch { }
    if (denegado) {
      this.gpsMensaje.set('Permiso de ubicación denegado. Ingrese las coordenadas manualmente.');
      return;
    }
    try {
      const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 15000 });
      this.latitud.set(+pos.coords.latitude.toFixed(6));
      this.longitud.set(+pos.coords.longitude.toFixed(6));
      this.gpsMensaje.set('Ubicación obtenida por GPS.');
      this.coordsCambiaron();
    } catch {
      this.gpsMensaje.set('No se pudo acceder al GPS. Ingrese las coordenadas manualmente.');
    }
  }

  coordsCambiaron() {
    this.guardarBorrador();
    if (this.coordsValidas()) {
      if (`${this.latNum()},${this.lonNum()}` !== this.climaCoords) this.consultarClima();
    } else {
      this.climaPeticion++;         // invalida consultas en curso
      this.climaEstado.set('idle');
      this.climaDatos.set(null);
      this.climaCoords = '';
    }
  }

  //clima
  async consultarClima() {
    if (!this.coordsValidas()) {
      this.climaEstado.set('error');
      this.climaMensaje.set('Ingrese coordenadas válidas para consultar el clima.');
      return;
    }
    const lat = this.latNum()!, lon = this.lonNum()!;
    const n = ++this.climaPeticion;
    this.climaEstado.set('cargando');
    this.climaDatos.set(null);
    try {
      const d = await this.climaSrv.consultar(lat, lon);
      if (n !== this.climaPeticion) return;          // llegó tarde, se ignora
      this.climaDatos.set(d);
      this.climaEstado.set('ok');
    } catch {
      if (n !== this.climaPeticion) return;
      this.climaEstado.set('error');
      this.climaMensaje.set('El servicio meteorológico no respondió o no dispone de información. Puede continuar con el registro.');
    }
    this.climaCoords = `${lat},${lon}`;
  }

  // validar y guardar
  private validar(): string[] {
    const e: string[] = [];
    if (!this.tipo()) e.push('Seleccione el tipo.');
    if (this.descripcion().trim().length < 5) e.push('Ingrese una descripción (mínimo 5 caracteres).');
    if (!this.direccion().trim()) e.push('Ingrese la dirección.');
    if (!this.sector().trim()) e.push('Ingrese el sector.');
    if (!this.prioridad()) e.push('Seleccione la prioridad.');
    if (this.prioridad() === 'alta' && !this.foto()) e.push('La prioridad ALTA exige una fotografía.');
    const algunaCoord = this.latNum() !== null || this.lonNum() !== null;
    if (this.tipo() === 'bache' && !this.coordsValidas())
      e.push('Para un bache la ubicación es obligatoria: use el GPS o ingrese coordenadas válidas.');
    else if (algunaCoord && !this.coordsValidas())
      e.push('Las coordenadas no son válidas (latitud -90 a 90, longitud -180 a 180).');
    return e;
  }

  async guardar() {
    this.errores.set(this.validar());
    if (this.errores().length) { this.toast('Revise los datos indicados.', 'warning'); return; }

    this.guardando.set(true);
    try {
      // consultar el clima antes de guardar 
      if (this.coordsValidas() && `${this.latNum()},${this.lonNum()}` !== this.climaCoords) {
        await this.consultarClima();
      }
      if (this.lluviaFuerte()) {
        await this.toast('⚠️ Lluvia mayor a 5 mm en la última hora: podría dificultar el mantenimiento.', 'warning');
      }

      const fotoUrl = this.foto() ? await this.fotos.subir(this.foto()!) : '';
      const nueva: Incidencia = {
        codigo: 'INC-' + Date.now().toString().slice(-6),
        tipo: this.tipo(),
        descripcion: this.descripcion().trim(),
        direccion: this.direccion().trim(),
        sector: this.sector().trim(),
        fecha: new Date().toISOString(),
        estado: 'pendiente',
        prioridad: this.prioridad() as Prioridad,
        fotoUrl,
        latitud: this.coordsValidas() ? this.latNum() : null,
        longitud: this.coordsValidas() ? this.lonNum() : null,
        observacion: '',
      };
      await firstValueFrom(this.servicio.crear(nueva));
      await this.borrador.borrar();
      this.servicio.cambios.next();
      this.toast('Incidencia registrada correctamente.', 'success');
      this.router.navigateByUrl('/tabs/tab2');
    } catch {
      this.toast('No se pudo guardar. Revise su conexión. Sus datos se conservan.', 'danger');
    } finally {
      this.guardando.set(false);
    }
  }

  private async toast(message: string, color: string) {
    const t = await this.toastCtrl.create({ message, color, duration: 3000, position: 'top' });
    await t.present();
  }
}