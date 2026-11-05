import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonItem, IonInput, IonInputPasswordToggle, IonButton, IonIcon, IonSpinner,
  ToastController
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { location, mail, lockClosed, alertCircle } from 'ionicons/icons';
import { AuthService, mensajeError } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: 'login.page.html',
  styleUrls: ['login.page.scss'],
  standalone: true,
  imports: [FormsModule, IonContent, IonItem, IonInput, IonInputPasswordToggle, IonButton,
    IonIcon, IonSpinner],
})
export class LoginPage {
  private auth = inject(AuthService);
  private router = inject(Router);
  private toastCtrl = inject(ToastController);

  email = signal('');
  clave = signal('');
  cargando = signal(false);
  error = signal('');

  constructor() { addIcons({ location, mail, lockClosed, alertCircle }); }

  async ingresar() {
    this.error.set('');
    if (!this.email().trim() || !this.clave()) {
      this.error.set('Ingrese su correo y contraseña.');
      return;
    }
    this.cargando.set(true);
    try {
      await this.auth.ingresar(this.email(), this.clave());
      this.clave.set('');
      this.router.navigateByUrl('/tabs/tab1', { replaceUrl: true }); // replaceUrl: "atrás" no vuelve al login
    } catch (e) {
      this.error.set(mensajeError(e));
    } finally {
      this.cargando.set(false);
    }
  }

  async recuperar() {
    this.error.set('');
    if (!this.email().trim()) {
      this.error.set('Escriba su correo arriba y vuelva a tocar "¿Olvidó su contraseña?".');
      return;
    }
    try {
      await this.auth.recuperar(this.email());
      const t = await this.toastCtrl.create({
        message: 'Si el correo está registrado, recibirá un enlace para cambiar su contraseña.',
        color: 'success', duration: 4000, position: 'top',
      });
      await t.present();
    } catch (e) {
      this.error.set(mensajeError(e));
    }
  }
}