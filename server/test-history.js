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
const mongoose_1 = __importDefault(require("mongoose"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const axios_1 = __importDefault(require("axios"));
const User_1 = __importDefault(require("./src/models/User"));
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mongoose_1.default.connect('mongodb://localhost:27017/placement-lms');
        const student = yield User_1.default.findOne({ role: 'student' });
        if (!student)
            throw new Error("No student user found");
        const token = jsonwebtoken_1.default.sign({ id: student._id }, process.env.JWT_SECRET || 'your_jwt_secret_key_here', { expiresIn: '1d' });
        console.log('Testing /api/ai-mock/history endpoint...');
        try {
            const res = yield axios_1.default.get('http://localhost:5000/api/ai-mock/history', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log('Status:', res.status);
            console.log('Data sample:', JSON.stringify(res.data).substring(0, 100));
        }
        catch (err) {
            console.error('HTTP Error:', err.message);
            if (err.response) {
                console.error('Response status:', err.response.status);
                console.error('Response data:', err.response.data);
            }
        }
    }
    catch (e) {
        console.error('Script Error:', e.message);
    }
    finally {
        yield mongoose_1.default.disconnect();
    }
});
run();
