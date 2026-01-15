import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding database with NCERT structure...')

    console.log('Synchronizing database with NCERT structure...')

    // 1. Identification of IDs or unique fields is crucial for upsert
    // We will keep the cleanup for syllabus-related data to ensure it's fresh,
    // but WE WILL NOT delete students or their progress if possible.
    // However, to ensure a clean sync of the syllabus, we'll keep the module/chapter cleanup.

    // Safety: Do not delete users or their specific results if we want persistence.
    // await prisma.submission.deleteMany();
    // await prisma.homework.deleteMany();
    // await prisma.quizResult.deleteMany();
    // await prisma.quiz.deleteMany();
    // await prisma.progress.deleteMany();

    // We only clean syllabus-related structural data to refresh it
    await prisma.chapter.deleteMany();
    await prisma.module.deleteMany();
    await prisma.course.deleteMany();

    // DO NOT delete students
    // await prisma.user.deleteMany({ where: { role: "STUDENT" } });

    // UPSERT Clusters instead of deleting them
    // 3. Create Admin Teacher FIRST
    const hashedPassword = await hash('password123', 10)
    const teacher = await prisma.user.upsert({
        where: { email: "teacher@school.com" },
        update: {},
        create: {
            email: "teacher@school.com",
            name: "Head Teacher",
            password: hashedPassword,
            role: "TEACHER"
        }
    });
    console.log("Teacher created/found:", teacher.id);

    // 2. Define NCERT Data Structure
    const standards = Array.from({ length: 12 }, (_, i) => (i + 1).toString()); // ["1", "2", ..., "12"]

    // --- CLASS 1 DATA ---
    const class1Syllabus = [
        {
            subject: "English",
            chapters: [
                { title: "A Happy Child", content: "Feelings and family.", subtopics: ["Identifying Feelings", "Simple Emotions", "Coloring My World", "My Family Tree"] },
                { title: "Three Little Pigs", content: "Story about safety.", subtopics: ["Building Houses", "Wolf Character", "Straw, Wood, and Brick", "Safety Basics"] },
                { title: "After a Bath", content: "Hygiene.", subtopics: ["Drying Myself", "Wiping Fingers", "Toe and Knee Care", "Daily Hygiene"] },
                { title: "The Bubble, the Straw and the Shoe", content: "A story of teamwork.", subtopics: ["Meeting Friends", "Crossing the River", "Teamwork Skills", "Floating and Sinking"] },
                { title: "Lalu and Peelu", content: "Friendship story.", subtopics: ["Chicks and Colors", "Red and Yellow Fruits", "Helping Friends", "Caring Habits"] },
                { title: "Mittu and the Yellow Mango", content: "Story about birds.", subtopics: ["Parrots and Mangoes", "Clever Crows", "Balloons and Beaks", "Observation Skills"] },
                { title: "Circle", content: "Shapes story.", subtopics: ["Drawing Circles", "Balloons vs Circles", "Lines and Curves", "Geometric Play"] },
                { title: "Our Tree", content: "Nature story.", subtopics: ["Planting a Seed", "Leaves and Fruits", "Birds in Trees", "Nature Love"] },
                { title: "The Tiger and the Mosquito", content: "Fable.", subtopics: ["Animals in the Forest", "Mosquito Bites", "Humility", "Intelligence Basics"] }
            ]
        },
        {
            subject: "Mathematics",
            chapters: [
                { title: "Shapes and Space", content: "Geometry basics.", subtopics: ["Inside and Outside", "Bigger and Smaller", "Top and Bottom", "Rolling and Sliding", "2D Shapes", "3D Solids"] },
                { title: "Numbers (1–9)", content: "Counting basics.", subtopics: ["Counting Objects", "Writing Numerals", "Zero Concept", "Comparing Numbers", "Number Sequence"] },
                { title: "Addition", content: "Basic addition.", subtopics: ["Adding One More", "Simple Sums (1-9)", "Adding with Objects", "Number Pairs"] },
                { title: "Subtraction", content: "Basic subtraction.", subtopics: ["Taking Away", "Subtraction with Pictures", "Zero after Subtraction", "Missing Numbers"] },
                { title: "Numbers (10–20)", content: "Counting 10-20.", subtopics: ["Grouping in Tens", "Tens and Ones", "Writing 11-20", "Order of Numbers"] },
                { title: "Time", content: "Time basics.", subtopics: ["Morning and Evening", "Daily Activities", "Sequence of Events", "Morning Habits"] },
                { title: "Measurement", content: "Measuring things.", subtopics: ["Longer and Shorter", "Taller and Shorter", "Heavier and Lighter", "Non-standard Units"] }
            ]
        },
        {
            subject: "EVS",
            chapters: [
                { title: "Family", content: "My family.", subtopics: ["Family Members", "Helping at Home", "Spending Time Together", "Respecting Elders"] },
                { title: "Food", content: "What we eat.", subtopics: ["Fruits and Vegetables", "Meals of the Day", "Healthy Eating", "Milk and Grains"] },
                { title: "Water", content: "Water usage.", subtopics: ["Sources of Water", "Uses of Water", "Saving Water", "Clean Water"] },
                { title: "Shelter", content: "Where we live.", subtopics: ["Rooms in a House", "Keeping House Clean", "Types of Houses", "Safety at Home"] },
                { title: "Plants and Animals", content: "Nature around us.", subtopics: ["Common Plants", "Pet Animals", "Farm Animals", "Insects and Birds"] },
                { title: "Work and Play", content: "Daily life.", subtopics: ["Outdoor Games", "Indoor Games", "Community Helpers", "School Routine"] }
            ]
        }
    ];

    // --- CLASS 2 DATA ---
    const class2Syllabus = [
        {
            subject: "English",
            chapters: [
                { title: "First Day at School", content: "School emotions.", subtopics: ["New Friends", "Classroom Activity", "Bag and Books", "Teacher Introduction"] },
                { title: "I Am Lucky", content: "Self-esteem.", subtopics: ["Butterfly Wings", "Elephant Trunk", "Fish and Sea", "Gratitude Practice"] },
                { title: "The Wind and the Sun", content: "Fable.", subtopics: ["Power Struggle", "Blowing Hard", "Shining Bright", "Gentleness vs Force"] },
                { title: "Storm in the Garden", content: "Nature observation.", subtopics: ["Snail and Ants", "Rain and Wind", "Lightning and Thunder", "Garden Insects"] },
                { title: "Zoo Manners", content: "Behavior.", subtopics: ["Camel Hump", "Chimpanzee Smile", "Penguin Stride", "Kindness to Animals"] },
                { title: "Funny Bunny", content: "Humorous story.", subtopics: ["Falling Sky", "King's Palace", "Fox and Rabbit", "Critical Thinking"] },
                { title: "Mr Nobody", content: "Poem.", subtopics: ["Broken Plates", "Squeaking Doors", "Responsibility", "Confession"] },
                { title: "The Grasshopper and the Ant", content: "Fable.", subtopics: ["Summer Song", "Winter Store", "Hard Work Habits", "Planning Ahead"] }
            ]
        },
        {
            subject: "Mathematics",
            chapters: [
                { title: "Shapes and Patterns", content: "Geometry.", subtopics: ["Straight and Curved Lines", "Edges and Corners", "Tangrams", "Tiling Patterns", "Symmetry Basics"] },
                { title: "Numbers up to 1000", content: "Place value.", subtopics: ["Hundreds, Tens, Ones", "Expanded Form", "Comparing Numbers", "Descending and Ascending", "Counting in Groups"] },
                { title: "Addition & Subtraction", content: "Operations.", subtopics: ["Regrouping", "Carrying Over", "Borrowing (Tens)", "Real-life Sums", "Mental Math"] },
                { title: "Measurement", content: "Measuring.", subtopics: ["Metres and Centimetres", "Kilograms and Grams", "Litres and Millilitres", "Measuring Tools"] },
                { title: "Time", content: "Clock.", subtopics: ["Reading Clock Faces", "Minutes and Hours", "Days of the Week", "Calendar Reading"] },
                { title: "Money", content: "Currency.", subtopics: ["Identifying Notes/Coins", "Basic Change", "Shopping Math", "Saving Money"] },
                { title: "Data Handling", content: "Graphs.", subtopics: ["Collecting Info", "Pictographs", "Counting Tallies", "Reading Charts"] }
            ]
        },
        {
            subject: "EVS",
            chapters: [
                { title: "My Family", content: "Family unit.", subtopics: ["Nuclear vs Joint Family", "Family Tree", "Roles in Family", "Ancestors"] },
                { title: "My Body", content: "Human body.", subtopics: ["Internal Organs", "Brain and Heart", "Skeleton", "Keeping Fit"] },
                { title: "Food", content: "Nutrition basics.", subtopics: ["Food Groups", "Cooking Methods", "Kitchen Safety", "Avoiding Waste"] },
                { title: "Water", content: "Water.", subtopics: ["Cycle of Water", "Purifying Water", "Rainwater Harvesting", "Agriculture Use"] },
                { title: "Houses", content: "Housing.", subtopics: ["Pucca and Kutcha Houses", "Materials Used", "Stilt and Igloo", "Mobile Homes"] },
                { title: "Clothes", content: "Clothing.", subtopics: ["Cotton vs Wool", "Silk and Jute", "Uniforms", "Traditional Wear"] },
                { title: "Plants", content: "Plant life.", subtopics: ["Herbs and Shrubs", "Roots and Shoots", "Seed Germination", "Forest Importance"] },
                { title: "Animals", content: "Animal life.", subtopics: ["Animal Habitiats", "Herbivores vs Carnivores", "Extinct Animals", "Endangered Species"] }
            ]
        }
    ];

    // --- CLASS 3 DATA ---
    const class3Syllabus = [
        {
            subject: "English",
            chapters: [
                { title: "The Magic Garden", content: "Fantasy.", subtopics: ["Flowers and Fairies", "Talking Birds", "Sunshine and Rain", "Garden Description"] },
                { title: "Nina and the Baby Sparrows", content: "Compassion.", subtopics: ["Wedding Plans", "Baby Birds' Needs", "Kindness to Animals", "Observing Nature"] },
                { title: "The Enormous Turnip", content: "Teamwork story.", subtopics: ["Planting Seeds", "Pulling Together", "Helping Others", "Vegetable Benefits"] },
                { title: "A Little Fish Story", content: "Sea life.", subtopics: ["Life Under Water", "Being Content", "Escaping the Net", "Courage and Size"] },
                { title: "The Yellow Butterfly", content: "Nature story.", subtopics: ["Catching Butterflies", "Spider Web Rescue", "Flower Colors", "Nature Observation"] },
                { title: "The Story of the Road", content: "Daily life.", subtopics: ["Morning Sounds", "Traffic Signs", "Village Scenes", "Road Safety"] },
                { title: "Little Tiger, Big Tiger", content: "Wildlife.", subtopics: ["Forest Life", "Mother Tiger's Care", "Growing Up", "Hunter Instincts"] },
                { title: "My Silly Sister", content: "Family story.", subtopics: ["Playful Siblings", "Simple Jokes", "Family Love", "Childhood Innocence"] }
            ]
        },
        {
            subject: "Mathematics",
            chapters: [
                { title: "Place Value", content: "Numbers.", subtopics: ["Numbers up to 10,000", "Face Value vs Place Value", "Abacus Representation", "Odd and Even Numbers", "Number Names"] },
                { title: "Addition & Subtraction", content: "Word problems.", subtopics: ["3-digit Operations", "Borrowing and Carrying", "Estimating Sums", "Real-life Problems", "Checking Answers"] },
                { title: "Multiplication", content: "Basics.", subtopics: ["Repeated Addition", "Multiplication Tables (1-10)", "Multiplying by 10 and 100", "Lattice Multiplication"] },
                { title: "Division", content: "Basics.", subtopics: ["Equal Sharing", "Divisor and Dividend", "Relation with Multiplication", "Simple Long Division"] },
                { title: "Measurement", content: "Units.", subtopics: ["Measuring with Ruler", "Grams and Kilograms", "Litres and Millilitres", "Converting Units"] },
                { title: "Time", content: "Telling time.", subtopics: ["Reading Minutes", "A.M. and P.M.", "Calendar Events", "Duration of Activities"] },
                { title: "Data Handling", content: "Charts.", subtopics: ["Tally Marks", "Bar Graphs", "Smart Charts", "Interpreting Data"] }
            ]
        },
        {
            subject: "EVS",
            chapters: [
                { title: "Poonam’s Day Out", content: "Animals.", subtopics: ["Animal Classification", "Crawling vs Walking", "Animal Sounds", "Forest Exploration"] },
                { title: "Water O’ Water", content: "Water.", subtopics: ["Sources of Water", "Forms of Water", "Water Conservation", "Importance for Life"] },
                { title: "Our First School", content: "Family.", subtopics: ["Learning from Family", "Family Customs", "Relationships", "Helping Elders"] },
                { title: "Foods We Eat", content: "Food.", subtopics: ["Regional Cuisines", "Plant vs Animal Food", "Healthy Habits", "Cooking Basics"] },
                { title: "Saying Without Speaking", content: "Communication.", subtopics: ["Sign Language", "Facial Expressions", "Mudras", "Empathy Basics"] },
                { title: "Flying High", content: "Birds.", subtopics: ["Bird Beaks", "Feathers and Flight", "Bird Habitats", "Bird Calls"] },
                { title: "From Here to There", content: "Transport.", subtopics: ["Land, Air, and Water", "Public Transport", "Evolution of Vehicles", "Travel Safety"] },
                { title: "Work We Do", content: "Jobs.", subtopics: ["Essential Services", "Tools Used", "Dignity of Labour", "Professional Skills"] }
            ]
        }
    ];

    // --- CLASS 4 DATA ---
    const class4Syllabus = [
        {
            subject: "English",
            chapters: [
                { title: "Wake Up!", content: "Poem.", subtopics: ["Early Morning Nature", "Birds and Bees", "Waking Up Habits", "Poetic Rhyme"] },
                { title: "Neha’s Alarm Clock", content: "Routine.", subtopics: ["Importance of Time", "Internal Alarm Clock", "Persistence", "Consistency"] },
                { title: "The Little Fir Tree", content: "Self-acceptance.", subtopics: ["Appreciating Self", "Wishes and Consequences", "Nature Wisdom", "Endurance"] },
                { title: "Why?", content: "Poem.", subtopics: ["Spirit of Inquiry", "General Knowledge", "Reasoning Skills", "Observation"] },
                { title: "Helen Keller", content: "Biography.", subtopics: ["Overcoming Challenges", "Sign Language", "Teacher's Role", "Determination"] }
            ]
        },
        {
            subject: "Mathematics",
            chapters: [
                { title: "Large Numbers", content: "Big numbers.", subtopics: ["5 and 6 Digit Numbers", "Indian Number System", "Successor and Predecessor", "Rounding Off", "Number Comparison"] },
                { title: "Multiplication & Division", content: "Operations.", subtopics: ["Large Number Multiplication", "Division with Remainders", "Mental Math Shortcuts", "Unitary Method"] },
                { title: "Fractions", content: "Basics.", subtopics: ["Proper and Improper", "Equivalent Fractions", "Comparing Fractions", "Real-world Fractions"] },
                { title: "Decimals", content: "Intro.", subtopics: ["Tenths and Hundredths", "Linking with Fractions", "Decimal Addition", "Money Decimals"] },
                { title: "Geometry", content: "Shapes.", subtopics: ["Types of Angles", "Ray and Line segment", "Polygons Basics", "Circle Properties"] },
                { title: "Area & Perimeter", content: "Mensuration.", subtopics: ["Perimeter of Shapes", "Area using Squares", "Formula for Rectangle", "Practical Measuring"] },
                { title: "Data Handling", content: "Stats.", subtopics: ["Bar Charts", "Pie Charts Intro", "Frequency Tables", "Interpreting Graphs"] }
            ]
        },
        {
            subject: "EVS",
            chapters: [
                { title: "Going to School", content: "School.", subtopics: ["Bridges and Tunnels", "Trolley and Vallam", "Difficult Terrains", "Right to Education"] },
                { title: "The Story of Amrita", content: "Environment.", subtopics: ["Khejadi Trees", "Community Protection", "Wildlife Safety", "Historical Movements"] },
                { title: "Changing Families", content: "Social.", subtopics: ["New Members", "Migration", "Marriage Customs", "Family Support"] },
                { title: "A River’s Tale", content: "Water.", subtopics: ["River Pollution", "Drinking Water Safety", "Aquatic Life", "Water Cycle"] },
                { title: "From Market to Home", content: "Food supply.", subtopics: ["Journey of Vegetables", "Seasonal Foods", "Storage Methods", "Local Markets"] },
                { title: "Food and Fun", content: "Eating.", subtopics: ["Cooking Together", "Mid-day Meals", "Boarding Schools", "Sharing Food"] },
                { title: "The World in My Home", content: "Diversity.", subtopics: ["Cultural Differences", "Gender Equality", "Conflict Resolution", "Respecting Views"] }
            ]
        }
    ];

    // --- CLASS 5 DATA ---
    const class5Syllabus = [
        {
            subject: "English",
            chapters: [
                { title: "Ice-Cream Man", content: "Poem.", subtopics: ["Summer Flavours", "Joy of Childhood", "Descriptive Writing", "Rhyming Patterns"] },
                { title: "Teamwork", content: "Poem.", subtopics: ["Benefits of Unity", "Shared Goals", "Relay Race Example", "Poetic Imagery"] },
                { title: "Flying Together", content: "Story.", subtopics: ["Wise Old Goose", "Unity and Strength", "Listening to Elders", "Strategic Thinking"] },
                { title: "Robinson Crusoe", content: "Adventure.", subtopics: ["Castaway Survival", "Discovery of Footprint", "Resourcefulness", "Observation Skills"] },
                { title: "Rip Van Winkle", content: "Story.", subtopics: ["Falling Asleep", "Awakening to Change", "Time Perception", "Village Life"] },
                { title: "Who Will Be Ningthou?", content: "Story from Manipur.", subtopics: ["Leadership Qualities", "Environmental Love", "Justice and Fairness", "Cultural Heritage"] }
            ]
        },
        {
            subject: "Mathematics",
            chapters: [
                { title: "Large Numbers", content: "More operations.", subtopics: ["International System", "Millions and Billions", "Mental Arithmetic", "Estimation and Approx"] },
                { title: "Fractions", content: "Maths.", subtopics: ["Addition of Fractions", "Subtraction of Fractions", "Multiplication with Wholes", "Real-world Applications"] },
                { title: "Decimals", content: "Decimals.", subtopics: ["Tenths to thousandths", "Decimal Comparison", "Addition and Subtraction", "Linked with Money/Centi"] },
                { title: "Geometry", content: "Shapes.", subtopics: ["Right, Acute, Obtuse", "Degree Concept", "Protractor Use", "Symmetry in Nature"] },
                { title: "Area & Perimeter", content: "Mensuration.", subtopics: ["Area of Composite Shapes", "Square Grid Method", "Problem Solving", "Unit Conversion"] },
                { title: "Data Handling", content: "Graphs.", subtopics: ["Bar Graphs Advanced", "Pie Chart Basics", "Data Interpretation", "Random Events/Prob"] }
            ]
        },
        {
            subject: "EVS",
            chapters: [
                { title: "Super Senses", content: "Animals.", subtopics: ["Amazing Eyesight", "Sense of Smell", "Animal Hearing", "Sleeping and Waking"] },
                { title: "From Tasting to Digesting", content: "Body.", subtopics: ["Tongue and Taste", "The Stomach's Secret", "Digestive System", "Balanced Diet"] },
                { title: "Seeds and Seeds", content: "Plants.", subtopics: ["Seed Dispersal", "Germination Process", "Seed Varieties", "Farmer's Life"] },
                { title: "Every Drop Counts", content: "Water.", subtopics: ["Traditional Storage", "Water Conservation", "Rainwater Harvesting", "Pollution Basics"] },
                { title: "Sunita in Space", content: "Space.", subtopics: ["Living in Zero Gravity", "Earth from Space", "Space Travel Prep", "Constellations"] },
                { title: "What if it Finishes", content: "Resources.", subtopics: ["Fuel Consumption", "Renewable Energy", "Saving Petrol", "Future Sources"] },
                { title: "When the Earth Shook", content: "Disasters.", subtopics: ["Earthquake Safety", "Community Relief", "Understanding Richter", "Rebuilding Lives"] },
                { title: "Whose Forests", content: "Environment.", subtopics: ["Adivasi Rights", "Biodiversity", "Protecting Jungles", "Ecological Balance"] }
            ]
        }
    ];

    // --- CLASS 6 DATA ---
    const class6Syllabus = [
        {
            subject: "English",
            chapters: [
                { title: "Who Did Patrick’s Homework", content: "Responsibility.", subtopics: ["Self-Reliance", "The Secret of the Elf", "Habit Formation", "Intrinsic Motivation"] },
                { title: "How the Dog Found Himself a New Master", content: "Story.", subtopics: ["Evolution of Loyalty", "Survival Instincts", "Hierarchy in Nature", "Domestication History"] },
                { title: "Taro’s Reward", content: "Moral story.", subtopics: ["Filial Piety", "Dignity of Labour", "Magic Waterfall", "Selfless Character"] },
                { title: "An Indian–American Woman in Space", content: "Biography.", subtopics: ["Kalpana Chawla's Journey", "NASA Challenges", "Inspiration for Youth", "Space Shuttle Columbia"] },
                { title: "A Different Kind of School", content: "Empathy.", subtopics: ["Understanding Disability", "Learning by Doing", "Humanity Lessons", "Inclusion Ethics"] },
                { title: "Who I Am", content: "Identity.", subtopics: ["Diverse Interests", "Personality Types", "Dreaming Big", "Unique Talents"] },
                { title: "Fair Play", content: "Justice.", subtopics: ["Panchayat Wisdom", "Friendship vs Truth", "Conflict Resolution", "Honesty in Trials"] },
                { title: "A Game of Chance", content: "Moral.", subtopics: ["Trap of Gambling", "Logic vs Luck", "Consumer Awareness", "Rational Decisions"] },
                { title: "Desert Animals", content: "Nature.", subtopics: ["Water Saving Hacks", "Nocturnal Life", "Cactus and Camels", "Extreme Adaptation"] },
                { title: "The Banyan Tree", content: "Nature.", subtopics: ["Cobra and Mongoose Fight", "Tree Ecosystem", "Childhood Memories", "Natural Selection Basics"] }
            ]
        },
        {
            subject: "Mathematics",
            chapters: [
                { title: "Knowing Our Numbers", content: "Numbers.", subtopics: ["Indian vs International", "Estimation of Sums", "Roman Numerals", "Brackets Use", "Large Scale Math"] },
                { title: "Whole Numbers", content: "Number line.", subtopics: ["Predecessor/Successor", "Properties of Addition", "Closure and Commutative", "Number Patterns"] },
                { title: "Playing with Numbers", content: "Factors.", subtopics: ["Divisibility Rules", "Prime Factorisation", "HCF and LCM Tools", "Sieve of Eratosthenes"] },
                { title: "Basic Geometrical Ideas", content: "Geometry.", subtopics: ["Points and Planes", "Curves and Polygons", "Angle Anatomy", "Circle Dimensions"] },
                { title: "Understanding Elementary Shapes", content: "Shapes.", subtopics: ["Measuring Segments", "Right vs Straight Angles", "Classification of Triangles", "3D Solid Nets"] },
                { title: "Integers", content: "Integers.", subtopics: ["Negative Number Line", "Adding Inverses", "Algebraic Sums", "Ordering Integers"] },
                { title: "Fractions", content: "Fractions.", subtopics: ["Mixed and Improper", "Simplest Form", "Likeness and Comparison", "Fractional Addition"] },
                { title: "Decimals", content: "Decimals.", subtopics: ["Place Value Graph", "Money and Length", "Interpreting Scales", "Logic of Hundredths"] },
                { title: "Data Handling", content: "Graphs.", subtopics: ["Recording Observation", "Pictograph Creation", "Bar Graph Scaling", "Finding the Mean"] },
                { title: "Mensuration", content: "Area.", subtopics: ["Perimeter of Regular Shapes", "Area by Counting Squares", "Rectangle/Square Formula", "Practical Layouts"] },
                { title: "Algebra", content: "Algebra.", subtopics: ["Matchstick Patterns", "Variable Concept", "Expressions in Words", "Equation Solving Basics"] },
                { title: "Ratio and Proportion", content: "Ratios.", subtopics: ["Comparing Quantities", "Simplest Ratio", "Unitary Method", "Proportional Reasoning"] },
                { title: "Symmetry", content: "Symmetry.", subtopics: ["Line of Symmetry", "Mirror Reflection", "Design Symmetries", "Nature's Balance"] },
                { title: "Practical Geometry", content: "Construction.", subtopics: ["Circles and Bisectors", "Perpendicular Lines", "Angle Construction 60/120", "Using Ruler/Compass"] }
            ]
        },
        {
            subject: "Science",
            chapters: [
                { title: "Food: Where Does It Come From", content: "Food sources.", subtopics: ["Plant Parts as Food", "Animal Products", "Herbivore/Carnivore/Omnivore", "Food Chain Intro"] },
                { title: "Components of Food", content: "Nutrition.", subtopics: ["Starch/Protein/Fat Tests", "Vitamins and Minerals", "Dietary Fibre & Water", "Deficiency Risks"] },
                { title: "Fibre to Fabric", content: "Materials.", subtopics: ["Ginning and Spinning", "Weaving and Knitting", "Natural vs Synthetic", "History of Clothing"] },
                { title: "Sorting Materials into Groups", content: "Chemistry.", subtopics: ["Appearance & Lustre", "Hardness and Solubility", "Transparency/Opaque", "Floating vs Sinking"] },
                { title: "Separation of Substances", content: "Separation.", subtopics: ["Winnowing & Sieving", "Sedimentation", "Evaporation & Condensation", "Saturated Solutions"] },
                { title: "Changes Around Us", content: "Changes.", subtopics: ["Physical vs Chemical", "Expansion on Heating", "Reversible Processes", "Melting and Boiling"] },
                { title: "Getting to Know Plants", content: "Botany.", subtopics: ["Stem and Leaf Functions", "Root Systems (Tap/Fibrous)", "Flower Anatomy", "Transpiration Process"] },
                { title: "Body Movements", content: "Biology.", subtopics: ["Hinged and Ball-Socket", "Skeleton Structure", "Muscle Contraction", "Gait of Animals"] },
                { title: "The Living Organisms and Their Surroundings", content: "Habitat.", subtopics: ["Biotic and Abiotic", "Adaptation in Oceans", "Desert Life Resilience", "Acclimatization"] },
                { title: "Motion and Measurement of Distances", content: "Physics.", subtopics: ["SI Units Standard", "Periodic vs Rectilinear", "Rotational Motion", "Measuring Curved Lines"] },
                { title: "Light, Shadows and Reflections", content: "Physics.", subtopics: ["Luminous Objects", "Pinhole Camera", "Mirror Reflection Laws", "Shadow Formation"] },
                { title: "Electricity and Circuits", content: "Electricity.", subtopics: ["Electric Cell & Bulb", "Closed/Open Circuits", "Switch Function", "Safety Insulation"] },
                { title: "Fun with Magnets", content: "Magnets.", subtopics: ["Poles and Attraction", "Magnetic Materials", "Making Own Magnets", "Compass Navigation"] },
                { title: "Water", content: "Resource.", subtopics: ["Water Cycle Steps", "Transpiration in Air", "Flood and Drought", "Conservation Methods"] },
                { title: "Air Around Us", content: "Chemistry.", subtopics: ["Nitrogen/Oxygen Ratio", "Atmospheric Pressure", "Importance for Life", "Dust and Smoke"] },
                { title: "Garbage In, Garbage Out", content: "Environment.", subtopics: ["Composting/Vermicomposting", "Plastic: Boon or Curse", "Recycling Paper", "Waste Segregation"] }
            ]
        },
        {
            subject: "Social Studies",
            chapters: [
                { title: "History: What, Where, How and When", content: "Intro.", subtopics: ["Manuscripts and Inscriptions", "Archaeological Evidence", "Dates in History (BC/AD)", "Early River Civilizations"] },
                { title: "History: On the Trail of the Earliest People", content: "Early man.", subtopics: ["Hunter-Gatherers", "Stone Tool Tech", "Discovery of Fire", "Cave Paintings"] },
                { title: "History: From Gathering to Growing Food", content: "Farming.", subtopics: ["Domestication", "Neolithic Revolution", "First Villages", "Invention of Wheel"] },
                { title: "History: In the Earliest Cities", content: "Civilization.", subtopics: ["Harappan Citadel", "Drainage Systems", "Terracotta Toys", "Trade and Scripts"] },
                { title: "History: What Books and Burials Tell Us", content: "Culture.", subtopics: ["Rigveda Hymns", "Megalithic Burials", "Social Differences", "Ancient Medical Science"] },
                { title: "History: Kingdoms, Kings and an Early Republic", content: "Politics.", subtopics: ["Ashvamedha Sacrifice", "Varna System", "Janapadas/Mahajanapadas", "Magadha and Vajji"] },
                { title: "Geography: The Earth in the Solar System", content: "Astronomy.", subtopics: ["Celestial Bodies", "Constellations", "The Sun and Planets", "Earth's Unique Moon"] },
                { title: "Geography: Globes: Latitudes and Longitudes", content: "Mapping.", subtopics: ["Prime Meridian", "Heat Zones of Earth", "Standard Time Zones", "Grid System"] },
                { title: "Geography: Motions of the Earth", content: "Rotation.", subtopics: ["Circle of Illumination", "Revolution and Seasons", "Summer/Winter Solstice", "Equinox Phenomena"] },
                { title: "Geography: Maps", content: "Cartography.", subtopics: ["Symbols and Legends", "Cardinal Directions", "Scaling and Distance", "Thematic Maps"] },
                { title: "Civics: Understanding Diversity", content: "Society.", subtopics: ["Ladakh vs Kerala", "Unity in Diversity", "Cultural Influence", "Personal Identity"] },
                { title: "Civics: Diversity and Discrimination", content: "Society.", subtopics: ["Stereotypes & Prejudice", "Caste Inequality", "Constitution Rights", "Struggle for Freedom"] },
                { title: "Civics: What is Government?", content: "Politics.", subtopics: ["Levels of Government", "Laws and People", "Representative Democracy", "Suffrage Movement"] },
                { title: "Civics: Key Elements of a Democratic Government", content: "Democracy.", subtopics: ["Participation & Protest", "Conflict Resolution", "Equality and Justice", "South Africa Case Study"] },
                { title: "Civics: Panchayati Raj", content: "Local gov.", subtopics: ["Gram Sabha/Panchayat", "Zila Parishad", "Sources of Funds", "Women in Leadership"] }
            ]
        }
    ];

    // --- CLASS 7 DATA ---
    const class7Syllabus = [
        {
            subject: "English",
            chapters: [
                { title: "Three Questions", content: "Wisdom.", subtopics: ["The King's Dilemma", "Hermit's Lesson", "Right Time and People", "Moral Decision"] },
                { title: "A Gift of Chappals", content: "Kindness.", subtopics: ["Stray Kittens", "Music Teacher's Feet", "Impulsive Giving", "Childhood Compassion"] },
                { title: "Gopal and the Hilsa Fish", content: "Wit.", subtopics: ["Hilsa Fever", "Clever Disguise", "Court Wit", "Challenging the King"] },
                { title: "The Ashes That Made Trees Bloom", content: "Honesty.", subtopics: ["Greedy Neighbors", "Dog's Spirit", "Cherry Blossom Mystery", "Kindness Rewarded"] },
                { title: "Quality", content: "Craftsmanship.", subtopics: ["Gessler Brothers", "Passion for Shoes", "Legacy vs Efficiency", "Art of Shoemaking"] },
                { title: "Expert Detectives", content: "Mystery.", subtopics: ["Mr. Nath's Scars", "Nishad vs Maya", "Collecting Clues", "Sibling Logic"] },
                { title: "The Invention of Vita-Wonk", content: "Sci-fi.", subtopics: ["Mr. Willy Wonka", "Ancient Tree Sap", "Time Travel Formula", "Exaggerated Science"] },
                { title: "Fire: Friend and Foe", content: "Science.", subtopics: ["Chemistry of Fire", "Extinguishers", "Historical Fire Uses", "Safety Precautions"] },
                { title: "A Bicycle in Good Repair", content: "Humor.", subtopics: ["Over-repairing", "Mechanical Disaster", "Sarcastic Narrative", "Ball Bearing Chaos"] },
                { title: "The Story of Cricket", content: "Sports.", subtopics: ["Village Origins", "Test Match History", "Equipment Evolution", "Modern TV Influence"] }
            ]
        },
        {
            subject: "Mathematics",
            chapters: [
                { title: "Integers", content: "Numbers.", subtopics: ["Operator Priority", "Multiplication Rules", "BODMAS in Algebra", "Absolute Value"] },
                { title: "Fractions and Decimals", content: "Math.", subtopics: ["Reciprocal Finding", "Decimal Multiplication", "Division by 10/100", "Part-Whole Problems"] },
                { title: "Data Handling", content: "Stats.", subtopics: ["Range and Averages", "Double Bar Graphs", "Finding Mode/Median", "Probability Odds"] },
                { title: "Simple Equations", content: "Algebra.", subtopics: ["Transpose Method", "LHS vs RHS balance", "Wordage to Equation", "Solving for X"] },
                { title: "Lines and Angles", content: "Geometry.", subtopics: ["Linear Pair", "Transversal Angles", "Parallel Lines Logic", "Complementary Pairs"] },
                { title: "The Triangle and Its Properties", content: "Geometry.", subtopics: ["Exterior Angle Sum", "Pythagoras Theorem", "Inequality Property", "Median and Altitude"] },
                { title: "Congruence of Triangles", content: "Geometry.", subtopics: ["SSS and SAS Criteria", "ASA and RHS Rules", "CPCT Concept", "Identical Shapes"] },
                { title: "Comparing Quantities", content: "Ratio.", subtopics: ["Profit and Loss %", "Simple Interest (PRT)", "Unitary Conversions", "Fractional Comparison"] },
                { title: "Rational Numbers", content: "Numbers.", subtopics: ["Standard Form", "Rationals on Line", "Comparing Rationals", "Math Operations"] },
                { title: "Practical Geometry", content: "Construction.", subtopics: ["Parallel Lines", "Triangles (SAS/SSS)", "Using Set Squares", "Geometric Accuracy"] },
                { title: "Perimeter and Area", content: "Mensuration.", subtopics: ["Area of Parallelogram", "Circle Circumference", "Area of Triangle (1/2bh)", "Unit Squares"] },
                { title: "Algebraic Expressions", content: "Algebra.", subtopics: ["Terms and Factors", "Like and Unlike Terms", "Addition/Subtraction", "Value Substitution"] },
                { title: "Exponents and Powers", content: "Math.", subtopics: ["Laws of Exponents", "Standard Notation", "Zero Power Rule", "Multiplying Bases"] },
                { title: "Symmetry", content: "Geometry.", subtopics: ["Rotational Symmetry", "Order of Rotation", "Reflective Design", "Center of Rotation"] },
                { title: "Visualising Solid Shapes", content: "Geometry.", subtopics: ["Drawing 3D on 2D", "Nets and Cross-sections", "Euler's Formula Basics", "Isometric Sketches"] }
            ]
        },
        {
            subject: "History",
            chapters: [
                { title: "Tracing Changes Through a Thousand Years", content: "Medieval.", subtopics: ["Cartography Evolving", "New Terminology", "Records and Archives", "Social/Political Change"] },
                { title: "New Kings and Kingdoms", content: "Kings.", subtopics: ["Chola Administration", "Land Grants", "Warfare for Wealth", "Prashastis Creation"] },
                { title: "The Delhi Sultans", content: "Sultans.", subtopics: ["The Slave Dynasty", "Khaljis and Tughluqs", "Expansion Policy", "Administration Style"] },
                { title: "The Mughal Empire", content: "Mughals.", subtopics: ["Babur and Akbar", "Mansabdari System", "Zabt and Zamindars", "Aurangzeb's Deccan"] },
                { title: "Rulers and Buildings", content: "Architecture.", subtopics: ["Temple Engineering", "Garden Tombs", "Fortification Styles", "Regional Influence"] },
                { title: "Towns, Traders and Craftspersons", content: "Trade.", subtopics: ["Hampi and Surat", "Guild Systems", "Inland and Sea Trade", "Craft of Bidriware"] },
                { title: "Tribes, Nomads and Settled Communities", content: "Tribes.", subtopics: ["Gonds and Ahoms", "Mobile Traders", "Varna to Caste", "Tribal Leadership"] },
                { title: "Devotional Paths to the Divine", content: "Religion.", subtopics: ["Bhakti Movement", "Sufism Philosophy", "Shikh Tradition", "Alvars and Nayanars"] },
                { title: "The Making of Regional Cultures", content: "Culture.", subtopics: ["The Cheras/Malayalam", "Jagannatha Cult", "Rajput Valour", "Kathak Evolution"] },
                { title: "Eighteenth-Century Political Formations", content: "Politics.", subtopics: ["Independent States", "The Maratha Power", "Sikh Militancy", "Hyderabad/Awadh"] }
            ]
        },
        {
            subject: "Science",
            chapters: [
                { title: "Nutrition in Plants", content: "Biology.", subtopics: ["Photosynthesis Logic", "Insectivorous Plants", "Saprotrophs/Fungi", "Symbiosis in Lichens"] },
                { title: "Nutrition in Animals", content: "Biology.", subtopics: ["Human Digestion Path", "Ruminants' Stomach", "Amoeba Feeding", "Energy Absorption"] },
                { title: "Fibre to Fabric", content: "Chemistry.", subtopics: ["Wool from Animals", "Life History of Silk", "Sericulture Process", "Selective Breeding"] },
                { title: "Heat", content: "Physics.", subtopics: ["Conduction/Convection", "Radiation Theory", "Sea Breeze/Land Breeze", "Clinical Thermometer"] },
                { title: "Acids, Bases and Salts", content: "Chemistry.", subtopics: ["Natural Indicators", "Litmus and Turmeric", "Neutralization Lab", "Everyday Acid Base"] },
                { title: "Physical and Chemical Changes", content: "Chemistry.", subtopics: ["Rusting and Galvanizing", "Crystallisation", "Magnesium Ribbon", "Reaction in Vinegar"] },
                { title: "Weather, Climate and Adaptations", content: "Biology.", subtopics: ["Polar Bear Adaptation", "Tropical Rainforest", "Bird Migration", "Predicting Weather"] },
                { title: "Winds, Storms and Cyclones", content: "Geog.", subtopics: ["Air Pressure Effects", "High Speed Wind Logic", "Thunderstorm Safety", "Cyclone Structure"] },
                { title: "Soil", content: "Geog.", subtopics: ["Soil Profile/Horizons", "Types of Soil (Loamy)", "Water Absorption", "Soil and Crops"] },
                { title: "Respiration in Organisms", content: "Biology.", subtopics: ["Aerobic vs Anaerobic", "How We Breathe (Lungs)", "Muscle Cramps/Lactic", "Breathing in Insects"] },
                { title: "Transportation in Animals and Plants", content: "Biology.", subtopics: ["Circulatory System", "Kidney Function", "Xylem and Phloem", "Stomata Movement"] },
                { title: "Reproduction in Plants", content: "Biology.", subtopics: ["Budding and Spores", "Pollination (Cross/Self)", "Seed and Fruit Intro", "Vegetative Growth"] },
                { title: "Motion and Time", content: "Physics.", subtopics: ["Slow vs Fast Motion", "Simple Pendulum (Time)", "Odometer/Speedometer", "Distance-Time Graph"] },
                { title: "Electric Current and Its Effects", content: "Physics.", subtopics: ["Circuit Symbols", "Heating Effect (Fuse)", "Magnetic Effect Study", "Electromagnet DIY"] },
                { title: "Light", content: "Physics.", subtopics: ["Rectilinear Prop", "Spherical Mirrors (CV)", "Newton's Disc (Colors)", "Lenses Image Logic"] },
                { title: "Water: A Precious Resource", content: "Env.", subtopics: ["Underground Depletion", "Drip Irrigation", "Bawris Tradition", "Global Scarcity"] },
                { title: "Forests: Our Lifeline", content: "Env.", subtopics: ["Food Web/Chains", "Crown and Canopy", "Decomposers/Humus", "Dynamic Living Entity"] },
                { title: "Wastewater Story", content: "Env.", subtopics: ["Sewage Treatment", "Sanitation at Public", "Alternative Disposal", "Cleaning Water"] }
            ]
        }
    ];

    // --- CLASS 8 DATA ---
    const class8Syllabus = [
        {
            subject: "English",
            chapters: [
                { title: "The Best Christmas Present in the World", content: "War story.", subtopics: ["Trench Life 1914", "Jim and Hans Wolf", "Human Connection", "Christmas Truce"] },
                { title: "The Tsunami", content: "Disaster.", subtopics: ["Andaman/Thailand", "Ignesious Story", "Animal Instincts", "Tilly Smith Logic"] },
                { title: "Glimpses of the Past", content: "History.", subtopics: ["The Company's Quest", "Ram Mohan Roy", "First War of Indep", "Colonial Oppression"] },
                { title: "Bepin Choudhury’s Lapse of Memory", content: "Story.", subtopics: ["The Ranchi Trip", "Chunnilal's Trick", "Psychology of Fear", "Prankster Justice"] },
                { title: "The Summit Within", content: "Adventure.", subtopics: ["Everest Expedition", "Spiritual Climb", "Internal Peaks", "Major Ahluwalia"] },
                { title: "This is Jody’s Fawn", content: "Nature.", subtopics: ["Compassion for Orphan", "Penny and Doc Wilson", "Responsibility", "Forest Search"] },
                { title: "A Visit to Cambridge", content: "Inspiration.", subtopics: ["Stephen Hawking", "Firdaus Kanga", "Physical Disability", "Soulful Dialogue"] },
                { title: "A Short Monsoon Diary", content: "Nature.", subtopics: ["Ruskin Bond's Musings", "Leopards and Cobra", "Mountain Mist", "Seasons of Hills"] },
                { title: "The Great Stone Face", content: "Moral.", subtopics: ["The Prophecy", "Ernest's Humility", "Spirit of Nature", "True Greatness"] }
            ]
        },
        {
            subject: "Mathematics",
            chapters: [
                { title: "Rational Numbers", content: "Numbers.", subtopics: ["Additive Inverse", "Density Property", "Commutativity", "Simplifying Expressions"] },
                { title: "Linear Equations in One Variable", content: "Algebra.", subtopics: ["Solving Brackets", "Variables on Sides", "Age-related Problems", "Reducing to Linear"] },
                { title: "Understanding Quadrilaterals", content: "Geometry.", subtopics: ["Sum of Ext Angles", "Parallelogram Laws", "Special Quads (Rhombus)", "Diagonal Properties"] },
                { title: "Practical Geometry", content: "Construction.", subtopics: ["Quads (SSS/SAS)", "Special Case Parall", "Construction Ethics", "Using Geometry Box"] },
                { title: "Data Handling", content: "Stats.", subtopics: ["Frequency Dist", "Histograms", "Central Angle (Circle)", "Probability Chance"] },
                { title: "Squares and Square Roots", content: "Math.", subtopics: ["Pythagorean Triplets", "Division Method", "Estimating Roots", "Pattern Discovery"] },
                { title: "Cubes and Cube Roots", content: "Math.", subtopics: ["Hardy-Ramanujan", "Prime Factorisation", "Grouping in Triples", "Smallest Mult Search"] },
                { title: "Comparing Quantities", content: "Math.", subtopics: ["CP, SP and VAT/Tax", "Compound Interest", "Depreciation Loss", "Unitary Proportion"] },
                { title: "Algebraic Expressions and Identities", content: "Algebra.", subtopics: ["Standard Identity I-IV", "Binomial x Trinomial", "Coefficient Values", "Area Application"] },
                { title: "Visualising Solid Shapes", content: "Geometry.", subtopics: ["Vertex/Edge/Face", "Euler's Polyhedra", "Views - Plan/Elev", "Mapping Spaces"] },
                { title: "Mensuration", content: "Math.", subtopics: ["Area of Trapezium", "Surface Area (Cyl)", "Volume Expansion", "Practical Estimation"] },
                { title: "Exponents and Powers", content: "Math.", subtopics: ["Negative Exponents", "Scientific Notation", "Comparing Small Nos", "Laws Application"] },
                { title: "Direct and Inverse Proportions", content: "Math.", subtopics: ["Variation Graphs", "Reciprocal Relation", "Real-world Ratios", "Consistency Constant"] },
                { title: "Factorisation", content: "Algebra.", subtopics: ["Common Factors", "Regrouping Terms", "Identity Factorise", "Division of Algeb"] },
                { title: "Introduction to Graphs", content: "Graphs.", subtopics: ["Coordinate Plane", "Linear Graphs", "Independent Variables", "Reading Trend Lines"] },
                { title: "Playing with Numbers", content: "Math.", subtopics: ["Digit Puzzles", "Divisibility by 9/11", "Magic Squares", "Base 10 Logic"] }
            ]
        },
        {
            subject: "Science",
            chapters: [
                { title: "Crop Production and Management", content: "Bio.", subtopics: ["Traditional Tools", "Irrigation Methods", "Manure vs Fertilisers", "Silos Storage"] },
                { title: "Microorganisms: Friend and Foe", content: "Bio.", subtopics: ["Nitrogen Fixation", "Commercial Uses", "Pathogens in Human", "Food Preservatives"] },
                { title: "Synthetic Fibres and Plastics", content: "Chem.", subtopics: ["Rayon and Nylon", "Polyester/Acrylic", "Thermoplastics", "Environment Impact"] },
                { title: "Materials: Metals and Non-metals", content: "Chem.", subtopics: ["Malleability/Ductility", "Reactions with Acids", "Metal Reactivity", "Uses in Life"] },
                { title: "Coal and Petroleum", content: "Resources.", subtopics: ["Fossil Fuel Origin", "Coke and Coal Gas", "Fractional Distilling", "Resource Depletion"] },
                { title: "Combustion and Flame", content: "Chem.", subtopics: ["Ignition Temp", "Flame Structure", "Fuel Efficiency", "Global Warming CO2"] },
                { title: "Conservation of Plants and Animals", content: "Bio.", subtopics: ["Deforestation Causes", "Biosphere Reserves", "Endemic Species", "Red Data Book"] },
                { title: "Cell – Structure and Functions", content: "Bio.", subtopics: ["Discovery (Hooke)", "Organelle - Nucleus", "Plant vs Animal Cell", "Complexity Levels"] },
                { title: "Reproduction in Animals", content: "Bio.", subtopics: ["Sexual vs Asexual", "Vivi/Oviparous", "Cloning (Dolly)", "Life Cycles (Frog)"] },
                { title: "Reaching the Age of Adolescence", content: "Bio.", subtopics: ["Puberty Changes", "Endocrine Glands", "Role of Hormones", "Mental Wellbeing"] },
                { title: "Force and Pressure", content: "Physics.", subtopics: ["Contact Forces", "Magnetic/Gravity", "Liquid Pressure", "Atmospheric Impact"] },
                { title: "Friction", content: "Physics.", subtopics: ["Static vs Sliding", "Rolling Lubricants", "Wear and Tear", "Safety Applications"] },
                { title: "Sound", content: "Physics.", subtopics: ["Heard by Ear", "Amplitude/Freq", "Noise Pollution", "Human Voice Box"] },
                { title: "Chemical Effects of Electric Current", content: "Chem.", subtopics: ["Electroplating", "Conduction in Liquids", "LED Indicators", "Chemical Changes"] },
                { title: "Some Natural Phenomena", content: "Physics.", subtopics: ["Static Electricity", "Lightning Conductor", "Seismic Waves", "Safety Measures"] },
                { title: "Light", content: "Physics.", subtopics: ["Diffused Reflection", "Regular Reflection", "Blind Spot/Retina", "Braille System"] },
                { title: "Stars and the Solar System", content: "Physics.", subtopics: ["Moon Phases", "Constellation Orion", "The Eight Planets", "Artificial Satellites"] },
                { title: "Pollution of Air and Water", content: "Env.", subtopics: ["CFCs and Ozone", "Greenhouse Effect", "Potable Water", "River Cleanup (Ganga)"] }
            ]
        },
        {
            subject: "Social Studies",
            chapters: [
                { title: "History: How, When and Where", content: "Intro.", subtopics: ["Periodisation", "Census and Surveys", "Colonial Records", "Official Archives"] },
                { title: "History: From Trade to Territory", content: "British.", subtopics: ["Battle of Plassey", "Doctrine of Lapse", "Company Army", "EIC in India"] },
                { title: "History: Ruling the Countryside", content: "Colonialism.", subtopics: ["Permanent Settlement", "Ryotwari System", "Indigo Rebellion", "Revenue Cycles"] },
                { title: "History: Tribals, Dikus and the Vision of a Golden Age", content: "Tribals.", subtopics: ["Birsa Munda Revolt", "Jhum Cultivation", "Forest Laws", "Colonial Impact"] },
                { title: "History: When People Rebel", content: "1857.", subtopics: ["Sepoy Mutiny", "Nana Saheb & Rani", "Aftermath Policy", "Public Resistance"] },
                { title: "Geography: Resources", content: "Resources.", subtopics: ["Utility and Value", "Human Made Items", "Sustainability", "Conservation Goals"] },
                { title: "Geography: Land, Soil, Water", content: "Resources.", subtopics: ["Land Use Patterns", "Vej and Wildlife", "Water Scarcity", "Soil Formation"] },
                { title: "Geography: Agriculture", content: "Farming.", subtopics: ["Subsistence Farming", "Commercial Crops", "Fibers and Grains", "Green Revolution"] },
                { title: "Geography: Industries", content: "Industry.", subtopics: ["Classification", "Location Factors", "TISCO and IT", "Industrial Hazards"] },
                { title: "Civics: The Indian Constitution", content: "Law.", subtopics: ["Framing History", "Fundamental Rights", "Secularism Goal", "Parliamentary Form"] },
                { title: "Civics: Understanding Secularism", content: "Society.", subtopics: ["Indian vs Western", "Protection of Minor", "Intervention Policy", "Freedom of Religion"] },
                { title: "Civics: Why Do We Need a Parliament?", content: "Politics.", subtopics: ["People's Choice", "Role of MP", "Question Hour", "Coalition Gov"] },
                { title: "Civics: Judiciary", content: "Law.", subtopics: ["Structure of Courts", "Civil vs Criminal", "PIL Power", "Access to Justice"] },
                { title: "Civics: Law and Social Justice", content: "Law.", subtopics: ["Minimum Wages", "Bhopal Gas Tragedy", "Worker Protection", "Consumer Rights"] }
            ]
        }
    ];

    // --- CLASS 9 DATA ---
    const class9Syllabus = [
        {
            subject: "English",
            chapters: [
                { title: "The Fun They Had", content: "Sci-fi.", subtopics: ["Margie and Tommy", "Mechanical Teacher", "Real Books Concept", "Future of Education"] },
                { title: "The Sound of Music", content: "Bio.", subtopics: ["Evelyn Glennie", "Bismillah Khan", "Overcoming Deafness", "Shehnai History"] },
                { title: "The Little Girl", content: "Family.", subtopics: ["Kezia's Fear", "Father's True Heart", "Nightmare Episode", "Parent-Child Bonding"] },
                { title: "A Truly Beautiful Mind", content: "Einstein.", subtopics: ["Patent Office Years", "Special Relativity", "Humanitarian Efforts", "Early Genius Signs"] },
                { title: "My Childhood", content: "Kalam.", subtopics: ["Rameswaram Days", "Secular Friendships", "Science Teacher's Wife", "Breaking Barriers"] },
                { title: "Poem: The Road Not Taken", content: "Poem.", subtopics: ["Decision Making", "Individuality", "Ambiguity of Choice", "Symbolic Divergence"] },
                { title: "Poem: Wind", content: "Poem.", subtopics: ["Strength and Power", "Resilience Building", "Friendship with Fire", "Metaphorical Wind"] }
            ]
        },
        {
            subject: "Mathematics",
            chapters: [
                { title: "Number Systems", content: "Numbers.", subtopics: ["Irrational Existence", "Real No expansion", "Rationalising Denoms", "Laws for Real Bases"] },
                { title: "Polynomials", content: "Algebra.", subtopics: ["Remainder Theorem", "Factor Theorem", "Algebraic Identities", "Zeroes and Roots"] },
                { title: "Coordinate Geometry", content: "Graph.", subtopics: ["Cartesian System", "Quadrants Logic", "Plotting (x,y)", "Linear Correlation"] },
                { title: "Linear Equations in Two Variables", content: "Algebra.", subtopics: ["Solution of Equation", "Graph of ax+by+c=0", "Equations parallel axis", "Formulating Problems"] },
                { title: "Introduction to Euclid’s Geometry", content: "Geometry.", subtopics: ["Axioms vs Postulates", "Parallel Postulate", "Equivalent Versions", "Logical Proofs"] },
                { title: "Lines and Angles", content: "Geometry.", subtopics: ["Adjacent/Linear Pair", "Parallel/Transversal", "Triangle Angle Sum", "Exterior Angle Prop"] },
                { title: "Triangles", content: "Geometry.", subtopics: ["SAS vs ASA Criteria", "SSS/RHS Conditions", "Inequalities in Tri", "Isosceles Properties"] },
                { title: "Quadrilaterals", content: "Geometry.", subtopics: ["Angle Sum Property", "Parallelogram Laws", "Mid-point Theorem", "Properties for Proving"] },
                { title: "Areas of Parallelograms and Triangles", content: "Geometry.", subtopics: ["Same Base Parallel", "Area Comparison", "Practical Derivation", "Area Postulates"] },
                { title: "Circles", content: "Geometry.", subtopics: ["Chord and Distance", "Angle by Arc", "Cyclic Quadrilateral", "Equal Chord Axioms"] },
                { title: "Constructions", content: "Geometry.", subtopics: ["Perpendicular Bisect", "Angle 60/45/90", "Triangles - Given Side", "Geometric Logic"] },
                { title: "Heron’s Formula", content: "Mensuration.", subtopics: ["Area of Triangle", "Area of Quads", "Semiperimeter (s)", "Complexity Problems"] },
                { title: "Surface Areas and Volumes", content: "Mensuration.", subtopics: ["Cone and Sphere", "Hemisphere Metrics", "Comparing Volumes", "Curved Surface Area"] },
                { title: "Statistics", content: "Stats.", subtopics: ["Frequency Polygons", "Measures of Centre", "Mean/Median/Mode", "Grouped Data Intro"] },
                { title: "Probability", content: "Stats.", subtopics: ["Empirical Prob", "Trial and Event", "Expected outcomes", "Experimental Logic"] }
            ]
        },
        {
            subject: "Science",
            chapters: [
                { title: "Motion", content: "Physics.", subtopics: ["Distance vs Displace", "Acceleration Logic", "Eqs of Motion Graph", "Uniform Circular"] },
                { title: "Force and Laws of Motion", content: "Physics.", subtopics: ["Inertia and Mass", "Newton's Second Law", "Action and Reaction", "Cons of Momentum"] },
                { title: "Gravitation", content: "Physics.", subtopics: ["Universal Law (G)", "Free Fall (g)", "Mass vs Weight", "Pressure in Fluids"] },
                { title: "Work and Energy", content: "Physics.", subtopics: ["Kinetic Energy (1/2mv2)", "Potential Energy (mgH)", "Cons of Energy Law", "Power and Units"] },
                { title: "Sound", content: "Physics.", subtopics: ["Wave Propagation", "Echo/Reverberation", "Human Ear Structure", "Ultrasound Uses"] },
                { title: "Matter in Our Surroundings", content: "Chem.", subtopics: ["States Particles", "Evaporation Cooling", "Latent Heat Study", "Diffusion in Gases"] },
                { title: "Is Matter Around Us Pure", content: "Chem.", subtopics: ["Solution Concentration", "Separation Funnel", "Chromatography", "Physical/Chem Change"] },
                { title: "Atoms and Molecules", content: "Chem.", subtopics: ["Combined Laws", "Dalton's Theory", "The Mole Concept", "Writing Formulas"] },
                { title: "Structure of the Atom", content: "Chem.", subtopics: ["Bohr's Atomic Model", "Valency and Shells", "Isotopes vs Isobars", "Subatomic Particles"] },
                { title: "Life Processes", content: "Bio.", subtopics: ["Photosynthesis Chem", "Human Metabolism", "Cellular Respiration", "Excretion Basics"] },
                { title: "Tissues", content: "Bio.", subtopics: ["Meristematic (Plant)", "Connective (Animal)", "Muscle/Nervous Tissue", "Xylem/Phloem Detail"] },
                { title: "Diversity in Living Organisms", content: "Bio.", subtopics: ["Kingdom Monera/Prot", "Plant Classification", "Animal Kingdom Phyla", "Binomial Nomenclat"] },
                { title: "Why Do We Fall Ill", content: "Bio.", subtopics: ["Acute vs Chronic", "Infectious Means", "Immune Response", "Vax and Prevention"] },
                { title: "Natural Resources", content: "Env.", subtopics: ["Nitrogen/Carbon Cyc", "Greenhouse/Acid Rain", "Soil Erosion Factors", "Ozone Depletion"] },
                { title: "Improvement in Food Resources", content: "Env.", subtopics: ["Crop Varieties", "Poultry/Fishery", "Bee Keeping (Apis)", "Organic Farming"] }
            ]
        },
        {
            subject: "Social Studies",
            chapters: [
                { title: "Hist: French Revolution", content: "History.", subtopics: ["Estate System", "Robespierre Terror", "Napoleon's Rise", "Women in Revolution"] },
                { title: "Hist: Socialism in Europe", content: "History.", subtopics: ["Russian Revolution", "Liberals vs Radicals", "Lenin's April Thesis", "Stalin's Collectivise"] },
                { title: "Hist: Nazism and Hitler", content: "History.", subtopics: ["Weimar Republic", "Hitler's Propaganda", "Youth in Nazi Ger", "The Holocaust"] },
                { title: "Geog: India – Size and Location", content: "Geography.", subtopics: ["Standard Meridian", "Neighbouring States", "Geographic Extent", "Latitudinal Impact"] },
                { title: "Geog: Physical Features of India", content: "Geography.", subtopics: ["Himalayan Ranges", "Northern Plains", "Peninsular Plateau", "Thar and Islands"] },
                { title: "Geog: Drainage", content: "Geography.", subtopics: ["Himalayan Rivers", "Peninsular Rivers", "Lake Ecosystems", "Pollution Control"] },
                { title: "Geog: Climate", content: "Geography.", subtopics: ["Monsoon Mechanism", "Jet Streams", "Rainfall Dist", "Seasons Cycle"] },
                { title: "Geog: Natural Vegetation", content: "Geography.", subtopics: ["Tropical Evergreen", "Montane Forests", "Wildlife Reserves", "Medicinal Plants"] },
                { title: "Geog: Population", content: "Geography.", subtopics: ["Density and Dist", "Growth Rates", "Age Composition", "National Policy"] },
                { title: "Civics: What is Democracy?", content: "Civics.", subtopics: ["Rule of Law", "Free/Fair Election", "Arguments For/Against", "Broader Meaning"] },
                { title: "Civics: Constitutional Design", content: "Civics.", subtopics: ["South Africa Path", "Preamble Values", "Drafting Committee", "Amendments Case"] },
                { title: "Civics: Electoral Politics", content: "Civics.", subtopics: ["Voter's List", "Campaign Ethics", "EC Power/Role", "Reserved Constit"] },
                { title: "Civics: Working of Institutions", content: "Civics.", subtopics: ["Mandal Commission", "Parl Powers (LS/RS)", "Executive - PM", "Judicial Review"] },
                { title: "Civics: Democratic Rights", content: "Civics.", subtopics: ["Guantanamo Bay", "Fundamental Rights", "Expanding Scope", "Redressal Means"] }
            ]
        }
    ];

    // --- CLASS 10 DATA ---
    const class10Syllabus = [
        {
            subject: "English",
            chapters: [
                { title: "A Letter to God", content: "Faith.", subtopics: ["Lencho's Crop Loss", "Postmaster's Act", "Ironic Ending", "Man vs Faith"] },
                { title: "Nelson Mandela: Long Walk to Freedom", content: "Freedom.", subtopics: ["Apartheid History", "The Inauguration", "Twin Obligations", "Courage Definition"] },
                { title: "Two Stories About Flying", content: "Courage.", subtopics: ["First Flight (Seagull)", "Black Aeroplane", "Fear and Success", "Inner Strength"] },
                { title: "From the Diary of Anne Frank", content: "History.", subtopics: ["Secret Annexe", "Kitty (The Diary)", "Jewish Persecution", "School Life Notes"] },
                { title: "The Hundred Dresses", content: "Bullying.", subtopics: ["Wanda Petronski", "Maddie's Guilt", "Sketching Contest", "Dignity in Silence"] },
                { title: "Poem: Dust of Snow", content: "Poem.", subtopics: ["Positive Outlook", "Hemlock and Crow", "Mood Transformation", "Symbolism of Nature"] },
                { title: "Poem: Fire and Ice", content: "Poem.", subtopics: ["Desire and Hatred", "Global Destruction", "Robert Frost's Style", "Metaphoric End"] },
                { title: "Poem: A Tiger in the Zoo", content: "Poem.", subtopics: ["Captivity vs Wild", "Patrolling Cars", "Stalking in Cage", "Animal Rights Theme"] }
            ]
        },
        {
            subject: "Mathematics",
            chapters: [
                { title: "Real Numbers", content: "Math.", subtopics: ["HCF/LCM Fundamental", "Irrationality Proof", "Decimal Expansion", "Euclid Division (Old)"] },
                { title: "Polynomials", content: "Algebra.", subtopics: ["Geometrical Zeroes", "Zero/Coefficient Rel", "Division Algorithm", "Quadratic Factors"] },
                { title: "Pair of Linear Equations in Two Variables", content: "Algebra.", subtopics: ["Graphical Consistency", "Substitution Method", "Elimination Method", "Comp. Reduction"] },
                { title: "Quadratic Equations", content: "Algebra.", subtopics: ["Discriminant Nature", "Quadratic Formula", "Factorising Roots", "Word Application"] },
                { title: "Arithmetic Progressions", content: "Algebra.", subtopics: ["n-th term Formula", "Sum of First n", "Common Difference", "Practical Sequences"] },
                { title: "Triangles", content: "Geometry.", subtopics: ["BPT (Thales Theorem)", "AAA/SSS Similarity", "Pythagoras Proof", "Area Similarity Th."] },
                { title: "Coordinate Geometry", content: "Math.", subtopics: ["Distance Formula", "Section Formula", "Area of Triangle", "Centroid Logic"] },
                { title: "Trigonometry", content: "Math.", subtopics: ["Ratios (sin/cos)", "Compl. Angle Ratios", "Identities (sin2+cos2)", "Spec Angles (30/45)"] },
                { title: "Circles", content: "Geometry.", subtopics: ["Tangent at Point", "Length of Tangents", "Chord vs Tangent", "Construction Logic"] },
                { title: "Constructions", content: "Geometry.", subtopics: ["Division of Segment", "Pair of Tangents", "Scale Factor Tri", "Geometric Reasoning"] },
                { title: "Areas Related to Circles", content: "Mensuration.", subtopics: ["Sector Area", "Segment Area", "Circle Combination", "Perimeter Length"] },
                { title: "Surface Areas and Volumes", content: "Mensuration.", subtopics: ["Frustum of Cone", "Combination Solids", "Shape Transformation", "Metric Comparison"] },
                { title: "Statistics", content: "Stats.", subtopics: ["Mean Step Deviation", "Modal Class/Value", "Median through Ogive", "Cumulative Stats"] },
                { title: "Probability", content: "Stats.", subtopics: ["Dice and Cards", "Equally Likely", "Compl. Events", "Theoretical Logic"] }
            ]
        },
        {
            subject: "Science",
            chapters: [
                { title: "Light – Reflection and Refraction", content: "Physics.", subtopics: ["Mirror Formula", "Lens Power (Dioptre)", "Index of Refraction", "Ray Diagram Logic"] },
                { title: "Human Eye and the Colourful World", content: "Physics.", subtopics: ["Defects (Myopia)", "Prism Dispersion", "Scattering/Atmosph.", "Tyndall Effect"] },
                { title: "Electricity", content: "Physics.", subtopics: ["Ohm's Law Graph", "Resistance - Series", "Heating Effect (Joules)", "Electric Power (W)"] },
                { title: "Magnetic Effects of Electric Current", content: "Physics.", subtopics: ["Fleming's LH Rule", "Electric Motor (DC)", "Electromag Induc.", "Generator Concept"] },
                { title: "Sources of Energy", content: "Physics.", subtopics: ["Nuclear Fission", "Solar/Wind Tech", "Biogas/Tidal Energy", "Future Options"] },
                { title: "Chemical Reactions and Equations", content: "Chem.", subtopics: ["Balancing Equations", "Redox Reactions", "Exo/Endothermic", "Corrosion/Rancidity"] },
                { title: "Acids, Bases and Salts", content: "Chemistry.", subtopics: ["pH in Daily Life", "Chlor-alkali Proc", "Water of Cryst.", "Bleaching Power/Soda"] },
                { title: "Metals and Non-metals", content: "Chem.", subtopics: ["Ionic Bonding", "Extraction - Calcina", "Refining Metals", "Alloy Properties"] },
                { title: "Carbon and its Compounds", content: "Chem.", subtopics: ["Covalent Bonding", "Versatile Nature", "Homologous Series", "Esterification"] },
                { title: "Life Processes", content: "Bio.", subtopics: ["Nutrition (Digestion)", "Respiration Path", "Heart and Vents", "Excretory System"] },
                { title: "Control and Coordination", content: "Bio.", subtopics: ["Reflex Arc", "Human Brain Parts", "Plant Hormones", "Endocrine - Insulin"] },
                { title: "How do Organisms Reproduce", content: "Bio.", subtopics: ["Fission/Budding", "Sexual Repro Flower", "Human Male/Female", "Contraception Meth"] },
                { title: "Heredity and Evolution", content: "Bio.", subtopics: ["Mendel's Laws", "Sex Determination", "Speciation Factors", "Homologous Organs"] },
                { title: "Environment", content: "Env.", subtopics: ["Ecological Pyramid", "Trophic Levels", "Ozone Layer Hole", "Biomagnification"] },
                { title: "Management of Natural Resources", content: "Env.", subtopics: ["Narmada Bachao", "Chipko Movement", "Rethink/Refuse", "Sustainability Policy"] }
            ]
        },
        {
            subject: "Social Studies",
            chapters: [
                { title: "Hist: Nationalism in Europe", content: "History.", subtopics: ["Greek War of Indep", "Unification of Ita/Ger", "Balkan Conflict", "Liberal Nationalism"] },
                { title: "Hist: Nationalism in India", content: "History.", subtopics: ["Khilafat Movement", "Salt March (Dandi)", "Poona Pact", "Sense of Belonging"] },
                { title: "Hist: The Making of a Global World", content: "History.", subtopics: ["Silk Routes", "Rinderpest Impact", "Indian Indentured", "Bretton Woods Inst"] },
                { title: "Hist: The Age of Industrialisation", content: "History.", subtopics: ["Gomasthas Role", "Hand Labour/Steam", "Factory System", "Advertisements"] },
                { title: "Hist: Print Culture", content: "History.", subtopics: ["Manuscripts (In)", "Gutenberg Printing", "Vernacular Act", "Print and Reform"] },
                { title: "Geog: Resources and Development", content: "Geography.", subtopics: ["Soil Classification", "Land Degradation", "Rio Summit 1992", "Resource Planning"] },
                { title: "Geog: Forest and Wildlife Resources", content: "Geography.", subtopics: ["Project Tiger", "Vulnerable Species", "Joint Forest Mgmt", "Sacred Groves"] },
                { title: "Geog: Water Resources", content: "Geography.", subtopics: ["Multipurpose Dams", "Rooftop Harvesting", "River Interlinking", "Scarcity Myths"] },
                { title: "Geog: Agriculture", content: "Geography.", subtopics: ["Slash and Burn", "Techno-Inst Reform", "Food Security Buff", "Kisan Credit Card"] },
                { title: "Geog: Minerals and Energy Resources", content: "Geography.", subtopics: ["Placer Deposits", "Ferrous vs Non-Fer", "Non-Conv Energy", "Conservation Need"] },
                { title: "Geog: Manufacturing Industries", content: "Geography.", subtopics: ["Agglomeration Econ", "Sugar/Iron Ind.", "IT & Electronics", "Pollution Control"] },
                { title: "Geog: Lifelines of National Economy", content: "Geography.", subtopics: ["Golden Quadrilat", "Airways/Inland Wat", "Telecom/Trade", "Tourism as Trade"] },
                { title: "Civics: Power Sharing", content: "Civics.", subtopics: ["Belgium Model", "Sri Lanka Majorit", "Prudential Reason", "Horizontal/Vertical"] },
                { title: "Civics: Federalism", content: "Civics.", subtopics: ["Tiered Government", "Language Policy", "Decentralisation", "Coalition Impact"] },
                { title: "Civics: Democracy and Diversity", content: "Civics.", subtopics: ["Mexico Olympics", "Civil Rights USA", "Social Divisions", "Political Outcomes"] },
                { title: "Civics: Gender, Religion and Caste", content: "Civics.", subtopics: ["Feminist Movement", "Communalism Quest", "Caste in Politics", "Secular State"] },
                { title: "Civics: Popular Struggles and Movements", content: "Civics.", subtopics: ["Nepal's Democracy", "Bolivia Water War", "Pressure Groups", "Mobilisation Path"] },
                { title: "Civics: Political Parties", content: "Civics.", subtopics: ["National vs State", "7 Major Parties", "Challenges to Parties", "Reform Measures"] },
                { title: "Civics: Outcomes of Democracy", content: "Civics.", subtopics: ["Economic Growth", "Social Diversity", "Dignity/Freedom", "Transparency"] },
                { title: "Civics: Challenges to Democracy", content: "Civics.", subtopics: ["Foundational Chall", "Expansion Chall", "Deepening Chall", "Political Reform"] }
            ]
        }
    ];

    // Generic subjects for other classes
    const primarySubjects = ["Mathematics", "English", "Hindi", "EVS"];
    const middleSubjects = ["Mathematics", "Science", "Social Science", "English", "Hindi"];
    const secondarySubjects = ["Mathematics", "Science", "Social Science", "English", "Hindi"];
    const seniorSubjects = ["Physics", "Chemistry", "Mathematics", "Biology", "English", "Computer Science"];

    for (const std of standards) {
        console.log(`Seeding Class ${std}...`);

        const courseTitle = `Class ${std} Curriculum`;

        // Prepare modules based on Standard
        let modulesData: any[] = [];
        let specificSyllabus: any[] | null = null;

        if (std === "1") specificSyllabus = class1Syllabus;
        else if (std === "2") specificSyllabus = class2Syllabus;
        else if (std === "3") specificSyllabus = class3Syllabus;
        else if (std === "4") specificSyllabus = class4Syllabus;
        else if (std === "5") specificSyllabus = class5Syllabus;
        else if (std === "6") specificSyllabus = class6Syllabus;
        else if (std === "7") specificSyllabus = class7Syllabus;
        else if (std === "8") specificSyllabus = class8Syllabus;
        else if (std === "9") specificSyllabus = class9Syllabus;
        else if (std === "10") specificSyllabus = class10Syllabus;

        if (specificSyllabus) {
            // Apply Specific Data
            modulesData = specificSyllabus.map((s: any) => ({
                title: s.subject,
                chapters: {
                    create: s.chapters.map((c: any) => ({
                        title: c.title,
                        content: c.content || `Chapter content for ${c.title}`,
                        difficulty: "Medium",
                        subtopics: JSON.stringify(c.subtopics || [])
                    }))
                }
            }));
        } else {
            // Generic Data for other classes (11-12)
            let subjects: string[] = [];
            const stdNum = parseInt(std);
            if (stdNum <= 5) subjects = primarySubjects;
            else if (stdNum <= 8) subjects = middleSubjects;
            else if (stdNum <= 10) subjects = secondarySubjects;
            else subjects = seniorSubjects;

            modulesData = subjects.map((sub, i) => ({
                title: sub, // Module Title = Subject Name
                chapters: {
                    create: [
                        { title: "Chapter 1: Introduction", content: "Basics...", difficulty: "Easy", subtopics: JSON.stringify(["Basic Concepts", "Overview"]) },
                        { title: "Chapter 2: Advanced Topics", content: "Advanced...", difficulty: "Medium", subtopics: JSON.stringify(["Deep Dive", "Applications"]) }
                    ]
                }
            }));
        }

        await prisma.course.create({
            data: {
                title: courseTitle,
                description: `NCERT Syllabus for Class ${std}`,
                standard: std,
                modules: {
                    create: modulesData
                }
            }
        });
    }

    // 3. Create Clusters (Renamed as per user request)
    const clusters = [
        {
            name: "Seed",
            description: "Focus on advanced concepts for top performers.",
            schedule: JSON.stringify({
                totalDuration: "90 mins",
                segments: [
                    { time: "10:00 - 10:30", standard: "Class 1", topic: "Math: Numbers & Shapes" },
                    { time: "10:30 - 11:00", standard: "Class 2", topic: "Math: Addition Basics" },
                    { time: "11:00 - 11:30", standard: "Class 3", topic: "Math: Intro to Geometry" }
                ]
            })
        },
        {
            name: "Sapling",
            description: "Reinforcement of core concepts and practice.",
            schedule: JSON.stringify({
                totalDuration: "90 mins",
                segments: [
                    { time: "11:15 - 11:45", standard: "Class 4", topic: "Science: Plants Life" },
                    { time: "11:45 - 12:15", standard: "Class 5", topic: "Science: Human Body" },
                    { time: "12:15 - 12:45", standard: "Class 6", topic: "Science: Magnetism" }
                ]
            })
        },
        {
            name: "Plant",
            description: "Foundational building and gap filling.",
            schedule: JSON.stringify({
                totalDuration: "90 mins",
                segments: [
                    { time: "12:15 - 12:45", standard: "Class 7", topic: "Math: Algebra I" },
                    { time: "12:45 - 01:15", standard: "Class 8", topic: "Math: Linear Equations" },
                    { time: "01:15 - 01:45", standard: "Class 9", topic: "Math: Polynomials" }
                ]
            })
        },
        {
            name: "Tree",
            description: "Intensive support and personalized attention.",
            schedule: JSON.stringify({
                totalDuration: "90 mins",
                segments: [
                    { time: "02:00 - 02:30", standard: "Class 10", topic: "Physics: Light & Optics" },
                    { time: "02:30 - 03:00", standard: "Class 11", topic: "Physics: Kinematics" },
                    { time: "03:00 - 03:30", standard: "Class 12", topic: "Physics: Quantum Mechanics" }
                ]
            })
        }
    ];

    for (const c of clusters) {
        await prisma.cluster.upsert({
            where: { name: c.name },
            update: {
                description: c.description,
                schedule: c.schedule,
                teacherId: teacher.id // Assign teacher
            },
            create: {
                name: c.name,
                description: c.description,
                schedule: c.schedule,
                teacherId: teacher.id // Assign teacher
            }
        });
    }

    // 4. (Teacher moved up)

    // 5. Sample Student
    await prisma.user.upsert({
        where: { email: "student@school.com" },
        update: {
            standard: "10"
        },
        create: {
            email: "student@school.com",
            name: "Rahul Student",
            password: hashedPassword,
            role: "STUDENT",
            standard: "10"
        }
    });

    // Update Rahul to be in "Sapling" for demo
    const sapling = await prisma.cluster.findFirst({ where: { name: "Sapling" } });
    if (sapling) {
        await prisma.user.update({
            where: { email: "student@school.com" },
            data: { clusterId: sapling.id }
        });

        // Add Sample Homework for Sapling (Classes 4, 5, 6)
        await prisma.homework.createMany({
            data: [
                {
                    clusterId: sapling.id,
                    title: "Plant Life Cycle Quiz",
                    description: "Diagram the life cycle of a flowering plant and explain each stage.",
                    standard: "4",
                    points: 10,
                    gradingMode: "SUPERVISED",
                    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                },
                {
                    clusterId: sapling.id,
                    title: "Human Digestion Summary",
                    description: "Write a short summary of how the human digestive system works.",
                    standard: "5",
                    points: 15,
                    gradingMode: "AUTONOMOUS",
                    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
                }
            ]
        });
    }

    console.log("Seeding completed.");
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
