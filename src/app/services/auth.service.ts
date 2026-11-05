import { Injectable, signal, computed } from '@angular/core';
import { initializeApp } from 'firebase/app';
import {
  initializeAuth, indexedDBLocalPersistence, browserLocalPersistence, onAuthStateChanged,
  signInWithEmailAndPassword, sendPasswordResetEmail, signOut, User
} from 'firebase/auth';
import { environment } from '../../environments/environment';

const app = initializeApp(environment.firebase);
const auth = initializeAuth(app, {
  persistence: [indexedDBLocalPersistence, browserLocalPersistence],
});

@Injectable({ providedIn: 'root' })
export class AuthService {
  usuario = signal<User | null>(null);                        
  autenticado = computed(() => this.usuario() !== null);
  private listo: Promise<void>;

  constructor() {

    this.listo = new Promise(resolve => {
      onAuthStateChanged(auth, u => {
        this.usuario.set(u);
        resolve();
      });
    });
  }

  // El guard espera esto antes de decidir si deja pasar
  esperar() { return this.listo; }

  async ingresar(email: string, clave: string) {
    await signInWithEmailAndPassword(auth, email.trim(), clave);
  }

  recuperar(email: string) {
    return sendPasswordResetEmail(auth, email.trim());
  }

  salir() {
    return signOut(auth);
  }
}

export function mensajeError(e: any): string {
  const codigo = e?.code ?? '';
  switch (codigo) {
    case 'auth/invalid-email': return 'El correo no tiene un formato válido.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found': return 'Correo o contraseña incorrectos.';
    case 'auth/too-many-requests': return 'Demasiados intentos. Espere unos minutos e intente de nuevo.';
    case 'auth/network-request-failed': return 'Sin conexión. Revise su internet.';
    case 'auth/user-disabled': return 'Esta cuenta está deshabilitada.';
    default: return 'No se pudo completar la operación. Intente de nuevo.';
  }
}