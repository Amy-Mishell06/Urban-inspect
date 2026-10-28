// seed.js — carga 30 incidencias de prueba en MockAPI
const URL = 'https://6ae170e4be3bc8fead987f0a.mockapi.io/incidencias';

const tipos = ['luminaria', 'bache', 'senalizacion', 'alcantarilla', 'parque'];
const estados = ['pendiente', 'en_proceso', 'resuelta'];
const prioridades = ['baja', 'media', 'alta'];
const sectores = ['La Carolina', 'Centro Histórico', 'Quitumbe', 'Cumbayá', 'La Mariscal', 'Carcelén'];

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  for (let i = 1; i <= 30; i++) {
    const estado = estados[i % 3];
    const inc = {
      codigo: 'INC-' + String(i).padStart(3, '0'),
      tipo: tipos[i % 5],
      descripcion: 'Incidencia de prueba número ' + i,
      direccion: 'Av. Ejemplo N' + i + '-' + (i * 3),
      sector: sectores[i % 6],
      fecha: new Date(2026, 9, (i % 27) + 1).toISOString(),
      estado,
      prioridad: prioridades[i % 3],
      fotoUrl: i % 2 === 0 ? `https://picsum.photos/seed/inc${i}/400/300` : '',
      latitud: -0.18 - i * 0.002,
      longitud: -78.48 + i * 0.002,
      observacion: estado === 'resuelta' ? 'Reparado por cuadrilla municipal' : ''
    };
    const r = await fetch(URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inc)
    });
    console.log(i, r.status);
    await esperar(300); 
  }
}
main();