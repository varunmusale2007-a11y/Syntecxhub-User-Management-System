const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname);
const DATA_FILE = path.join(DATA_DIR, 'users.json');

// Default initial seed users with pre-hashed passwords
const DEFAULT_USERS = [
  {
    _id: '671401000000000000000001',
    name: 'Sarah Connor',
    email: 'admin@userhub.com',
    password: '$2a$10$Qmiz7smsKARX5asQo9A.y.qE1SVbcOGr4SeBstfLyI3/ray26YOty', // Admin@123456
    role: 'admin',
    status: 'active',
    department: 'Executive',
    phone: '+1 (555) 019-2834',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    lastLogin: new Date().toISOString(),
    createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '671401000000000000000002',
    name: 'Marcus Vance',
    email: 'manager@userhub.com',
    password: '$2a$10$6RaBRvO1dArxIx8n1ID4i.pV10bcX09SUVzuaklehgypgf1lWdN3a', // Manager@123456
    role: 'manager',
    status: 'active',
    department: 'Engineering',
    phone: '+1 (555) 304-9812',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    lastLogin: new Date().toISOString(),
    createdAt: new Date(Date.now() - 25 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '671401000000000000000003',
    name: 'Elena Rostova',
    email: 'elena.rostova@userhub.com',
    password: '$2a$10$kdiqoQH0ljHEYsjkXBHHkORWZ3w0Ul/ZnXATnqTfdZMLMnoGRdOua', // User@123456
    role: 'user',
    status: 'active',
    department: 'Product Design',
    phone: '+1 (555) 492-1049',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    lastLogin: null,
    createdAt: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '671401000000000000000004',
    name: 'David Chen',
    email: 'david.chen@userhub.com',
    password: '$2a$10$kdiqoQH0ljHEYsjkXBHHkORWZ3w0Ul/ZnXATnqTfdZMLMnoGRdOua', // User@123456
    role: 'user',
    status: 'active',
    department: 'Engineering',
    phone: '+1 (555) 837-2910',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    lastLogin: null,
    createdAt: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '671401000000000000000005',
    name: 'Amara Okafor',
    email: 'amara.okafor@userhub.com',
    password: '$2a$10$kdiqoQH0ljHEYsjkXBHHkORWZ3w0Ul/ZnXATnqTfdZMLMnoGRdOua', // User@123456
    role: 'user',
    status: 'active',
    department: 'Marketing',
    phone: '+1 (555) 918-2736',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    lastLogin: null,
    createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '671401000000000000000006',
    name: 'Liam Gallagher',
    email: 'liam.g@userhub.com',
    password: '$2a$10$kdiqoQH0ljHEYsjkXBHHkORWZ3w0Ul/ZnXATnqTfdZMLMnoGRdOua', // User@123456
    role: 'user',
    status: 'pending',
    department: 'Customer Support',
    phone: '+1 (555) 674-8291',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    lastLogin: null,
    createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '671401000000000000000007',
    name: 'Sophia Martinez',
    email: 'sophia.m@userhub.com',
    password: '$2a$10$kdiqoQH0ljHEYsjkXBHHkORWZ3w0Ul/ZnXATnqTfdZMLMnoGRdOua', // User@123456
    role: 'user',
    status: 'inactive',
    department: 'Human Resources',
    phone: '+1 (555) 438-9201',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    lastLogin: null,
    createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '671401000000000000000008',
    name: 'Kenji Takahashi',
    email: 'kenji.t@userhub.com',
    password: '$2a$10$kdiqoQH0ljHEYsjkXBHHkORWZ3w0Ul/ZnXATnqTfdZMLMnoGRdOua', // User@123456
    role: 'user',
    status: 'suspended',
    department: 'Finance',
    phone: '+1 (555) 238-5920',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    lastLogin: null,
    createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Helper: Ensure directory exists
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Helper: Read users array from disk
function readUsers() {
  ensureDataDir();
  if (!fs.existsSync(DATA_FILE)) {
    writeUsers(DEFAULT_USERS);
    return JSON.parse(JSON.stringify(DEFAULT_USERS));
  }
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    return JSON.parse(JSON.stringify(DEFAULT_USERS));
  }
}

// Helper: Write users array to disk
function writeUsers(users) {
  ensureDataDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2), 'utf8');
}

// Generate MongoDB-like 24-character hexadecimal ObjectId string
function generateId() {
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  const random = Array.from({ length: 16 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
  return (timestamp + random).toLowerCase();
}

/**
 * Wrap a raw user object with Mongoose-compatible instance methods
 */
function wrapUser(rawUser, includePassword = false) {
  if (!rawUser) return null;

  const clone = { ...rawUser };
  const userDoc = {
    ...clone,
    id: clone._id,
    matchPassword: async function (enteredPassword) {
      if (!this.password) return false;
      return await bcrypt.compare(enteredPassword, this.password);
    },
    toJSON: function () {
      const copy = { ...this };
      delete copy.password;
      delete copy.__v;
      return copy;
    },
    save: async function () {
      const users = readUsers();
      const idx = users.findIndex((u) => u._id === this._id);

      // If password was updated with plain text, hash it
      if (this.password && !this.password.startsWith('$2a$') && !this.password.startsWith('$2b$')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
      }

      this.updatedAt = new Date().toISOString();

      const toSave = {
        _id: this._id,
        name: this.name,
        email: this.email,
        password: this.password,
        role: this.role,
        status: this.status,
        department: this.department,
        phone: this.phone,
        avatar: this.avatar,
        lastLogin: this.lastLogin,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
      };

      if (idx !== -1) {
        users[idx] = toSave;
      } else {
        users.push(toSave);
      }

      writeUsers(users);
      return this;
    },
  };

  if (!includePassword) {
    delete userDoc.password;
  }

  return userDoc;
}

/**
 * Filter users based on query parameters matching Mongoose style
 */
function filterUsers(users, query = {}) {
  return users.filter((u) => {
    // Check ID match
    if (query._id) {
      if (typeof query._id === 'object' && query._id.$ne) {
        if (u._id === query._id.$ne) return false;
      } else if (u._id !== query._id) {
        return false;
      }
    }

    // Check email match
    if (query.email) {
      if (u.email.toLowerCase() !== String(query.email).toLowerCase()) {
        return false;
      }
    }

    // Check role match
    if (query.role && query.role !== 'all') {
      if (u.role.toLowerCase() !== query.role.toLowerCase()) return false;
    }

    // Check status match
    if (query.status && query.status !== 'all') {
      if (u.status.toLowerCase() !== query.status.toLowerCase()) return false;
    }

    // Check department match
    if (query.department && query.department !== 'all') {
      if (u.department !== query.department) return false;
    }

    // Check $or (used for search across name, email, phone)
    if (query.$or && Array.isArray(query.$or)) {
      const orMatched = query.$or.some((condition) => {
        if (condition.name && condition.name instanceof RegExp) {
          return condition.name.test(u.name);
        }
        if (condition.email && condition.email instanceof RegExp) {
          return condition.email.test(u.email);
        }
        if (condition.phone && condition.phone instanceof RegExp) {
          return condition.phone.test(u.phone || '');
        }
        return false;
      });
      if (!orMatched) return false;
    }

    // Check createdAt date range ($gte)
    if (query.createdAt && query.createdAt.$gte) {
      const userDate = new Date(u.createdAt);
      const minDate = new Date(query.createdAt.$gte);
      if (userDate < minDate) return false;
    }

    return true;
  });
}

/**
 * Local User Model Adapter mimicking Mongoose interface
 */
const LocalUserModel = {
  find: function (query = {}) {
    const users = readUsers();
    let filtered = filterUsers(users, query);

    let sortOptions = { createdAt: -1 };
    let skipCount = 0;
    let limitCount = 100;

    const queryBuilder = {
      sort: function (options) {
        sortOptions = options;
        return queryBuilder;
      },
      skip: function (num) {
        skipCount = num;
        return queryBuilder;
      },
      limit: function (num) {
        limitCount = num;
        return queryBuilder;
      },
      then: function (resolve, reject) {
        try {
          // Sort
          const [sortField, sortDir] = Object.entries(sortOptions)[0] || ['createdAt', -1];
          filtered.sort((a, b) => {
            const valA = a[sortField] || '';
            const valB = b[sortField] || '';
            if (valA < valB) return sortDir === 1 ? -1 : 1;
            if (valA > valB) return sortDir === 1 ? 1 : -1;
            return 0;
          });

          // Slice pagination
          const paged = filtered.slice(skipCount, skipCount + limitCount);
          const wrapped = paged.map((u) => wrapUser(u, false));
          resolve(wrapped);
        } catch (err) {
          reject(err);
        }
      },
    };

    return queryBuilder;
  },

  findOne: function (query = {}) {
    let includePassword = false;

    const queryBuilder = {
      select: function (fields) {
        if (typeof fields === 'string' && fields.includes('+password')) {
          includePassword = true;
        }
        return queryBuilder;
      },
      then: function (resolve, reject) {
        try {
          const users = readUsers();
          const matched = filterUsers(users, query);
          if (matched.length === 0) {
            return resolve(null);
          }
          resolve(wrapUser(matched[0], includePassword));
        } catch (err) {
          reject(err);
        }
      },
    };

    return queryBuilder;
  },

  findById: function (id) {
    let includePassword = false;

    const queryBuilder = {
      select: function (fields) {
        if (typeof fields === 'string' && fields.includes('+password')) {
          includePassword = true;
        }
        return queryBuilder;
      },
      then: function (resolve, reject) {
        try {
          const users = readUsers();
          const user = users.find((u) => u._id === String(id));
          if (!user) {
            return resolve(null);
          }
          resolve(wrapUser(user, includePassword));
        } catch (err) {
          reject(err);
        }
      },
    };

    return queryBuilder;
  },

  countDocuments: async function (query = {}) {
    const users = readUsers();
    return filterUsers(users, query).length;
  },

  create: async function (userData) {
    const users = readUsers();

    // Check duplicate email
    const exists = users.find(
      (u) => u.email.toLowerCase() === userData.email.toLowerCase().trim()
    );
    if (exists) {
      const err = new Error('A user with this email address already exists.');
      err.code = 11000;
      err.keyValue = { email: userData.email };
      throw err;
    }

    // Hash password if plain text
    let hashedPassword = userData.password;
    if (!hashedPassword.startsWith('$2a$') && !hashedPassword.startsWith('$2b$')) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(userData.password, salt);
    }

    // Avatar
    const avatar =
      userData.avatar ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=4f46e5&color=fff&size=128&bold=true`;

    const newUser = {
      _id: generateId(),
      name: userData.name.trim(),
      email: userData.email.toLowerCase().trim(),
      password: hashedPassword,
      role: userData.role || 'user',
      status: userData.status || 'active',
      department: userData.department || 'General',
      phone: userData.phone || '',
      avatar,
      lastLogin: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    users.push(newUser);
    writeUsers(users);

    return wrapUser(newUser, false);
  },

  findByIdAndDelete: async function (id) {
    const users = readUsers();
    const idx = users.findIndex((u) => u._id === String(id));
    if (idx === -1) return null;

    const [deleted] = users.splice(idx, 1);
    writeUsers(users);
    return wrapUser(deleted, false);
  },

  deleteMany: async function () {
    writeUsers([]);
    return { acknowledged: true, deletedCount: 0 };
  },

  resetDefaults: function () {
    writeUsers(DEFAULT_USERS);
    return DEFAULT_USERS.length;
  },
};

module.exports = {
  LocalUserModel,
  readUsers,
  writeUsers,
};
