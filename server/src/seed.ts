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
            ]
        });

        await CompanyPattern.create({
            name: 'Capgemini Excellence',
            description: 'Focuses on Pseudo-code, English Communication and Game-based Aptitude.',
            totalDuration: 100,
            sections: [
                { sectionName: 'Pseudo Code', questionCount: 15, category: 'Coding', weightage: 3 },
                { sectionName: 'English Communication', questionCount: 20, category: 'Verbal', weightage: 1 },
                { sectionName: 'Game Based Aptitude', questionCount: 4, category: 'Logical', weightage: 5 }
            ]
        });

        await CompanyPattern.create({
            name: 'Infosys Specialist',
            description: 'Pattern for System Engineer Specialist role involving complex data structures.',
            totalDuration: 120,
            sections: [
                { sectionName: 'Mathematical Ability', questionCount: 15, category: 'Quant', weightage: 2 },
                { sectionName: 'Technical MCQ', questionCount: 20, category: 'Coding', weightage: 2 },
                { sectionName: 'Puzzle Solving', questionCount: 5, category: 'Logical', weightage: 4 }
            ]
        });

        await CompanyPattern.create({
            name: 'Wipro Elite NLTH',
            description: 'National Level Talent Hunt pattern for Turbo and Elite profiles.',
            totalDuration: 60,
            sections: [
                { sectionName: 'Aptitude', questionCount: 20, category: 'Quant', weightage: 1 },
                { sectionName: 'Logical', questionCount: 20, category: 'Logical', weightage: 1 },
                { sectionName: 'Verbal', questionCount: 20, category: 'Verbal', weightage: 1 }
            ]
        });

        console.log('Advanced Company Patterns Created');

        // Create specific questions for these patterns
        const questions = [
            // Quantitative Aptitude
            { text: 'A train running at the speed of 60 km/hr crosses a pole in 9 seconds. What is the length of the train?', options: [{ text: '120 m', isCorrect: false }, { text: '180 m', isCorrect: false }, { text: '150 m', isCorrect: true }, { text: '100 m', isCorrect: false }], category: 'Quant', companyTags: ['TCS', 'Capgemini'], difficulty: 'Medium' },
            { text: 'Find the missing number in the series: 2, 5, 10, 17, ?, 37', options: [{ text: '24', isCorrect: false }, { text: '26', isCorrect: true }, { text: '25', isCorrect: false }, { text: '27', isCorrect: false }], category: 'Quant', companyTags: ['TCS', 'Accenture'], difficulty: 'Easy' },
            { text: 'If 20% of a = b, then b% of 20 is the same as:', options: [{ text: '4% of a', isCorrect: true }, { text: '5% of a', isCorrect: false }, { text: '20% of a', isCorrect: false }, { text: 'None of these', isCorrect: false }], category: 'Quant', companyTags: ['TCS'], difficulty: 'Medium' },
            { text: 'The sum of ages of 5 children born at the intervals of 3 years each is 50 years. What is the age of the youngest child?', options: [{ text: '4 years', isCorrect: true }, { text: '8 years', isCorrect: false }, { text: '10 years', isCorrect: false }, { text: 'None of these', isCorrect: false }], category: 'Quant', companyTags: ['Accenture', 'Capgemini'], difficulty: 'Hard' },
            { text: 'Two pipes A and B can fill a tank in 20 and 30 minutes respectively. If both pipes are used together, then how long will it take to fill the tank?', options: [{ text: '12 min', isCorrect: true }, { text: '15 min', isCorrect: false }, { text: '25 min', isCorrect: false }, { text: '50 min', isCorrect: false }], category: 'Quant', companyTags: ['TCS'], difficulty: 'Medium' },
            { text: 'A vendor bought toffees at 6 for a rupee. How many for a rupee must he sell to gain 20%?', options: [{ text: '3', isCorrect: false }, { text: '4', isCorrect: false }, { text: '5', isCorrect: true }, { text: '6', isCorrect: false }], category: 'Quant', companyTags: ['Cognizant', 'TCS'], difficulty: 'Hard' },
            
            // Logical Reasoning
            { text: 'Statement: All cats are dogs. All dogs are birds. Conclusion: All cats are birds.', options: [{ text: 'True', isCorrect: true }, { text: 'False', isCorrect: false }, { text: 'Cannot be determined', isCorrect: false }], category: 'Logical', companyTags: ['TCS', 'Wipro'], difficulty: 'Medium' },
            { text: 'If COOK = 1234, and LOOK = 5224, then COOL = ?', options: [{ text: '1225', isCorrect: true }, { text: '1224', isCorrect: false }, { text: '1552', isCorrect: false }, { text: '1252', isCorrect: false }], category: 'Logical', companyTags: ['TCS', 'Accenture'], difficulty: 'Easy' },
            { text: 'Pointing to a photograph, a man said, "I have no brother or sister but that man’s father is my father’s son." Whose photograph was it?', options: [{ text: 'His own', isCorrect: false }, { text: 'His son’s', isCorrect: true }, { text: 'His father’s', isCorrect: false }, { text: 'His nephew’s', isCorrect: false }], category: 'Logical', companyTags: ['TCS', 'Infosys'], difficulty: 'Hard' },
            { text: 'Arrange the words given below in a meaningful sequence. 1. Key 2. Door 3. Lock 4. Room 5. Switch on', options: [{ text: '5, 1, 2, 4, 3', isCorrect: false }, { text: '4, 2, 1, 5, 3', isCorrect: false }, { text: '1, 3, 2, 4, 5', isCorrect: true }, { text: '1, 2, 3, 5, 4', isCorrect: false }], category: 'Logical', companyTags: ['Capgemini'], difficulty: 'Easy' },
            { text: 'Choose the word which is different from the rest.', options: [{ text: 'Chicken', isCorrect: false }, { text: 'Snake', isCorrect: false }, { text: 'Swan', isCorrect: false }, { text: 'Crocodile', isCorrect: true }, { text: 'Frog', isCorrect: false }], category: 'Logical', companyTags: ['Accenture'], difficulty: 'Medium' },

            // Verbal Ability
            { text: 'Choose the synonym of: ABANDON', options: [{ text: 'Keep', isCorrect: false }, { text: 'Forsake', isCorrect: true }, { text: 'Cherish', isCorrect: false }, { text: 'Enlarge', isCorrect: false }], category: 'Verbal', companyTags: ['TCS'], difficulty: 'Easy' },
            { text: 'Spot the error: He is one of the best / player / in the team.', options: [{ text: 'He is one of the best', isCorrect: false }, { text: 'player', isCorrect: true }, { text: 'in the team', isCorrect: false }, { text: 'No Error', isCorrect: false }], category: 'Verbal', companyTags: ['TCS', 'Cognizant'], difficulty: 'Medium' },
            { text: 'Antonym of: DILIGENT', options: [{ text: 'Hardworking', isCorrect: false }, { text: 'Lazy', isCorrect: true }, { text: 'Careful', isCorrect: false }, { text: 'Attentive', isCorrect: false }], category: 'Verbal', companyTags: ['TCS'], difficulty: 'Easy' },
            { text: 'Complete the sentence: Despite his best efforts to conceal his anger, his _____ voice gave him away.', options: [{ text: 'quivering', isCorrect: true }, { text: 'melodious', isCorrect: false }, { text: 'silent', isCorrect: false }, { text: 'cheerful', isCorrect: false }], category: 'Verbal', companyTags: ['Infosys', 'Capgemini'], difficulty: 'Medium' },
            { text: 'Choose the correctly spelt word.', options: [{ text: 'Accomodation', isCorrect: false }, { text: 'Accommodation', isCorrect: true }, { text: 'Acomodation', isCorrect: false }, { text: 'Acommodation', isCorrect: false }], category: 'Verbal', companyTags: ['Accenture'], difficulty: 'Medium' },

            // Coding / Technical
            { text: 'What is the complexity of Bubble Sort?', options: [{ text: 'O(n)', isCorrect: false }, { text: 'O(n^2)', isCorrect: true }, { text: 'O(log n)', isCorrect: false }, { text: 'O(1)', isCorrect: false }], category: 'Coding', companyTags: ['TCS', 'Infosys'], difficulty: 'Easy' },
            { text: 'Which data structure uses LIFO (Last In First Out)?', options: [{ text: 'Queue', isCorrect: false }, { text: 'Array', isCorrect: false }, { text: 'Stack', isCorrect: true }, { text: 'Linked List', isCorrect: false }], category: 'Coding', companyTags: ['TCS', 'Accenture'], difficulty: 'Easy' },
            { text: 'What does SQL stand for?', options: [{ text: 'Strong Question Language', isCorrect: false }, { text: 'Structured Query Language', isCorrect: true }, { text: 'Standard Query Language', isCorrect: false }, { text: 'Simple Query Language', isCorrect: false }], category: 'Coding', companyTags: ['Capgemini', 'TCS'], difficulty: 'Easy' },
            { text: 'In Java, which keyword is used to establish inheritance?', options: [{ text: 'implements', isCorrect: false }, { text: 'inherits', isCorrect: false }, { text: 'extends', isCorrect: true }, { text: 'super', isCorrect: false }], category: 'Coding', companyTags: ['TCS'], difficulty: 'Medium' },
            { text: 'Which of the following sorting algorithms provides the best worst-case performance?', options: [{ text: 'Quick Sort', isCorrect: false }, { text: 'Merge Sort', isCorrect: true }, { text: 'Bubble Sort', isCorrect: false }, { text: 'Selection Sort', isCorrect: false }], category: 'Coding', companyTags: ['Infosys', 'Accenture'], difficulty: 'Hard' },
            // Extra Quant
            { text: 'A man buys a cycle for Rs. 1400 and sells it at a loss of 15%. What is the selling price of the cycle?', options: [{ text: '1090', isCorrect: false }, { text: '1160', isCorrect: false }, { text: '1190', isCorrect: true }, { text: '1202', isCorrect: false }], category: 'Quant', companyTags: ['TCS'], difficulty: 'Easy' },
            { text: 'The average of first 50 natural numbers is:', options: [{ text: '12.25', isCorrect: false }, { text: '21.25', isCorrect: false }, { text: '25', isCorrect: false }, { text: '25.5', isCorrect: true }], category: 'Quant', companyTags: ['Accenture'], difficulty: 'Easy' },
            { text: 'The length of the bridge, which a train 130 metres long and travelling at 45 km/hr can cross in 30 seconds, is:', options: [{ text: '200 m', isCorrect: false }, { text: '225 m', isCorrect: false }, { text: '245 m', isCorrect: true }, { text: '250 m', isCorrect: false }], category: 'Quant', companyTags: ['TCS', 'Infosys'], difficulty: 'Medium' },
            { text: 'A sum of money at simple interest amounts to Rs. 815 in 3 years and to Rs. 854 in 4 years. The sum is:', options: [{ text: '650', isCorrect: false }, { text: '690', isCorrect: false }, { text: '698', isCorrect: true }, { text: '700', isCorrect: false }], category: 'Quant', companyTags: ['Wipro'], difficulty: 'Hard' },
            { text: 'The cube root of .000216 is:', options: [{ text: '.6', isCorrect: false }, { text: '.06', isCorrect: true }, { text: '.006', isCorrect: false }, { text: 'None', isCorrect: false }], category: 'Quant', companyTags: ['TCS'], difficulty: 'Easy' },
            // Extra Logical
            { text: 'Look at this series: 7, 10, 8, 11, 9, 12, ... What number should come next?', options: [{ text: '7', isCorrect: false }, { text: '10', isCorrect: true }, { text: '12', isCorrect: false }, { text: '13', isCorrect: false }], category: 'Logical', companyTags: ['Accenture'], difficulty: 'Easy' },
            { text: 'Odometer is to mileage as compass is to', options: [{ text: 'speed', isCorrect: false }, { text: 'hiking', isCorrect: false }, { text: 'needle', isCorrect: false }, { text: 'direction', isCorrect: true }], category: 'Logical', companyTags: ['TCS'], difficulty: 'Easy' },
            { text: 'CUP : LIP :: BIRD :', options: [{ text: 'BUSH', isCorrect: false }, { text: 'GRASS', isCorrect: false }, { text: 'FOREST', isCorrect: false }, { text: 'BEAK', isCorrect: true }], category: 'Logical', companyTags: ['Cognizant'], difficulty: 'Easy' },
            { text: 'Choose the odd one out:', options: [{ text: 'Apple', isCorrect: false }, { text: 'Mango', isCorrect: false }, { text: 'Watermelon', isCorrect: false }, { text: 'Guava', isCorrect: false }, { text: 'Rose', isCorrect: true }], category: 'Logical', companyTags: ['Wipro'], difficulty: 'Easy' },
            { text: 'A is B’s sister. C is B’s mother. D is C’s father. Then how is A related to D?', options: [{ text: 'Grandmother', isCorrect: false }, { text: 'Grandfather', isCorrect: false }, { text: 'Daughter', isCorrect: false }, { text: 'Granddaughter', isCorrect: true }], category: 'Logical', companyTags: ['TCS', 'Infosys'], difficulty: 'Medium' },
            // Extra Verbal
            { text: 'Find the correctly spelt word.', options: [{ text: 'Bouquet', isCorrect: true }, { text: 'Bouquette', isCorrect: false }, { text: 'Boquet', isCorrect: false }, { text: 'Bouqeut', isCorrect: false }], category: 'Verbal', companyTags: ['TCS'], difficulty: 'Medium' },
            { text: 'Select the synonym of: BRIEF', options: [{ text: 'Limited', isCorrect: false }, { text: 'Small', isCorrect: false }, { text: 'Little', isCorrect: false }, { text: 'Short', isCorrect: true }], category: 'Verbal', companyTags: ['Infosys'], difficulty: 'Easy' },
            { text: 'Select the antonym of: ARTIFICIAL', options: [{ text: 'Red', isCorrect: false }, { text: 'Natural', isCorrect: true }, { text: 'Truthful', isCorrect: false }, { text: 'Solid', isCorrect: false }], category: 'Verbal', companyTags: ['TCS'], difficulty: 'Easy' },
            { text: 'Choose the one which best expresses the meaning of the idiom "To beat around the bush"', options: [{ text: 'Wandering through the forest', isCorrect: false }, { text: 'Avoiding the main topic', isCorrect: true }, { text: 'Clearing the bush', isCorrect: false }, { text: 'None of above', isCorrect: false }], category: 'Verbal', companyTags: ['Accenture', 'TCS'], difficulty: 'Medium' },
            { text: 'Fill in the blank: I _____ to the mall after school.', options: [{ text: 'goes', isCorrect: false }, { text: 'gone', isCorrect: false }, { text: 'go', isCorrect: false }, { text: 'went', isCorrect: true }], category: 'Verbal', companyTags: ['Wipro'], difficulty: 'Easy' },
            // Extra Coding
            { text: 'DBMS stands for:', options: [{ text: 'Database Management Simulator', isCorrect: false }, { text: 'Database Management System', isCorrect: true }, { text: 'Data Binding System', isCorrect: false }, { text: 'Digital Base System', isCorrect: false }], category: 'Coding', companyTags: ['Capgemini', 'TCS'], difficulty: 'Easy' },
            { text: 'Who is the father of C language?', options: [{ text: 'Steve Jobs', isCorrect: false }, { text: 'James Gosling', isCorrect: false }, { text: 'Dennis Ritchie', isCorrect: true }, { text: 'Rasmus Lerdorf', isCorrect: false }], category: 'Coding', companyTags: ['TCS'], difficulty: 'Easy' },
            { text: 'Which operator is used to allocate memory dynamically in C++?', options: [{ text: 'malloc', isCorrect: false }, { text: 'new', isCorrect: true }, { text: 'calloc', isCorrect: false }, { text: 'None', isCorrect: false }], category: 'Coding', companyTags: ['Infosys'], difficulty: 'Medium' },
            { text: 'Deadlock happens when:', options: [{ text: 'Memory runs out', isCorrect: false }, { text: 'CPU is fully utilized', isCorrect: false }, { text: 'Two or more processes are waiting indefinitely for an event', isCorrect: true }, { text: 'Disk crashes', isCorrect: false }], category: 'Coding', companyTags: ['Accenture'], difficulty: 'Medium' },
            { text: 'Which normal form deals with multi-valued dependency?', options: [{ text: 'First', isCorrect: false }, { text: 'Second', isCorrect: false }, { text: 'Third', isCorrect: false }, { text: 'Fourth (4NF)', isCorrect: true }], category: 'Coding', companyTags: ['TCS'], difficulty: 'Hard' }
        ];

        for (const q of questions) {
            await Question.create(q);
        }

        console.log('Mock Test Questions Created');

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
