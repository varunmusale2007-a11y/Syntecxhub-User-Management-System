const User = require('../models/User');

/**
 * @desc    Get all users with search, filtering, sorting, and pagination
 * @route   GET /api/users
 * @access  Private (Admin, Manager)
 */
const getUsers = async (req, res, next) => {
  try {
    const {
      search,
      role,
      status,
      department,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 10,
    } = req.query;

    // Build filter query
    const query = {};

    // Search by name or email (case-insensitive regex)
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: searchRegex }, { email: searchRegex }, { phone: searchRegex }];
    }

    // Role filter
    if (role && role !== 'all') {
      query.role = role.toLowerCase();
    }

    // Status filter
    if (status && status !== 'all') {
      query.status = status.toLowerCase();
    }

    // Department filter
    if (department && department !== 'all') {
      query.department = department;
    }

    // Pagination calculations
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    const sortOptions = {};
    const sortField = ['name', 'email', 'role', 'status', 'createdAt', 'lastLogin'].includes(sortBy)
      ? sortBy
      : 'createdAt';
    sortOptions[sortField] = order === 'asc' ? 1 : -1;

    // Execute query with pagination and total count in parallel
    const [totalUsers, users] = await Promise.all([
      User.countDocuments(query),
      User.find(query).sort(sortOptions).skip(skip).limit(limitNum),
    ]);

    const totalPages = Math.ceil(totalUsers / limitNum) || 1;

    res.status(200).json({
      success: true,
      count: users.length,
      totalUsers,
      totalPages,
      currentPage: pageNum,
      limit: limitNum,
      users,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get dashboard analytics & statistics
 * @route   GET /api/users/stats
 * @access  Private (Admin, Manager)
 */
const getUserStats = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      pendingUsers,
      suspendedUsers,
      adminCount,
      managerCount,
      userCount,
      newUsersThisMonth,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: 'active' }),
      User.countDocuments({ status: 'inactive' }),
      User.countDocuments({ status: 'pending' }),
      User.countDocuments({ status: 'suspended' }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ role: 'manager' }),
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ createdAt: { $gte: startOfMonth } }),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        pendingUsers,
        suspendedUsers,
        adminCount,
        managerCount,
        userCount,
        newUsersThisMonth,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single user details by ID
 * @route   GET /api/users/:id
 * @access  Private (Admin, Manager)
 */
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User with ID ${req.params.id} not found.`,
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new user (Admin)
 * @route   POST /api/users
 * @access  Private (Admin)
 */
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, status, department, phone, avatar } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    // Check duplicate email
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists.',
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: role || 'user',
      status: status || 'active',
      department: department || 'General',
      phone: phone || '',
      avatar: avatar || '',
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully!',
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user details (Admin)
 * @route   PUT /api/users/:id
 * @access  Private (Admin)
 */
const updateUser = async (req, res, next) => {
  try {
    const { name, email, role, status, department, phone, avatar, password } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User with ID ${req.params.id} not found.`,
      });
    }

    // If changing email, ensure it's not already used by another user
    if (email && email.toLowerCase().trim() !== user.email) {
      const emailExists = await User.findOne({
        email: email.toLowerCase().trim(),
        _id: { $ne: req.params.id },
      });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'This email is already in use by another account.',
        });
      }
      user.email = email.toLowerCase().trim();
    }

    // Safeguard: Do not allow current user to demote or suspend their own admin account
    if (req.user.id === req.params.id) {
      if (role && role !== 'admin') {
        return res.status(400).json({
          success: false,
          message: 'You cannot remove your own admin privileges.',
        });
      }
      if (status && status !== 'active') {
        return res.status(400).json({
          success: false,
          message: 'You cannot deactivate or suspend your own account.',
        });
      }
    }

    if (name) user.name = name.trim();
    if (role) user.role = role;
    if (status) user.status = status;
    if (department !== undefined) user.department = department.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (avatar !== undefined) user.avatar = avatar.trim();

    // If admin provides a new password for the user
    if (password && password.trim() !== '') {
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long.',
        });
      }
      user.password = password; // Will be hashed by pre-save hook
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User updated successfully!',
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete user (Admin)
 * @route   DELETE /api/users/:id
 * @access  Private (Admin)
 */
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User with ID ${req.params.id} not found.`,
      });
    }

    // Prevent admin from deleting themselves
    if (req.user.id === req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'Security protection: You cannot delete your own admin account.',
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: `User '${user.name}' has been successfully deleted.`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserStats,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
