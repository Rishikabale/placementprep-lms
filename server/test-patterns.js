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
    var _a;
    try {
        yield mongoose_1.default.connect('mongodb://localhost:27017/placement-lms');
        // 1. Authenticate as Admin
        const admin = yield User_1.default.findOne({ role: 'admin' });
        if (!admin)
            throw new Error("No admin user found. Please create one in the DB first.");
        const adminToken = jsonwebtoken_1.default.sign({ id: admin._id }, process.env.JWT_SECRET || 'your_jwt_secret_key_here', { expiresIn: '1d' });
        // 2. Authenticate as Instructor
        let instructor = yield User_1.default.findOne({ role: 'instructor' });
        if (!instructor) {
            // Create a dummy instructor if not exists
            instructor = yield User_1.default.create({
                name: "Test Instructor",
                email: "instructor@test.com",
                password: "password123", // Usually hashed, but fine for a mock
                role: 'instructor'
            });
        }
        const instructorToken = jsonwebtoken_1.default.sign({ id: instructor._id }, process.env.JWT_SECRET || 'your_jwt_secret_key_here', { expiresIn: '1d' });
        console.log('\n--- 1. Testing Admin Seed Endpoint ---');
        try {
            const seedRes = yield axios_1.default.post('http://localhost:5000/api/company-patterns/seed', {}, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            console.log('Seed Status:', seedRes.status);
            console.log('Seed Message:', seedRes.data.message);
        }
        catch (e) {
            console.log('Seed failed. Is the server running on port 5000?');
            if (e.response)
                console.log(e.response.data);
            return;
        }
        console.log('\n--- 2. Testing Fetch Global Patterns ---');
        let globalPatterns = [];
        try {
            const getRes = yield axios_1.default.get('http://localhost:5000/api/company-patterns?filter=global', {
                headers: { Authorization: `Bearer ${instructorToken}` }
            });
            globalPatterns = getRes.data;
            console.log(`Fetched ${globalPatterns.length} global patterns.`);
            console.log('First pattern name:', (_a = globalPatterns[0]) === null || _a === void 0 ? void 0 : _a.name);
        }
        catch (e) {
            console.log('Fetch failed.');
            if (e.response)
                console.log(e.response.data);
        }
        if (globalPatterns.length > 0) {
            const targetPatternId = globalPatterns[0]._id;
            console.log(`\n--- 3. Testing Instructor Clone Endpoint for ID: ${targetPatternId} ---`);
            try {
                const cloneRes = yield axios_1.default.post(`http://localhost:5000/api/company-patterns/${targetPatternId}/clone`, {}, {
                    headers: { Authorization: `Bearer ${instructorToken}` }
                });
                console.log('Clone Status:', cloneRes.status);
                console.log('Cloned Pattern Name:', cloneRes.data.name);
                console.log('Cloned Pattern isGlobal:', cloneRes.data.isGlobal);
                console.log('Cloned Pattern createdBy:', cloneRes.data.createdBy);
            }
            catch (e) {
                console.log('Clone failed.');
                if (e.response)
                    console.log(e.response.data);
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
