import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import User from './src/models/User';

const run = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/placement-lms');

        const student = await User.findOne({ role: 'student' });
        if (!student) throw new Error("No student user found");

        const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET || 'your_jwt_secret_key_here', { expiresIn: '1d' });

        console.log('Testing /api/ai-mock/history endpoint...');
        try {
            const res = await axios.get('http://localhost:5000/api/ai-mock/history', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log('Status:', res.status);
            console.log('Data sample:', JSON.stringify(res.data).substring(0, 100));
        } catch (err: any) {
            console.error('HTTP Error:', err.message);
            if (err.response) {
                console.error('Response status:', err.response.status);
                console.error('Response data:', err.response.data);
            }
        }
    } catch (e: any) {
        console.error('Script Error:', e.message);
    } finally {
        await mongoose.disconnect();
    }
};

run();
