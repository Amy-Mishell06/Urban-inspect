import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FotosService {
  async subir(dataUrl: string): Promise<string> {
    const fd = new FormData();
    fd.append('file', dataUrl);
    fd.append('upload_preset', environment.cloudinaryPreset);
    const r = await fetch(`https://api.cloudinary.com/v1_1/${environment.cloudinaryCloud}/image/upload`,
      { method: 'POST', body: fd });
    if (!r.ok) throw new Error('No se pudo subir la foto');
    const json = await r.json();
    return json.secure_url; 
  }
}