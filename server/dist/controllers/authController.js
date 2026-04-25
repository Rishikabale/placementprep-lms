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
exports.resetPassword = exports.forgotPassword = exports.getMe = exports.loginUser = exports.registerUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = __importDefault(require("../models/User"));
const generateToken = (id, role) => {
    return jsonwebtoken_1.default.sign({ id, role }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '30d',
    });
};
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password, role } = req.body;
    try {
        const userExists = yield User_1.default.findOne({ email });
        if (userExists) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }
        const salt = yield bcryptjs_1.default.genSalt(10);
        const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
        const user = yield User_1.default.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'student',
        });
        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id, user.role),
            });
        }
        else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.registerUser = registerUser;
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const user = yield User_1.default.findOne({ email });
        if (user && (yield bcryptjs_1.default.compare(password, user.password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id, user.role),
            });
        }
        else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.loginUser = loginUser;
const getMe = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(200).json(req.user);
});
exports.getMe = getMe;
const crypto_1 = __importDefault(require("crypto"));
const sendEmail_1 = __importDefault(require("../utils/sendEmail"));
// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    try {
        const user = yield User_1.default.findOne({ email });
        if (!user) {
            res.status(404).json({ message: 'There is no user with that email' });
            return;
        }
        // Generate token
        const resetToken = crypto_1.default.randomBytes(20).toString('hex');
        // Hash token and set to resetPasswordToken field
        user.resetPasswordToken = crypto_1.default.createHash('sha256').update(resetToken).digest('hex');
        // Set expire
        user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        yield user.save();
        // Create reset url
        // Use an environment variable for the frontend URL if possible, fallback to localhost
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;
        const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;
        try {
            yield (0, sendEmail_1.default)({
                email: user.email,
                subject: 'Password reset token',
                message,
            });
            res.status(200).json({ message: 'Email sent' });
        }
        catch (err) {
            console.error(err);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            yield user.save();
            res.status(500).json({ message: 'Email could not be sent' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.forgotPassword = forgotPassword;
// @desc    Reset Password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get hashed token
        const resetPasswordToken = crypto_1.default.createHash('sha256').update(String(req.params.token)).digest('hex');
        const user = yield User_1.default.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: new Date() },
        });
        if (!user) {
            res.status(400).json({ message: 'Invalid token' });
            return;
        }
        // Set new password
        const salt = yield bcryptjs_1.default.genSalt(10);
        user.password = yield bcryptjs_1.default.hash(req.body.password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        yield user.save();
        res.status(200).json({ message: 'Password reset successful' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.resetPassword = resetPassword;
