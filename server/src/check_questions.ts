import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Question from './models/Question';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/placement-lms';

const check = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB');

        const total = await Question.countDocuments();
        console.log(`Total Questions: ${total}`);

        if (total === 0) {
            console.log('⚠ Database is empty! Please run npm run seed');
            process.exit(0);
        }

        const stats = await Question.aggregate([
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
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

check();
