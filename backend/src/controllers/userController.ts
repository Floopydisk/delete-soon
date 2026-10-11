import { Request, Response } from 'express';
import User from '../models/User';

// @desc    Get all users
// @route   GET /api/users
// @access  Private/SuperAdmin
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({});
    res.status(200).json({
      status: 'success',
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Server Error',
    });
  }
};

// @desc    Create a user
// @route   POST /api/users
// @access  Private/SuperAdmin
export const createUser = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    // Basic validation
    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide email, password, first name, last name, and role',
      });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        status: 'fail',
        message: 'User already exists',
      });
    }

    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      role,
    });

    res.status(201).json({
      status: 'success',
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Server Error',
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/SuperAdmin
export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Server Error',
    });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/SuperAdmin
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { email, firstName, lastName, role } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found',
      });
    }

    user.email = email || user.email;
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.role = role || user.role;

    const updatedUser = await user.save();

    res.status(200).json({
      status: 'success',
      data: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Server Error',
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/SuperAdmin
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found',
      });
    }

    await user.deleteOne();

    res.status(200).json({
      status: 'success',
      message: 'User removed',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Server Error',
    });
  }
};

// @desc    Get user statistics
// @route   GET /api/users/statistics/overview
// @access  Private/SuperAdmin
export const getUserStatistics = async (req: Request, res: Response) => {
  try {
    const [
      totalUsers,
      superAdminUsers,
      adminUsers,
      pastorateUsers,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'superAdmin' }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ role: 'pastorate' }),
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        statistics: {
          total: totalUsers,
          superAdmin: superAdminUsers,
          admin: adminUsers,
          pastorate: pastorateUsers,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Server Error',
    });
  }
};
