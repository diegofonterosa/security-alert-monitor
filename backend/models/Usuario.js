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
                match: [/^\S+@\S+\.\S+$/, 'Email no valido'],
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
        timestamps: true, // genera createdAt y updatedAt automaticamente
  }
  );

// Hash password antes de guardar
UsuarioSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

                    try {
                          const salt = await bcrypt.genSalt(10);
                          this.password = await bcrypt.hash(this.password, salt);
                          next();
                    } catch (error) {
                          next(error);
                    }
});

// Metodo para comparar password
UsuarioSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Usuario', UsuarioSchema);
