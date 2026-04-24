import { Request, Response } from 'express';
import User from '../models/User';

// @desc    Get all users with filtering and search
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const { role, search } = req.query;
        let query: any = {};

        if (role) {
            query.role = role;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        console.error('GetAllUsers Error:', error);
        res.status(500).json({ message: 'Server error retrieving users' });
    }
};

// @desc    Get user details
// @route   GET /api/admin/users/:id
// @access  Private/Admin
export const getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error retrieving user' });
    }
};

// @desc    Toggle User Activation Status
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
export const toggleUserStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        // Must cast to any initially because TS thinks it doesn't exist if interface missing at compile time
        (user as any).isActive = !(user as any).isActive; 
        if ((user as any).isActive === undefined) (user as any).isActive = false; // default toggle from old true records

        await user.save();
        res.json({ message: `User ${(user as any).isActive ? 'activated' : 'deactivated'} successfully`, isActive: (user as any).isActive });
    } catch (error) {
        res.status(500).json({ message: 'Server error updating user status' });
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        
        await user.deleteOne();
        res.json({ message: 'User removed completely' });
    } catch (error) {
        res.status(500).json({ message: 'Server error deleting user' });
    }
};
