import { Grade, Subject } from '../types';

export const COMMON_TOPICS: Record<Subject, string[]> = {
    [Subject.Math]: [
        'Addition & Subtraction',
        'Multiplication Tables',
        'Division Basics',
        'Fractions & Decimals',
        'Geometry & Shapes',
        'Measurement & Time',
        'Word Problems',
        'Place Value',
        'Money Math',
        'Patterns & Algebra'
    ],
    [Subject.Reading]: [
        'Phonics & Decoding',
        'Reading Comprehension',
        'Vocabulary Building',
        'Main Idea & Details',
        'Fact vs. Opinion',
        'Story Elements',
        'Making Inferences',
        'Spelling Patterns',
        'Sight Words',
        'Context Clues'
    ],
    [Subject.Writing]: [
        'Sentence Structure',
        'Punctuation & Grammar',
        'Creative Storytelling',
        'Opinion Writing',
        'Informational Reports',
        'Letter Writing',
        'Parts of Speech',
        'Spelling & Phonics',
        'Handwriting Practice',
        'Editing & Revising'
    ],
    [Subject.Science]: [
        'The Solar System',
        'Plants & Life Cycles',
        'Animals & Habitats',
        'Weather & Seasons',
        'The Human Body',
        'Force & Motion',
        'States of Matter',
        'Rocks & Minerals',
        'Oceans & Sea Life',
        'Energy & Electricity'
    ],
    [Subject.History]: [
        'Ancient Civilizations',
        'World Geography',
        'Famous Explorers',
        'The American Revolution',
        'Presidents & Leaders',
        'Cultural Traditions',
        'Community & Heroes',
        'Maps & Globes',
        'Inventions & Changes',
        'Important Documents'
    ]
};

export const getTopicsForGrade = (grade: Grade, subject: Subject): string[] => {
    // For now, we return the common topics, but we could customize per grade
    return COMMON_TOPICS[subject] || [];
};
