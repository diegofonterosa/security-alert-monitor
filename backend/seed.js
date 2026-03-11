// seed.js — Poblar MongoDB con 20 alertas de ejemplo
// Uso: node backend/seed.js

require('dotenv').config();
const mongoose = require('mongoose');
const Alerta = require('./models/Alerta');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mini-siem';

// ── 20 alertas realistas ──────────────────────────────────────────────────────
const alertas = [
  {
    timestamp: new Date('2026-03-01T02:14:33Z'),
    tipo: 'Fuerza bruta',
    severidad: 'Alta',
    origen_ip: '185.220.101.45',
    dispositivo: 'fw-perimetral-01',
    descripcion: 'Se detectaron 847 intentos de login SSH fallidos en menos de 2 minutos desde IP rusa.',
    estado: 'Resuelta',
    operador: 'diego',
  },
  {
    timestamp: new Date('2026-03-01T08:45:10Z'),
    tipo: 'Malware detectado',
    severidad: 'Crítica',
    origen_ip: '192.168.1.55',
    dispositivo: 'workstation-contabilidad',
    descripcion: 'Antivirus detectó ransomware LockBit en proceso explorer.exe. Equipo aislado de la red.',
    estado: 'En revisión',
    operador: 'admin',
  },
  {
    timestamp: new Date('2026-03-01T11:22:05Z'),
    tipo: 'Escaneo de puertos',
    severidad: 'Media',
    origen_ip: '10.0.0.88',
    dispositivo: 'ids-core-switch',
    descripcion: 'Escaneo SYN sobre rango 192.168.1.0/24 desde host interno. Posible reconocimiento lateral.',
    estado: 'En revisión',
    operador: 'diego',
  },
  {
    timestamp: new Date('2026-03-01T14:05:47Z'),
    tipo: 'Acceso no autorizado',
    severidad: 'Alta',
    origen_ip: '203.0.113.77',
    dispositivo: 'vpn-gateway',
    descripcion: 'Intento de acceso VPN con credenciales de usuario dado de baja hace 3 meses.',
    estado: 'Resuelta',
    operador: 'admin',
  },
  {
    timestamp: new Date('2026-03-02T00:33:19Z'),
    tipo: 'Exfiltración de datos',
    severidad: 'Crítica',
    origen_ip: '192.168.1.102',
    dispositivo: 'servidor-bbdd-01',
    descripcion: 'Transferencia saliente inusual de 4.2 GB hacia IP externa en puerto 443. Fuera de horario laboral.',
    estado: 'En revisión',
    operador: 'diego',
  },
  {
    timestamp: new Date('2026-03-02T09:10:00Z'),
    tipo: 'Phishing',
    severidad: 'Media',
    origen_ip: '192.168.1.201',
    dispositivo: 'workstation-rrhh',
    descripcion: 'Usuario hizo clic en enlace de phishing. Se detectó petición a dominio malicioso conocido en Threat Intel.',
    estado: 'Resuelta',
    operador: 'admin',
  },
  {
    timestamp: new Date('2026-03-02T13:47:22Z'),
    tipo: 'Escalada de privilegios',
    severidad: 'Crítica',
    origen_ip: '192.168.1.55',
    dispositivo: 'workstation-contabilidad',
    descripcion: 'Proceso ejecutado como usuario estándar logró obtener token SYSTEM mediante técnica de token impersonation.',
    estado: 'En revisión',
    operador: 'diego',
  },
  {
    timestamp: new Date('2026-03-02T16:00:00Z'),
    tipo: 'Anomalía de red',
    severidad: 'Baja',
    origen_ip: '192.168.2.14',
    dispositivo: 'switch-planta-2',
    descripcion: 'Incremento del 300% en tráfico broadcast. Posible loop de red o mal funcionamiento de NIC.',
    estado: 'Falso positivo',
    operador: 'admin',
  },
  {
    timestamp: new Date('2026-03-03T03:22:11Z'),
    tipo: 'DoS/DDoS',
    severidad: 'Alta',
    origen_ip: '198.51.100.23',
    dispositivo: 'fw-perimetral-01',
    descripcion: 'Ataque DDoS UDP flood detectado. Tráfico entrante alcanzó 8 Gbps. Activado rate-limiting automático.',
    estado: 'Resuelta',
    operador: 'diego',
  },
  {
    timestamp: new Date('2026-03-03T10:05:55Z'),
    tipo: 'Movimiento lateral',
    severidad: 'Alta',
    origen_ip: '192.168.1.55',
    dispositivo: 'servidor-archivos-01',
    descripcion: 'Autenticación exitosa mediante Pass-the-Hash desde host comprometido hacia servidor de archivos.',
    estado: 'En revisión',
    operador: 'admin',
  },
  {
    timestamp: new Date('2026-03-03T12:30:00Z'),
    tipo: 'Fuerza bruta',
    severidad: 'Media',
    origen_ip: '91.108.4.100',
    dispositivo: 'webapp-public',
    descripcion: '320 intentos de login en formulario web en 5 minutos. IP bloqueada automáticamente por WAF.',
    estado: 'Resuelta',
    operador: null,
  },
  {
    timestamp: new Date('2026-03-04T07:15:00Z'),
    tipo: 'Acceso no autorizado',
    severidad: 'Baja',
    origen_ip: '192.168.1.88',
    dispositivo: 'servidor-impresion',
    descripcion: 'Acceso al panel de administración de impresora desde host no autorizado. Sin éxito.',
    estado: 'Falso positivo',
    operador: 'diego',
  },
  {
    timestamp: new Date('2026-03-04T15:44:03Z'),
    tipo: 'Malware detectado',
    severidad: 'Alta',
    origen_ip: '192.168.1.77',
    dispositivo: 'workstation-marketing',
    descripcion: 'Detección de keylogger en memoria. Proceso svchost.exe con comportamiento anómalo de escritura en registro.',
    estado: 'Nueva',
    operador: null,
  },
  {
    timestamp: new Date('2026-03-05T08:00:30Z'),
    tipo: 'Escaneo de puertos',
    severidad: 'Baja',
    origen_ip: '10.0.0.5',
    dispositivo: 'ids-core-switch',
    descripcion: 'Escaneo Nmap detectado desde host de administración en horario de mantenimiento programado.',
    estado: 'Falso positivo',
    operador: 'admin',
  },
  {
    timestamp: new Date('2026-03-05T18:22:47Z'),
    tipo: 'Exfiltración de datos',
    severidad: 'Alta',
    origen_ip: '192.168.1.120',
    dispositivo: 'workstation-it',
    descripcion: 'Copia masiva de archivos hacia USB externo. 12.000 archivos en 8 minutos. DLP generó alerta.',
    estado: 'En revisión',
    operador: 'diego',
  },
  {
    timestamp: new Date('2026-03-06T02:11:59Z'),
    tipo: 'Anomalía de red',
    severidad: 'Media',
    origen_ip: '192.168.3.200',
    dispositivo: 'router-sede-b',
    descripcion: 'Conexiones periódicas cada 60 segundos a IP C2 conocida. Patrón consistente con beacon de malware.',
    estado: 'Nueva',
    operador: null,
  },
  {
    timestamp: new Date('2026-03-06T09:58:12Z'),
    tipo: 'Phishing',
    severidad: 'Baja',
    origen_ip: '192.168.1.35',
    dispositivo: 'workstation-direccion',
    descripcion: 'Email con adjunto malicioso bloqueado por gateway de correo antes de llegar al destinatario.',
    estado: 'Resuelta',
    operador: 'admin',
  },
  {
    timestamp: new Date('2026-03-07T11:30:00Z'),
    tipo: 'Escalada de privilegios',
    severidad: 'Alta',
    origen_ip: '192.168.1.99',
    dispositivo: 'servidor-linux-dev',
    descripcion: 'Explotación de CVE-2023-4911 (glibc Looney Tunables). Usuario www-data escaló a root.',
    estado: 'Nueva',
    operador: null,
  },
  {
    timestamp: new Date('2026-03-08T20:05:40Z'),
    tipo: 'DoS/DDoS',
    severidad: 'Media',
    origen_ip: '172.16.0.50',
    dispositivo: 'servidor-web-01',
    descripcion: 'Slowloris attack detectado contra servidor web. 500 conexiones abiertas sin cerrar. Servicio degradado.',
    estado: 'Resuelta',
    operador: 'diego',
  },
  {
    timestamp: new Date('2026-03-09T08:44:00Z'),
    tipo: 'Movimiento lateral',
    severidad: 'Crítica',
    origen_ip: '192.168.1.102',
    dispositivo: 'controlador-dominio',
    descripcion: 'DCSync attack detectado. Host no autorizado solicitó replicación de hashes del controlador de dominio.',
    estado: 'Nueva',
    operador: null,
  },
];

// ── Conexión y seed ───────────────────────────────────────────────────────────
async function seed() {
  try {
    console.log('Conectando a MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log(`Conectado a: ${MONGO_URI}`);

    // Limpiar colección antes de insertar
    const eliminadas = await Alerta.deleteMany({});
    console.log(`Colección limpiada: ${eliminadas.deletedCount} documentos eliminados`);

    // Insertar las 20 alertas
    const insertadas = await Alerta.insertMany(alertas);
    console.log(`✔ ${insertadas.length} alertas insertadas correctamente`);

    // Resumen por severidad
    const resumen = await Alerta.aggregate([
      { $group: { _id: '$severidad', total: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    console.log('\nResumen por severidad:');
    resumen.forEach(r => console.log(`  ${r._id}: ${r.total}`));

  } catch (error) {
    console.error('Error durante el seed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\nDesconectado de MongoDB. Seed completado.');
  }
}

seed();