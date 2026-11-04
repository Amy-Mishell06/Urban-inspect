import { Pipe, PipeTransform } from '@angular/core';

// Uso: {{ url | cloudinary:'w_600,h_320,c_fill' }}
@Pipe({ name: 'cloudinary', standalone: true })
export class CloudinaryPipe implements PipeTransform {
  transform(url: string | undefined | null, transformacion: string): string {
    if (!url || !url.includes('res.cloudinary.com') || !url.includes('/image/upload/')) {
      return url ?? '';                               // no es de Cloudinary (ej. vista previa base64)
    }
    const [base, resto] = url.split('/image/upload/');
    const i = resto.search(/v\d+\//);                 
    const limpio = i >= 0 ? resto.slice(i) : resto;  
    return `${base}/image/upload/${transformacion},q_auto:good,f_auto/${limpio}`;
  }
}