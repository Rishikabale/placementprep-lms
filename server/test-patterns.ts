import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import User from './src/models/User';

const run = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/placement-lms');

        // 1. Authenticate as Admin
        const admin = await User.findOne({ role: 'admin' });
        if (!admin) throw new Error("No admin user found. Please create one in the DB first.");
        const adminToken = jwt.sign({ id: admin._id }, process.env.JWT_SECRET || 'your_jwt_secret_key_here', { expiresIn: '1d' });

        // 2. Authenticate as Instructor
        let instructor = await User.findOne({ role: 'instructor' });
        if (!instructor) {
            // Create a dummy instructor if not exists
            instructor = await User.create({
                name: "Test Instructor",
                email: "instructor@test.com",
                password: "password123", // Usually hashed, but fine for a mock
                role: 'instructor'
            });
        }
        const instructorToken = jwt.sign({ id: instructor._id }, process.env.JWT_SECRET || 'your_jwt_secret_key_here', { expiresIn: '1d' });

        console.log('\n--- 1. Testing Admin Seed Endpoint ---');
        try {
            const seedRes = await axios.post('http://localhost:5000/api/company-patterns/seed', {}, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            console.log('Seed Status:', seedRes.status);
            console.log('Seed Message:', seedRes.data.message);
        } catch (e: any) {
            console.log('Seed failed. Is the server running on port 5000?');
            if(e.response) console.log(e.response.data);
            return;
        }

        console.log('\n--- 2. Testing Fetch Global Patterns ---');
        let globalPatterns: any[] = [];
        try {
            const getRes = await axios.get('http://localhost:5000/api/company-patterns?filter=global', {
                headers: { Authorization: `Bearer ${instructorToken}` }
            });
            globalPatterns = getRes.data;
            console.log(`Fetched ${globalPatterns.length} global patterns.`);
            console.log('First pattern name:', globalPatterns[0]?.name);
        } catch (e: any) {
            console.log('Fetch failed.');
            if(e.response) console.log(e.response.data);
        }

        if (globalPatterns.length > 0) {
            const targetPatternId = globalPatterns[0]._id;
            console.log(`\n--- 3. Testing Instructor Clone Endpoint for ID: ${targetPatternId} ---`);
            try {
                const cloneRes = await axios.post(`http://localhost:5000/api/company-patterns/${targetPatternId}/clone`, {}, {
                    headers: { Authorization: `Bearer ${instructorToken}` }
                });
                console.log('Clone Status:', cloneRes.status);
                console.log('Cloned Pattern Name:', cloneRes.data.name);
                console.log('Cloned Pattern isGlobal:', cloneRes.data.isGlobal);
                console.log('Cloned Pattern createdBy:', cloneRes.data.createdBy);
            } catch (e: any) {
                console.log('Clone failed.');
                if(e.response) console.log(e.response.data);
            }
        }

    } catch (e: any) {
        console.error('Script Error:', e.message);
    } finally {
        await mongoose.disconnect();
    }
};

run();
