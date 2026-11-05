import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonApp, IonRouterOutlet, AlertController } from '@ionic/angular';
import { BorradorService } from './services/borrador.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {
  private borrador = inject(BorradorService);
  private alertCtrl = inject(AlertController);
  private router = inject(Router);
  private auth = inject(AuthService);

  async ngOnInit() {
    await this.auth.esperar();
    if (!this.auth.autenticado()) return;   
    if (window.location.pathname.startsWith('/nueva')) return; 
    const b = await this.borrador.obtener();
    if (!b) return;
    const a = await this.alertCtrl.create({
      header: 'Registro incompleto',
      message: 'Quedó un registro sin terminar. ¿Desea continuarlo?',
      backdropDismiss: false,
      buttons: [
        { text: 'Descartar', role: 'cancel', handler: () => { this.borrador.borrar(); } },
        { text: 'Continuar', handler: () => { this.router.navigate(['/nueva'], { queryParams: { restaurar: 1 } }); } },
      ],
    });
    await a.present();
  }
}