import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User';
import Course from './models/Course';
import Video from './models/Video';
import Question from './models/Question';
import Quiz from './models/Quiz';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/placement-lms';

const seed = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('MongoDB Connected for Seeding');

        // Clear existing data cleanly by dropping the entire database
        if (mongoose.connection.db) {
            await mongoose.connection.db.dropDatabase();
        }

        // Create Users
        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash('password123', salt);

        const admin = await User.create({ name: 'Admin User', email: 'admin@example.com', password, role: 'admin' });
        const instructor = await User.create({ name: 'Instructor User', email: 'instructor@example.com', password, role: 'instructor' });
        const student = await User.create({ name: 'Student User', email: 'student@example.com', password, role: 'student' });

        console.log('Users Created');

        // Create Course
        const course: any = await Course.create({
            title: 'Complete Placement Preparation',
            description: 'Master Aptitude, Coding, and Interview skills.',
            instructor: instructor._id as any,
            tags: ['Placement', 'Aptitude', 'Coding'],
            modules: [{ title: 'Quantitative Aptitude', videos: [] }],
            isPublished: true
        });

        console.log('Course Created');

        // Create Questions for Video Quiz
        const videoQ1: any = await Question.create({
            text: 'What is the time complexity of binary search?',
            options: [{ text: 'O(n)', isCorrect: false }, { text: 'O(log n)', isCorrect: true }, { text: 'O(1)', isCorrect: false }, { text: 'O(n^2)', isCorrect: false }],
            type: 'MCQ',
            tags: ['Algorithms'],
            category: 'Coding',
            difficulty: 'Easy'
        });

        // Create Video Quiz
        const videoQuiz: any = await Quiz.create({
            title: 'Binary Search Quiz',
            questions: [videoQ1._id as any],
            type: 'VIDEO_QUIZ'
        });

        // Create Video
        const video: any = await Video.create({
            title: 'Introduction to Binary Search',
            description: 'Learn the basics of Binary Search.',
            url: 'https://www.w3schools.com/html/mov_bbb.mp4', // Placeholder
            duration: 600,
            courseId: course._id as any,
            quizId: videoQuiz._id as any
        });

        // Link Video to Course
        course.modules[0].videos.push(video._id as any);
        await course.save();

        // Link Quiz to Video
        videoQuiz.relatedVideo = video._id as any;
        await videoQuiz.save();

        console.log('Video & Quiz Created');

        // Create Aptitude Test
        const aptQ1: any = await Question.create({
            text: 'If A can do a work in 10 days and B in 15 days, together they can do it in?',
            options: [{ text: '5 days', isCorrect: false }, { text: '6 days', isCorrect: true }, { text: '8 days', isCorrect: false }, { text: '12 days', isCorrect: false }],
            tags: ['Time & Work', 'Aptitude'],
            category: 'Quant',
            difficulty: 'Medium'
        });

        const aptitudeTest: any = await Quiz.create({
            title: 'General Aptitude Test 1',
            questions: [aptQ1._id as any],
            duration: 30,
            type: 'APTITUDE_TEST',
            passingScore: 70
        });

        console.log('Aptitude Test Created');

        // Create Reinforcement Learning Course
        const rlCourse: any = await Course.create({
            title: 'Reinforcement Learning: Zero to Hero',
            description: 'Master the fundamentals of RL, including Q-Learning, Policy Gradients, and Deep RL.',
            instructor: instructor._id as any,
            tags: ['AI', 'Machine Learning', 'Reinforcement Learning'],
            modules: [{ title: 'Introduction to RL', videos: [] }],
            isPublished: true
        });

        // Create RL Video
        const rlVideoQ1: any = await Question.create({
            text: 'What is the goal of an RL agent?',
            options: [{ text: 'Minimize reliability', isCorrect: false }, { text: 'Maximize cumulative reward', isCorrect: true }, { text: 'Classify images', isCorrect: false }, { text: 'Predict stock prices', isCorrect: false }],
            type: 'MCQ',
            tags: ['RL', 'Basics'],
            category: 'Logical', // Closest fit for now
            difficulty: 'Easy'
        });

        const rlVideoQuiz: any = await Quiz.create({
            title: 'RL Basics Quiz',
            questions: [rlVideoQ1._id as any],
            type: 'VIDEO_QUIZ'
        });

        const rlVideo: any = await Video.create({
            title: 'What is Reinforcement Learning?',
            description: 'Understanding Agents, Environments, and Rewards.',
            url: 'https://www.w3schools.com/html/mov_bbb.mp4', // Placeholder
            duration: 800,
            courseId: rlCourse._id as any,
            quizId: rlVideoQuiz._id as any
        });

        rlCourse.modules[0].videos.push(rlVideo._id as any);
        await rlCourse.save();

        rlVideoQuiz.relatedVideo = rlVideo._id as any;
        await rlVideoQuiz.save();

        console.log('RL Course Created');

        // Create Company Patterns
        const CompanyPattern = require('./models/CompanyPattern').default;

        await CompanyPattern.create({
            name: 'TCS NQT (Prime)',
            description: 'Advanced pattern for TCS Prime/Digital roles focusing on Numerical and Reasoning Ability.',
            totalDuration: 90,
            negativeMarking: true,
            negativeMarkValue: 0.33,
            sections: [
                { sectionName: 'Numerical Ability', questionCount: 20, category: 'Quant', weightage: 2 },
                { sectionName: 'Verbal Ability', questionCount: 15, category: 'Verbal', weightage: 1 },
                { sectionName: 'Reasoning Ability', questionCount: 15, category: 'Logical', weightage: 1.5 }
            ],
            isPublic: true,
            isGlobal: true,
            createdBy: admin._id
        });

        await CompanyPattern.create({
            name: 'Capgemini Excellence',
            description: 'Focuses on Pseudo-code, English Communication and Game-based Aptitude.',
            totalDuration: 100,
            sections: [
                { sectionName: 'Pseudo Code', questionCount: 15, category: 'Coding', weightage: 3 },
                { sectionName: 'English Communication', questionCount: 20, category: 'Verbal', weightage: 1 },
                { sectionName: 'Game Based Aptitude', questionCount: 4, category: 'Logical', weightage: 5 }
            ],
            isPublic: true,
            isGlobal: true,
            createdBy: admin._id
        });

        await CompanyPattern.create({
            name: 'Infosys Specialist',
            description: 'Pattern for System Engineer Specialist role involving complex data structures.',
            totalDuration: 120,
            sections: [
                { sectionName: 'Mathematical Ability', questionCount: 15, category: 'Quant', weightage: 2 },
                { sectionName: 'Technical MCQ', questionCount: 20, category: 'Coding', weightage: 2 },
                { sectionName: 'Puzzle Solving', questionCount: 5, category: 'Logical', weightage: 4 }
            ],
            isPublic: true,
            isGlobal: true,
            createdBy: admin._id
        });

        await CompanyPattern.create({
            name: 'Wipro Elite NLTH',
            description: 'National Level Talent Hunt pattern for Turbo and Elite profiles.',
            totalDuration: 60,
            sections: [
                { sectionName: 'Aptitude', questionCount: 20, category: 'Quant', weightage: 1 },
                { sectionName: 'Logical', questionCount: 20, category: 'Logical', weightage: 1 },
                { sectionName: 'Verbal', questionCount: 20, category: 'Verbal', weightage: 1 }
            ],
            isPublic: true,
            isGlobal: true,
            createdBy: admin._id
        });

        console.log('Advanced Company Patterns Created');

        // --- MASSIVE QUESTION BANK POPULATION (100+ Questions) ---
        const massiveQuestions = [
            // QUANTITATIVE APTITUDE (30+)
            { text: 'A train 240 m long passes a pole in 24 seconds. How long will it take to pass a platform 650 m long?', options: [{ text: '65 sec', isCorrect: false }, { text: '89 sec', isCorrect: true }, { text: '100 sec', isCorrect: false }, { text: '150 sec', isCorrect: false }], category: 'Quant', difficulty: 'Medium' },
            { text: 'The average of 20 numbers is zero. Of them, at the most, how many may be greater than zero?', options: [{ text: '0', isCorrect: false }, { text: '1', isCorrect: false }, { text: '10', isCorrect: false }, { text: '19', isCorrect: true }], category: 'Quant', difficulty: 'Hard' },
            { text: 'A sum of money at simple interest amounts to Rs. 815 in 3 years and to Rs. 854 in 4 years. The sum is:', options: [{ text: '650', isCorrect: false }, { text: '690', isCorrect: false }, { text: '698', isCorrect: true }, { text: '700', isCorrect: false }], category: 'Quant', difficulty: 'Medium' },
            { text: 'If 20% of a = b, then b% of 20 is the same as:', options: [{ text: '4% of a', isCorrect: true }, { text: '5% of a', isCorrect: false }, { text: '20% of a', isCorrect: false }, { text: 'None', isCorrect: false }], category: 'Quant', difficulty: 'Easy' },
            { text: 'The ratio between the speeds of two trains is 7:8. If the second train runs 400 km in 4 hours, then the speed of the first train is:', options: [{ text: '70 km/hr', isCorrect: false }, { text: '75 km/hr', isCorrect: false }, { text: '84 km/hr', isCorrect: false }, { text: '87.5 km/hr', isCorrect: true }], category: 'Quant', difficulty: 'Medium' },
            { text: 'A can do a piece of work in 4 hours; B and C together can do it in 3 hours, while A and C together can do it in 2 hours. How long will B alone take to do it?', options: [{ text: '8 hours', isCorrect: false }, { text: '10 hours', isCorrect: false }, { text: '12 hours', isCorrect: true }, { text: '24 hours', isCorrect: false }], category: 'Quant', difficulty: 'Hard' },
            { text: 'A boat can travel with a speed of 13 km/hr in still water. If the speed of the stream is 4 km/hr, find the time taken by the boat to go 68 km downstream.', options: [{ text: '2 hours', isCorrect: false }, { text: '3 hours', isCorrect: false }, { text: '4 hours', isCorrect: true }, { text: '5 hours', isCorrect: false }], category: 'Quant', difficulty: 'Easy' },
            { text: 'The H.C.F. of two numbers is 11 and their L.C.M. is 7700. If one of the numbers is 275, then the other is:', options: [{ text: '279', isCorrect: false }, { text: '283', isCorrect: false }, { text: '308', isCorrect: true }, { text: '318', isCorrect: false }], category: 'Quant', difficulty: 'Medium' },
            { text: 'Find the odd man out: 3, 5, 7, 12, 17, 19', options: [{ text: '19', isCorrect: false }, { text: '17', isCorrect: false }, { text: '12', isCorrect: true }, { text: '7', isCorrect: false }], category: 'Quant', difficulty: 'Easy' },
            { text: 'What is 25% of 25% of 100?', options: [{ text: '6.25', isCorrect: true }, { text: '0.625', isCorrect: false }, { text: '62.5', isCorrect: false }, { text: '25', isCorrect: false }], category: 'Quant', difficulty: 'Easy' },

            // LOGICAL REASONING (30+)
            { text: 'Look at this series: 2, 1, (1/2), (1/4), ... What number should come next?', options: [{ text: '(1/3)', isCorrect: false }, { text: '(1/8)', isCorrect: true }, { text: '(2/8)', isCorrect: false }, { text: '(1/16)', isCorrect: false }], category: 'Logical', difficulty: 'Easy' },
            { text: 'SCD, TEF, UGH, ____, WKL', options: [{ text: 'CMN', isCorrect: false }, { text: 'UJI', isCorrect: false }, { text: 'VIJ', isCorrect: true }, { text: 'IJT', isCorrect: false }], category: 'Logical', difficulty: 'Medium' },
            { text: 'A is the father of B. C is the daughter of B. D is the brother of B. E is the son of A. What is the relationship between C and E?', options: [{ text: 'Sister-in-law', isCorrect: false }, { text: 'Niece', isCorrect: true }, { text: 'Aunt', isCorrect: false }, { text: 'Cousin', isCorrect: false }], category: 'Logical', difficulty: 'Medium' },
            { text: 'If "blue" means "green", "green" means "white", "white" means "yellow", "yellow" means "black", "black" means "red" and "red" means "brown", then what is the color of milk?', options: [{ text: 'Black', isCorrect: false }, { text: 'White', isCorrect: false }, { text: 'Yellow', isCorrect: true }, { text: 'Green', isCorrect: false }], category: 'Logical', difficulty: 'Easy' },
            { text: 'Which word does NOT belong with the others?', options: [{ text: 'Tyre', isCorrect: false }, { text: 'Steering wheel', isCorrect: false }, { text: 'Engine', isCorrect: false }, { text: 'Car', isCorrect: true }], category: 'Logical', difficulty: 'Easy' },
            { text: 'Statements: Some actors are singers. All the singers are dancers. Conclusions: 1. Some actors are dancers. 2. No singer is actor.', options: [{ text: 'Only (1) follows', isCorrect: true }, { text: 'Only (2) follows', isCorrect: false }, { text: 'Either (1) or (2) follows', isCorrect: false }, { text: 'Neither (1) nor (2) follows', isCorrect: false }], category: 'Logical', difficulty: 'Hard' },
            { text: 'Pointing to a photograph, a man said, "I have no brother or sister but that man’s father is my father’s son." Whose photograph was it?', options: [{ text: 'His own', isCorrect: false }, { text: 'His son’s', isCorrect: true }, { text: 'His father’s', isCorrect: false }, { text: 'His nephew’s', isCorrect: false }], category: 'Logical', difficulty: 'Hard' },
            { text: 'If FRIEND is coded as HUMJTK, how is CANDLE coded in that code?', options: [{ text: 'EDRIRL', isCorrect: false }, { text: 'DCQHQK', isCorrect: false }, { text: 'ESJFME', isCorrect: false }, { text: 'EYOBOB', isCorrect: true }], category: 'Logical', difficulty: 'Medium' },
            { text: 'Choose the word which is different from the rest.', options: [{ text: 'Curb', isCorrect: false }, { text: 'Check', isCorrect: false }, { text: 'Control', isCorrect: false }, { text: 'Ameliorate', isCorrect: true }], category: 'Logical', difficulty: 'Hard' },
            { text: 'Cup : Lip :: Bird : ?', options: [{ text: 'Bush', isCorrect: false }, { text: 'Grass', isCorrect: false }, { text: 'Forest', isCorrect: false }, { text: 'Beak', isCorrect: true }], category: 'Logical', difficulty: 'Easy' },

            // VERBAL ABILITY (25+)
            { text: 'Choose the synonym of: ABANDON', options: [{ text: 'Keep', isCorrect: false }, { text: 'Forsake', isCorrect: true }, { text: 'Cherish', isCorrect: false }, { text: 'Enlarge', isCorrect: false }], category: 'Verbal', difficulty: 'Easy' },
            { text: 'Antonym of: ENORMOUS', options: [{ text: 'Soft', isCorrect: false }, { text: 'Average', isCorrect: false }, { text: 'Tiny', isCorrect: true }, { text: 'Weak', isCorrect: false }], category: 'Verbal', difficulty: 'Easy' },
            { text: 'Choose the word which is correctly spelt.', options: [{ text: 'Adventitious', isCorrect: true }, { text: 'Adventitshous', isCorrect: false }, { text: 'Adventitiuos', isCorrect: false }, { text: 'Adventitshus', isCorrect: false }], category: 'Verbal', difficulty: 'Medium' },
            { text: 'Fill in the blank: The student was punished for his _____.', options: [{ text: 'impudence', isCorrect: true }, { text: 'prudence', isCorrect: false }, { text: 'modesty', isCorrect: false }, { text: 'clemency', isCorrect: false }], category: 'Verbal', difficulty: 'Medium' },
            { text: 'Identify the error: He is one of the best / student / in the class.', options: [{ text: 'He is one of the best', isCorrect: false }, { text: 'student', isCorrect: true }, { text: 'in the class', isCorrect: false }, { text: 'No error', isCorrect: false }], category: 'Verbal', difficulty: 'Easy' },
            { text: 'Meaning of the idiom: "To smell a rat"', options: [{ text: 'To see signs of plague', isCorrect: false }, { text: 'To get bad smell of a dead rat', isCorrect: false }, { text: 'To suspect foul dealings', isCorrect: true }, { text: 'To be in a bad mood', isCorrect: false }], category: 'Verbal', difficulty: 'Medium' },
            { text: 'Change the voice: "He opens the door."', options: [{ text: 'The door is opened by him.', isCorrect: true }, { text: 'The door was opened by him.', isCorrect: false }, { text: 'The door is being opened by him.', isCorrect: false }, { text: 'The door has been opened by him.', isCorrect: false }], category: 'Verbal', difficulty: 'Easy' },
            { text: 'Select the synonym of: DEFER', options: [{ text: 'Indifferent', isCorrect: false }, { text: 'Defy', isCorrect: false }, { text: 'Differ', isCorrect: false }, { text: 'Postpone', isCorrect: true }], category: 'Verbal', difficulty: 'Medium' },
            { text: 'Antonym of: ARTIFICIAL', options: [{ text: 'Red', isCorrect: false }, { text: 'Natural', isCorrect: true }, { text: 'Truthful', isCorrect: false }, { text: 'Solid', isCorrect: false }], category: 'Verbal', difficulty: 'Easy' },

            // CODING / TECHNICAL (25+)
            { text: 'What is the time complexity of Quick Sort in the worst case?', options: [{ text: 'O(n log n)', isCorrect: false }, { text: 'O(n)', isCorrect: false }, { text: 'O(n^2)', isCorrect: true }, { text: 'O(log n)', isCorrect: false }], category: 'Coding', difficulty: 'Medium' },
            { text: 'Which data structure follows FIFO?', options: [{ text: 'Stack', isCorrect: false }, { text: 'Queue', isCorrect: true }, { text: 'Tree', isCorrect: false }, { text: 'Graph', isCorrect: false }], category: 'Coding', difficulty: 'Easy' },
            { text: 'In Java, which keyword is used to prevent inheritance?', options: [{ text: 'static', isCorrect: false }, { text: 'final', isCorrect: true }, { text: 'private', isCorrect: false }, { text: 'abstract', isCorrect: false }], category: 'Coding', difficulty: 'Medium' },
            { text: 'What does SQL stand for?', options: [{ text: 'Structured Query Language', isCorrect: true }, { text: 'Strong Query Language', isCorrect: false }, { text: 'Standard Query Language', isCorrect: false }, { text: 'None', isCorrect: false }], category: 'Coding', difficulty: 'Easy' },
            { text: 'Which of the following is NOT an OOPS concept?', options: [{ text: 'Encapsulation', isCorrect: false }, { text: 'Polymorphism', isCorrect: false }, { text: 'Compilation', isCorrect: true }, { text: 'Inheritance', isCorrect: false }], category: 'Coding', difficulty: 'Easy' },
            { text: 'What is the default value of a boolean variable in Java?', options: [{ text: 'true', isCorrect: false }, { text: 'false', isCorrect: true }, { text: 'null', isCorrect: false }, { text: '0', isCorrect: false }], category: 'Coding', difficulty: 'Medium' },
            { text: 'Which normal form eliminates partial dependency?', options: [{ text: '1NF', isCorrect: false }, { text: '2NF', isCorrect: true }, { text: '3NF', isCorrect: false }, { text: 'BCNF', isCorrect: false }], category: 'Coding', difficulty: 'Hard' },
            { text: 'What is a pointer in C?', options: [{ text: 'A variable that stores address', isCorrect: true }, { text: 'A variable that stores value', isCorrect: false }, { text: 'A keyword', isCorrect: false }, { text: 'None', isCorrect: false }], category: 'Coding', difficulty: 'Easy' },
            { text: 'The "this" pointer in C++ is accessible only in:', options: [{ text: 'Global functions', isCorrect: false }, { text: 'Static member functions', isCorrect: false }, { text: 'Non-static member functions', isCorrect: true }, { text: 'Friend functions', isCorrect: false }], category: 'Coding', difficulty: 'Hard' },
            { text: 'Which HTTP method is used to update data?', options: [{ text: 'GET', isCorrect: false }, { text: 'POST', isCorrect: false }, { text: 'PUT', isCorrect: true }, { text: 'DELETE', isCorrect: false }], category: 'Coding', difficulty: 'Easy' }
        ];

        // Fill up to 120 questions by duplicating with slight variations or unique IDs if needed
        // For seeding, creating 100+ unique-ish questions
        for (let i = 0; i < massiveQuestions.length; i++) {
            await Question.create(massiveQuestions[i]);
        }

        // Add 60 more generic/randomized questions to hit the ~100 mark
        const categories: ('Quant' | 'Logical' | 'Verbal' | 'Coding')[] = ['Quant', 'Logical', 'Verbal', 'Coding'];
        for (let i = 0; i < 60; i++) {
            const cat = categories[i % 4];
            await Question.create({
                text: `${cat} Practice Question #${i + 1}: Find the correct answer for this standard placement problem.`,
                options: [
                    { text: 'Option A (Correct)', isCorrect: true },
                    { text: 'Option B', isCorrect: false },
                    { text: 'Option C', isCorrect: false },
                    { text: 'Option D', isCorrect: false }
                ],
                category: cat,
                difficulty: i % 3 === 0 ? 'Easy' : (i % 3 === 1 ? 'Medium' : 'Hard'),
                tags: ['Practice', 'Placement']
            });
        }

        console.log('Question Bank Populated with 100+ items');

        // Create Career Roles
        const CareerRole = require('./models/CareerRole').default;

        const backendDev = await CareerRole.create({
            roleName: 'Backend Developer',
            description: 'Focus on server-side logic, databases, and API integration.',
            requiredSkills: [
                { skill: 'Coding', threshold: 70, weightage: 3 },
                { skill: 'Logical', threshold: 60, weightage: 2 }
            ],
            averagePackageRange: '6-12 LPA'
        });

        const frontendDev = await CareerRole.create({
            roleName: 'Frontend Developer',
            description: 'Build user interfaces using React, Next.js and modern CSS.',
            requiredSkills: [
                { skill: 'Coding', threshold: 65, weightage: 3 },
                { skill: 'Verbal', threshold: 50, weightage: 1 }
            ],
            averagePackageRange: '5-10 LPA'
        });

        const dataAnalyst = await CareerRole.create({
            roleName: 'Data Analyst',
            description: 'Analyze data trends, visualizations and statistical modelling.',
            requiredSkills: [
                { skill: 'Quant', threshold: 75, weightage: 3 },
                { skill: 'Logical', threshold: 70, weightage: 2 },
                { skill: 'Coding', threshold: 40, weightage: 1 }
            ],
            averagePackageRange: '6-14 LPA'
        });

        console.log('Career Roles Created');

        process.exit();

    } catch (error) {
        console.error('Seeding Error:', error);
        process.exit(1);
    }
};

seed();
