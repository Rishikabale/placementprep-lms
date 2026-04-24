"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.toggleUserStatus = exports.getUserById = exports.getAllUsers = void 0;
const User_1 = __importDefault(require("../models/User"));
// @desc    Get all users with filtering and search
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { role, search } = req.query;
        let query = {};
        if (role) {
            query.role = role;
        }
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        const users = yield User_1.default.find(query).select('-password').sort({ createdAt: -1 });
        res.json(users);
    }
    catch (error) {
        console.error('GetAllUsers Error:', error);
        res.status(500).json({ message: 'Server error retrieving users' });
    }
});
exports.getAllUsers = getAllUsers;
// @desc    Get user details
// @route   GET /api/admin/users/:id
// @access  Private/Admin
const getUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.default.findById(req.params.id).select('-password');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error retrieving user' });
    }
});
exports.getUserById = getUserById;
// @desc    Toggle User Activation Status
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
const toggleUserStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.default.findById(req.params.id);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        // Must cast to any initially because TS thinks it doesn't exist if interface missing at compile time
        user.isActive = !user.isActive;
        if (user.isActive === undefined)
            user.isActive = false; // default toggle from old true records
        yield user.save();
        res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`, isActive: user.isActive });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error updating user status' });
    }
});
exports.toggleUserStatus = toggleUserStatus;
// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.default.findById(req.params.id);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        yield user.deleteOne();
        res.json({ message: 'User removed completely' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error deleting user' });
    }
});
exports.deleteUser = deleteUser;
