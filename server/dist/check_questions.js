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
const dotenv_1 = __importDefault(require("dotenv"));
const Question_1 = __importDefault(require("./models/Question"));
dotenv_1.default.config();
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/placement-lms';
const check = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mongoose_1.default.connect(MONGODB_URI);
        console.log('Connected to DB');
        const total = yield Question_1.default.countDocuments();
        console.log(`Total Questions: ${total}`);
        if (total === 0) {
            console.log('⚠ Database is empty! Please run npm run seed');
            process.exit(0);
        }
        const stats = yield Question_1.default.aggregate([
            {
                $group: {
                    _id: { category: "$category", difficulty: "$difficulty" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.category": 1, "_id.difficulty": 1 } }
        ]);
        console.log('Breakdown:');
        stats.forEach(s => {
            console.log(`- ${s._id.category} (${s._id.difficulty}): ${s.count}`);
        });
        process.exit(0);
    }
    catch (e) {
        console.error(e);
        process.exit(1);
    }
});
check();
