import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonApp, IonRouterOutlet, AlertController } from '@ionic/angular';
import { BorradorService } from './services/borrador.service';

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

  async ngOnInit() {
    if (window.location.pathname.startsWith('/nueva')) return; // el formulario ya pregunta
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