export const mockStudents = [
    {
        id: "1",
        name: "Aarav Sharma",
        email: "aarav.s@example.com",
        skillLevel: "INTERMEDIATE",
        progress: 65,
        activity: [4, 2, 5, 7, 3, 6, 8],
        scores: [
            { quiz: "Real Numbers", score: 80 },
            { quiz: "Polynomials", score: 90 },
            { quiz: "Life Processes", score: 75 },
        ],
        remarks: "Sincere",
        clusterId: "c1"
    },
    {
        id: "2",
        name: "Vivaan Gupta",
        email: "vivaan.g@example.com",
        skillLevel: "BEGINNER",
        progress: 30,
        activity: [1, 0, 2, 1, 3, 0, 2],
        scores: [
            { quiz: "Real Numbers", score: 60 },
            { quiz: "Polynomials", score: 50 },
        ],
        remarks: "Needs Help",
        clusterId: "c2"
    },
    {
        id: "3",
        name: "Aditi Patel",
        email: "aditi.p@example.com",
        skillLevel: "ADVANCED",
        progress: 90,
        activity: [8, 9, 7, 10, 8, 9, 10],
        scores: [
            { quiz: "Real Numbers", score: 95 },
            { quiz: "Polynomials", score: 98 },
            { quiz: "Life Processes", score: 92 },
            { quiz: "Light", score: 88 },
        ],
        remarks: "Excellent",
        clusterId: "c1"
    },
    {
        id: "4",
        name: "Diya Singh",
        email: "diya.s@example.com",
        skillLevel: "INTERMEDIATE",
        progress: 55,
        activity: [3, 4, 3, 5, 4, 3, 5],
        scores: [
            { quiz: "Real Numbers", score: 70 },
            { quiz: "Polynomials", score: 85 },
        ],
        remarks: "Consistent",
        clusterId: "c2"
    },
    {
        id: "5",
        name: "Ishaan Kumar",
        email: "ishaan.k@example.com",
        skillLevel: "BEGINNER",
        progress: 20,
        activity: [0, 1, 0, 1, 0, 1, 0],
        scores: [
            { quiz: "Real Numbers", score: 40 },
        ],
        remarks: "Irregular",
        clusterId: "c2"
    },
    {
        id: "6",
        name: "Vihaan Reddy",
        email: "vihaan.r@example.com",
        skillLevel: "INTERMEDIATE",
        progress: 45,
        activity: [2, 3, 2, 4, 3, 2, 4],
        scores: [
            { quiz: "Real Numbers", score: 55 },
            { quiz: "Polynomials", score: 60 },
        ],
        remarks: "Improving",
        clusterId: "c2"
    },
    {
        id: "7",
        name: "Ananya Verma",
        email: "ananya.v@example.com",
        skillLevel: "BEGINNER",
        progress: 15,
        activity: [1, 0, 1, 0, 1, 0, 1],
        scores: [
            { quiz: "Real Numbers", score: 35 },
        ],
        remarks: "Needs Attention",
        clusterId: "c3"
    },
    {
        id: "8",
        name: "Sai Krishna",
        email: "sai.k@example.com",
        skillLevel: "BEGINNER",
        progress: 25,
        activity: [2, 1, 2, 1, 2, 1, 2],
        scores: [
            { quiz: "Real Numbers", score: 45 },
        ],
        remarks: "Trying",
        clusterId: "c3"
    },
    {
        id: "9",
        name: "Riya Malhotra",
        email: "riya.m@example.com",
        skillLevel: "INTERMEDIATE",
        progress: 50,
        activity: [3, 3, 3, 3, 3, 3, 3],
        scores: [
            { quiz: "Real Numbers", score: 65 },
        ],
        remarks: "Steady",
        clusterId: "c3"
    },
    {
        id: "10",
        name: "Arjun Nair",
        email: "arjun.n@example.com",
        skillLevel: "BEGINNER",
        progress: 10,
        activity: [0, 0, 1, 0, 0, 1, 0],
        scores: [
            { quiz: "Real Numbers", score: 20 },
        ],
        remarks: "At Risk",
        clusterId: "c4"
    },
    {
        id: "11",
        name: "Zara Khan",
        email: "zara.k@example.com",
        skillLevel: "BEGINNER",
        progress: 12,
        activity: [1, 0, 0, 1, 0, 0, 1],
        scores: [
            { quiz: "Real Numbers", score: 25 },
        ],
        remarks: "Needs Help",
        clusterId: "c4"
    },
    {
        id: "12",
        name: "Kabir Das",
        email: "kabir.d@example.com",
        skillLevel: "BEGINNER",
        progress: 18,
        activity: [1, 1, 1, 1, 1, 1, 1],
        scores: [
            { quiz: "Real Numbers", score: 30 },
        ],
        remarks: "Slow Progress",
        clusterId: "c4"
    }
];

export const mockCourses = [
    {
        id: "ncert-10",
        title: "Class 10 - All Subjects",
        description: "NCERT Curriculum for Class 10",
        modules: [
            {
                id: "math",
                title: "Mathematics",
                color: "from-blue-500 to-cyan-400",
                chapters: [
                    {
                        id: "m1",
                        title: "Real Numbers",
                        difficulty: "Easy",
                        youtubeLink: "https://www.youtube.com/watch?v=dummy",
                        subtopics: [
                            { id: "m1s1", title: "Euclid's Division Lemma" },
                            { id: "m1s2", title: "Fundamental Theorem of Arithmetic" },
                            { id: "m1s3", title: "Revisiting Irrational Numbers" }
                        ]
                    },
                    {
                        id: "m2",
                        title: "Polynomials",
                        difficulty: "Medium",
                        youtubeLink: "https://www.youtube.com/watch?v=dummy",
                        subtopics: [
                            { id: "m2s1", title: "Geometrical Meaning of Zeroes" },
                            { id: "m2s2", title: "Relationship between Zeroes and Coefficients" },
                            { id: "m2s3", title: "Division Algorithm for Polynomials" }
                        ]
                    },
                    {
                        id: "m3",
                        title: "Pair of Linear Equations",
                        difficulty: "Medium",
                        youtubeLink: "https://www.youtube.com/watch?v=dummy",
                        subtopics: [
                            { id: "m3s1", title: "Graphical Method of Solution" },
                            { id: "m3s2", title: "Algebraic Methods of Solution" },
                            { id: "m3s3", title: "Equations Reducible to Linear Form" }
                        ]
                    },
                    {
                        id: "m4",
                        title: "Quadratic Equations",
                        difficulty: "Hard",
                        youtubeLink: "https://www.youtube.com/watch?v=dummy",
                        subtopics: [
                            { id: "m4s1", title: "Quadratic Equations" },
                            { id: "m4s2", title: "Solution by Factorisation" },
                            { id: "m4s3", title: "Solution by Completing the Square" }
                        ]
                    },
                    {
                        id: "m5",
                        title: "Arithmetic Progressions",
                        difficulty: "Medium",
                        youtubeLink: "https://www.youtube.com/watch?v=dummy",
                        subtopics: [
                            { id: "m5s1", title: "Arithmetic Progressions" },
                            { id: "m5s2", title: "nth Term of an AP" },
                            { id: "m5s3", title: "Sum of First n Terms" }
                        ]
                    },
                ],
            },
            {
                id: "science",
                title: "Science",
                color: "from-green-500 to-emerald-400",
                chapters: [
                    {
                        id: "s1",
                        title: "Chemical Reactions and Equations",
                        difficulty: "Medium",
                        youtubeLink: "https://www.youtube.com/watch?v=dummy",
                        subtopics: [
                            { id: "s1s1", title: "Chemical Equations" },
                            { id: "s1s2", title: "Types of Chemical Reactions" },
                            { id: "s1s3", title: "Corrosion and Rancidity" }
                        ]
                    },
                    {
                        id: "s2",
                        title: "Acids, Bases and Salts",
                        difficulty: "Medium",
                        youtubeLink: "https://www.youtube.com/watch?v=dummy",
                        subtopics: [
                            { id: "s2s1", title: "Understanding Chemical Properties" },
                            { id: "s2s2", title: "What do all Acids and Bases have in common" },
                            { id: "s2s3", title: "More about Salts" }
                        ]
                    },
                ],
            },
            {
                id: "social",
                title: "Social Science",
                color: "from-orange-500 to-amber-400",
                chapters: [
                    {
                        id: "ss1",
                        title: "The Rise of Nationalism in Europe",
                        difficulty: "Hard",
                        youtubeLink: "https://www.youtube.com/watch?v=dummy",
                        subtopics: [
                            { id: "ss1s1", title: "The French Revolution and the Idea of the Nation" },
                            { id: "ss1s2", title: "The Making of Nationalism in Europe" },
                            { id: "ss1s3", title: "The Age of Revolutions: 1830-1848" }
                        ]
                    },
                ],
            },
            {
                id: "english",
                title: "English",
                color: "from-purple-500 to-pink-400",
                chapters: [
                    {
                        id: "e1",
                        title: "A Letter to God",
                        difficulty: "Easy",
                        youtubeLink: "https://www.youtube.com/watch?v=dummy",
                        subtopics: [
                            { id: "e1s1", title: "Oral Comprehension Check" },
                            { id: "e1s2", title: "Thinking about the Text" },
                            { id: "e1s3", title: "Thinking about Language" }
                        ]
                    },
                ],
            },
        ],
    },
];

export const mockClassPerformance = [
    { name: "Mathematics", avgScore: 72, completed: 65, fill: "#3b82f6" },
    { name: "Science", avgScore: 68, completed: 55, fill: "#10b981" },
    { name: "Social Sci", avgScore: 82, completed: 75, fill: "#f59e0b" },
    { name: "English", avgScore: 88, completed: 90, fill: "#d946ef" },
];

export const mockClusters = [
    {
        id: "c1",
        name: "Cluster A (1-3)",
        description: "Focus on advanced concepts for top performers.",
        studentIds: ["1", "3"],
        color: "from-violet-500 to-purple-500",
        schedule: {
            time: "10:00 AM - 11:00 AM",
            topic: "Quadratic Equations (Advanced)",
            duration: "60 mins",
        },
        checklist: [
            { id: "cl1", task: "Review Quadratic Formula", completed: true },
            { id: "cl2", task: "Solve Word Problems", completed: false },
            { id: "cl3", task: "Introduce Nature of Roots", completed: false },
        ],
        chapterChecklist: [
            { id: "ch1", title: "Real Numbers", completed: true },
            { id: "ch2", title: "Polynomials", completed: true },
            { id: "ch3", title: "Pair of Linear Equations", completed: false },
        ]
    },
    {
        id: "c2",
        name: "Cluster B (4-6)",
        description: "Reinforcement of core concepts and practice.",
        studentIds: ["2", "4", "5", "6"],
        color: "from-pink-500 to-rose-500",
        schedule: {
            time: "11:15 AM - 12:00 PM",
            topic: "Polynomials (Basics)",
            duration: "45 mins",
        },
        checklist: [
            { id: "cl4", task: "Define Polynomials", completed: true },
            { id: "cl5", task: "Identify Terms and Coefficients", completed: true },
            { id: "cl6", task: "Practice Factorization", completed: false },
        ],
        chapterChecklist: [
            { id: "ch1", title: "Real Numbers", completed: true },
            { id: "ch2", title: "Polynomials", completed: false },
            { id: "ch3", title: "Pair of Linear Equations", completed: false },
        ]
    },
    {
        id: "c3",
        name: "Cluster C (7-9)",
        description: "Foundational building and gap filling.",
        studentIds: ["7", "8", "9"],
        color: "from-orange-500 to-amber-500",
        schedule: {
            time: "12:15 PM - 01:00 PM",
            topic: "Real Numbers (Remedial)",
            duration: "45 mins",
        },
        checklist: [
            { id: "cl7", task: "Review Number System", completed: false },
            { id: "cl8", task: "Practice LCM/HCF", completed: false },
        ],
        chapterChecklist: [
            { id: "ch1", title: "Real Numbers", completed: false },
            { id: "ch2", title: "Polynomials", completed: false },
        ]
    },
    {
        id: "c4",
        name: "Cluster D (10-12)",
        description: "Intensive support and personalized attention.",
        studentIds: ["10", "11", "12"],
        color: "from-blue-500 to-cyan-500",
        schedule: {
            time: "02:00 PM - 03:00 PM",
            topic: "Basic Algebra",
            duration: "60 mins",
        },
        checklist: [
            { id: "cl9", task: "Basic Operations", completed: false },
            { id: "cl10", task: "Simple Equations", completed: false },
        ],
        chapterChecklist: [
            { id: "ch1", title: "Real Numbers", completed: false },
        ]
    }
];
