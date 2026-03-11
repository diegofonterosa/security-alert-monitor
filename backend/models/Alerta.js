const mongoose = require('mongoose');

const AlertaSchema = new mongoose.Schema(
  {
    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
    },
    tipo: {
      type: String,
      required: true,
      enum: [
        'Acceso no autorizado',
        'Fuerza bruta',
        'Malware detectado',
        'Exfiltración de datos',
        'Escaneo de puertos',
        'Escalada de privilegios',
        'DoS/DDoS',
        'Phishing',
        'Movimiento lateral',
        'Anomalía de red',
      ],
    },
    severidad: {
      type: String,
      required: true,
      enum: ['Baja', 'Media', 'Alta', 'Crítica'],
    },
    origen_ip: {
      type: String,
      required: true,
      match: [
        /^(\d{1,3}\.){3}\d{1,3}$/,
        'Formato de IP no válido',
      ],
    },
    dispositivo: {
      type: String,
      required: true,
      trim: true,
    },
    descripcion: {
      type: String,
      required: true,
      trim: true,
    },
    estado: {
      type: String,
      required: true,
      enum: ['Nueva', 'En revisión', 'Resuelta', 'Falso positivo'],
      default: 'Nueva',
    },
    operador: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: false, // usamos nuestro propio campo timestamp
    versionKey: false,
  }
);

// Índices para consultas frecuentes
AlertaSchema.index({ severidad: 1 });
AlertaSchema.index({ estado: 1 });
AlertaSchema.index({ timestamp: -1 });
AlertaSchema.index({ origen_ip: 1 });

module.exports = mongoose.model('Alerta', AlertaSchema);