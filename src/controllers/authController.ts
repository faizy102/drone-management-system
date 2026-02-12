import { Request, Response } from 'express';
import { generateToken } from '../utils/jwt';
import { UserType } from '../types';
import { UserModel } from '../models/userModel';
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { name, type } = req.body;
    if (!Object.values(UserType).includes(type)) {
      res.status(400).json({
        success: false,
        error: 'Invalid user type. Must be admin, enduser, or drone',
      });
      return;
    }
    let user = await UserModel.findOne({ name, type });
    if (user) {
      user.lastLogin = new Date();
      user.loginCount += 1;
      await user.save();
    } else {
      user = await UserModel.create({
        name,
        type: type as UserType,
        lastLogin: new Date(),
        loginCount: 1,
      });
    }
    const token = generateToken(name, type as UserType);
    res.status(200).json({
      success: true,
      data: {
        token,
        type,
        name,
        userId: user._id.toString(),
        loginCount: user.loginCount,
        lastLogin: user.lastLogin,
        isNewUser: user.loginCount === 1,
      },
      message: user.loginCount === 1 
        ? 'User created and authenticated successfully' 
        : 'Authentication successful',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Login failed',
    });
  }
}
export async function getAllUsers(_req: Request, res: Response): Promise<void> {
  try {
    const users = await UserModel.find()
      .sort({ lastLogin: -1 })
      .select('-__v');
    const usersData = users.map(user => ({
      id: user._id.toString(),
      name: user.name,
      type: user.type,
      loginCount: user.loginCount,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
    }));
    res.status(200).json({
      success: true,
      data: usersData,
      count: usersData.length,
      message: 'Users retrieved successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get users',
    });
  }
}
