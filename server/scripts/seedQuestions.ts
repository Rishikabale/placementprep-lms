import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Question from '../src/models/Question';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/placement-lms';

const baseQuestions = [
    // --- QUANTITATIVE ---
    { text: 'A train 120 meters long is running with a speed of 60 km/hr. In what time will it pass a boy who is running at 6 km/hr in the direction opposite to that in which the train is going?', options: [{ text: '6.54 sec', isCorrect: true }, { text: '7.20 sec', isCorrect: false }, { text: '5.10 sec', isCorrect: false }, { text: '6.00 sec', isCorrect: false }], explanation: 'Relative speed = 60 + 6 = 66 km/hr. Convert to m/s.', type: 'MCQ', category: 'Quant', tags: ['Speed, Time and Distance'], difficulty: 'Medium', companyTags: ['TCS', 'Infosys'], isGenerated: true },
    { text: 'Two pipes A and B can fill a tank in 20 and 30 minutes respectively. If both the pipes are used together, then how long will it take to fill the tank?', options: [{ text: '12 min', isCorrect: true }, { text: '15 min', isCorrect: false }, { text: '25 min', isCorrect: false }, { text: '50 min', isCorrect: false }], explanation: 'Work done by both in 1 min = 1/20 + 1/30 = 1/12. So 12 mins.', type: 'MCQ', category: 'Quant', tags: ['Pipes and Cisterns'], difficulty: 'Easy', companyTags: ['Wipro'], isGenerated: true },
    // --- LOGICAL ---
    { text: 'Look at this series: 2, 1, (1/2), (1/4), ... What number should come next?', options: [{ text: '(1/3)', isCorrect: false }, { text: '(1/8)', isCorrect: true }, { text: '(2/8)', isCorrect: false }, { text: '(1/16)', isCorrect: false }], explanation: 'This is a simple division series; each number is one-half of the previous number.', type: 'MCQ', category: 'Logical', tags: ['Number Series'], difficulty: 'Easy', companyTags: ['TCS', 'Accenture'], isGenerated: true },
    { text: 'SCD, TEF, UGH, ____, WKL', options: [{ text: 'CMN', isCorrect: false }, { text: 'UJI', isCorrect: false }, { text: 'VIJ', isCorrect: true }, { text: 'IJT', isCorrect: false }], explanation: 'First letters: S, T, U, V, W. Second and third move in pairs CD, EF, GH, IJ, KL.', type: 'MCQ', category: 'Logical', tags: ['Letter Series'], difficulty: 'Medium', companyTags: ['Infosys'], isGenerated: true },
    // --- VERBAL ---
    { text: 'Choose the correct synonym for "ABUNDANT"', options: [{ text: 'Scarce', isCorrect: false }, { text: 'Plentiful', isCorrect: true }, { text: 'Minor', isCorrect: false }, { text: 'Rare', isCorrect: false }], explanation: 'Abundant means existing or available in large quantities; plentiful.', type: 'MCQ', category: 'Verbal', tags: ['Synonyms'], difficulty: 'Easy', companyTags: ['TCS'], isGenerated: true },
    { text: 'Find the correctly spelt word.', options: [{ text: 'Accomodation', isCorrect: false }, { text: 'Accommodation', isCorrect: true }, { text: 'Acomodation', isCorrect: false }, { text: 'Accomodasion', isCorrect: false }], explanation: 'The correct spelling has double c and double m.', type: 'MCQ', category: 'Verbal', tags: ['Spellings'], difficulty: 'Medium', companyTags: ['Wipro', 'Infosys'], isGenerated: true },
    // --- CODING ---
    { text: 'What is the time complexity of binary search?', options: [{ text: 'O(n)', isCorrect: false }, { text: 'O(log n)', isCorrect: true }, { text: 'O(n^2)', isCorrect: false }, { text: 'O(1)', isCorrect: false }], explanation: 'Binary search halves the search space at each step.', type: 'MCQ', category: 'Coding', tags: ['Algorithms', 'Data Structures'], difficulty: 'Easy', companyTags: ['Amazon', 'Google', 'TCS'], isGenerated: true },
    { text: 'Which of the following data structures operates on a Last In First Out (LIFO) principle?', options: [{ text: 'Queue', isCorrect: false }, { text: 'Linked List', isCorrect: false }, { text: 'Stack', isCorrect: true }, { text: 'Tree', isCorrect: false }], explanation: 'A stack is a LIFO (Last In First Out) data structure.', type: 'MCQ', category: 'Coding', tags: ['Data Structures'], difficulty: 'Easy', companyTags: ['Infosys', 'Accenture'], isGenerated: true }
];

const mockQuestions: any[] = [...baseQuestions];

// Procedurally generate 200 more questions
const categories = ['Quant', 'Logical', 'Verbal', 'Coding'];
const difficulties = ['Easy', 'Medium', 'Hard'];

for (let i = 1; i <= 200; i++) {
    const category = categories[i % categories.length];
    const difficulty = difficulties[i % difficulties.length];
    
    let text, explanation, options;

    if (category === 'Quant') {
        const a = Math.floor(Math.random() * 50) + 10;
        const b = Math.floor(Math.random() * 50) + 10;
        text = `If a machine produces ${a} units per hour, how many units will it produce in ${b} hours?`;
        const ans = a * b;
        options = [
            { text: `${ans}`, isCorrect: true },
            { text: `${ans + 10}`, isCorrect: false },
            { text: `${ans - 5}`, isCorrect: false },
            { text: `${ans * 2}`, isCorrect: false }
        ];
        explanation = `Simply multiply ${a} and ${b} to get ${ans}.`;
    } else if (category === 'Logical') {
        const start = Math.floor(Math.random() * 10);
        const step = Math.floor(Math.random() * 5) + 2;
        text = `Find the next number in the series: ${start}, ${start + step}, ${start + step * 2}, ${start + step * 3}, ...`;
        const ans = start + step * 4;
        options = [
            { text: `${ans - step}`, isCorrect: false },
            { text: `${ans}`, isCorrect: true },
            { text: `${ans + step}`, isCorrect: false },
            { text: `${ans + 2}`, isCorrect: false }
        ];
        explanation = `The series increments by ${step} each time.`;
    } else if (category === 'Verbal') {
        const words = ['Benevolent', 'Candid', 'Diligent', 'Eloquent', 'Frugal'];
        const word = words[i % words.length];
        text = `What is the most appropriate antonym for the word "${word}"?`;
        options = [
            { text: 'Correct Antonym', isCorrect: true },
            { text: 'Random Word A', isCorrect: false },
            { text: 'Random Word B', isCorrect: false },
            { text: 'Random Word C', isCorrect: false }
        ];
        explanation = `This is a vocabulary question testing antonyms.`;
    } else {
        text = `Which of the following is a core concept in object-oriented programming (Concept #${i})?`;
        options = [
            { text: 'Encapsulation', isCorrect: true },
            { text: 'Compilation', isCorrect: false },
            { text: 'Execution', isCorrect: false },
            { text: 'Interpretation', isCorrect: false }
        ];
        explanation = `Encapsulation is a fundamental pillar of OOP.`;
    }

    // Shuffle options
    options.sort(() => Math.random() - 0.5);

    mockQuestions.push({
        text,
        options,
        explanation,
        type: 'MCQ',
        category,
        tags: ['General Practice'],
        difficulty,
        companyTags: ['Generic'],
        isGenerated: true
    });
}

const seedQuestions = async () => {
    try {
        console.log(`Connecting to MongoDB at: ${MONGODB_URI}`);
        await mongoose.connect(MONGODB_URI);
        console.log('Connected correctly.');

        // Wipe out old generated questions so we do not have duplicates
        const deleted = await Question.deleteMany({ isGenerated: true });
        console.log(`Deleted ${deleted.deletedCount} old auto-generated mock questions.`);

        // Insert new ones
        const inserted = await Question.insertMany(mockQuestions);
        console.log(`Successfully populated ${inserted.length} mock questions!`);
        
    } catch (error) {
        console.error('Error seeding data:', error);
    } finally {
        await mongoose.disconnect();
        console.log('MongoDB connection closed.');
    }
};

seedQuestions();
