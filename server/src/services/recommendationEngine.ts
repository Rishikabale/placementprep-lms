import Progress from '../models/Progress';
import Recommendation from '../models/Recommendation';
import Course from '../models/Course';
import Quiz from '../models/Quiz';

export const generateRecommendations = async (userId: string) => {
    const progress = await Progress.findOne({ student: userId as any });
    if (!progress) return null;

    let focusAreas: string[] = [];
    let reason = "Based on your recent performance";

    // 1. Analyze Aptitude Scores
    // If average aptitude score is low (< 60), recommend Aptitude courses
    let aptScoreSum = 0;
    progress.aptitudeScores.forEach(s => aptScoreSum += s.score);
    const avgAptScore = progress.aptitudeScores.length > 0 ? aptScoreSum / progress.aptitudeScores.length : 100;

    if (avgAptScore < 60) {
        focusAreas.push("Aptitude");
        reason += ", we noticed you struggled with Aptitude tests.";
    }

    // 2. Analyze Coding Scores
    let codingScoreSum = 0;
    progress.codingTestScores.forEach(s => codingScoreSum += s.score);
    const avgCodingScore = progress.codingTestScores.length > 0 ? codingScoreSum / progress.codingTestScores.length : 100;

    if (avgCodingScore < 60) {
        focusAreas.push("Coding");
        reason += " and Coding challenges.";
    }

    // 3. Find Courses matching focus areas
    const recommendedCourses = await Course.find({ tags: { $in: focusAreas } }).limit(3);

    // 4. Find Practice Tests
    const practiceTests = await Quiz.find({ type: 'APTITUDE_TEST' }).limit(2);

    // Save Recommendation
    const recommendation = await Recommendation.findOneAndUpdate(
        { user: userId as any },
        {
            user: userId as any,
            recommendedCourses: recommendedCourses.map(c => c._id),
            focusAreas,
            suggestedPracticeTests: practiceTests.map(t => t._id),
            reason
        },
        { upsert: true, new: true }
    );

    return recommendation;
};
