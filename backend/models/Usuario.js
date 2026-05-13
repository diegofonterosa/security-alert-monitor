const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UsuarioSchema = new mongoose.Schema(
  {
        username: {
                type: String,
                required: true,
                unique: true,
                trim: true,
                minlength: 3,
                maxlength: 50,
        },
        email: {
                type: String,
                required: true,
                unique: true,
                trim: true,
                lowercase: true,
                validate: {
                    validator: (value) => {
                        if (typeof value !== 'string') return false;
                        const parts = value.split('@');
                        if (parts.length !== 2) return false;
                        const [local, domain] = parts;
                        if (!local || !domain) return false;
                        if (local.includes(' ') || domain.includes(' ')) return false;
                        if (!domain.includes('.')) return false;
                        const domainParts = domain.split('.');
                        return domainParts.every(part => part.length > 0);
                    },
                    message: 'Email no valido',
                },
        },
        password: {
                type: String,
                required: true,
                minlength: 6,
        },
        role: {
                type: String,
                enum: ['user', 'admin'],
          default: 'user',
        },
        // createdAt y updatedAt los gestiona automaticamente timestamps: true
  },
  {
        timestamps: true,
  }
  );

// Hash password antes de guardar
// Reestructurado con condicion afirmativa para evitar code smell de SonarQube (L43)
UsuarioSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
          try {
                  const salt = await bcrypt.genSalt(10);
                  this.password = await bcrypt.hash(this.password, salt);
          } catch (error) {
                  return next(error);
          }
    }
    next();
});

// Metodo para comparar password
UsuarioSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Usuario', UsuarioSchema);
