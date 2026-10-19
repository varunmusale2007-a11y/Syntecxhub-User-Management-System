const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { getDbMode } = require('../config/db');
const { LocalUserModel } = require('../data/localStore');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [emailRegex, 'Please provide a valid email address'],
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false, // Do not return password by default in queries
    },
    role: {
      type: String,
      enum: {
        values: ['admin', 'manager', 'user'],
        message: 'Role must be either admin, manager, or user',
      },
      default: 'user',
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'inactive', 'pending', 'suspended'],
        message: 'Status must be active, inactive, pending, or suspended',
      },
      default: 'active',
    },
    department: {
      type: String,
      trim: true,
      default: 'General',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    avatar: {
      type: String,
      default: '',
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook: Hash password with bcrypt if modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

    if (!this.avatar) {
      const encodedName = encodeURIComponent(this.name);
      this.avatar = `https://ui-avatars.com/api/?name=${encodedName}&background=4f46e5&color=fff&size=128&bold=true`;
    }

    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.__v;
  return userObject;
};

// Mongoose model registration
const MongooseUser = mongoose.model('User', userSchema);

// Dynamically select model based on connection state
const getActiveModel = () => {
  return getDbMode() === 'mongodb' ? MongooseUser : LocalUserModel;
};

// Export unified Model Proxy
const User = new Proxy(
  function (data) {
    const Model = getActiveModel();
    return new Model(data);
  },
  {
    get(target, prop) {
      const Model = getActiveModel();
      const val = Model[prop];
      if (typeof val === 'function') {
        return val.bind(Model);
      }
      return val;
    },
  }
);

module.exports = User;
