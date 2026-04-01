<?php

namespace Database\Seeders;

use App\Models\Curriculum;
use App\Models\EducationLevel;
use App\Models\Grade;
use App\Models\Subject;
use App\Models\Topic;
use App\Models\Subtopic;
use Illuminate\Database\Seeder;

class CurriculumSeeder extends Seeder
{
    public function run(): void
    {
        $data = $this->getCurriculumData();

        foreach ($data as $curriculumData) {
            $curriculum = Curriculum::create([
                'name' => $curriculumData['name'],
                'code' => $curriculumData['code'],
                'country' => $curriculumData['country'] ?? null,
                'description' => $curriculumData['description'] ?? null,
                'is_active' => true,
                'sort_order' => $curriculumData['sort_order'],
            ]);

            foreach ($curriculumData['levels'] as $levelOrder => $levelData) {
                $level = EducationLevel::create([
                    'curriculum_id' => $curriculum->id,
                    'name' => $levelData['name'],
                    'code' => $levelData['code'],
                    'group_label' => $levelData['group_label'] ?? $curriculumData['name'],
                    'level_order' => $levelOrder,
                    'description' => $levelData['description'] ?? null,
                    'is_active' => true,
                ]);

                // Create grades
                foreach ($levelData['grades'] ?? [] as $gradeOrder => $gradeName) {
                    Grade::create([
                        'education_level_id' => $level->id,
                        'name' => $gradeName,
                        'code' => strtolower(str_replace(' ', '_', $gradeName)),
                        'grade_order' => $gradeOrder,
                        'is_active' => true,
                    ]);
                }

                // Create subjects with topics
                foreach ($levelData['subjects'] as $subjectOrder => $subjectData) {
                    $subject = Subject::create([
                        'education_level_id' => $level->id,
                        'name' => $subjectData['name'],
                        'code' => strtolower(str_replace([' ', '&', '/'], ['_', 'and', '_'], $subjectData['name'])),
                        'short_name' => $subjectData['short_name'] ?? null,
                        'description' => $subjectData['description'] ?? null,
                        'color_hex' => $subjectData['color'] ?? null,
                        'is_active' => true,
                        'sort_order' => $subjectOrder,
                    ]);

                    foreach ($subjectData['topics'] ?? [] as $topicOrder => $topicData) {
                        $topic = Topic::create([
                            'subject_id' => $subject->id,
                            'name' => is_string($topicData) ? $topicData : $topicData['name'],
                            'code' => strtolower(str_replace(' ', '_', is_string($topicData) ? $topicData : $topicData['name'])),
                            'sort_order' => $topicOrder,
                            'is_active' => true,
                        ]);

                        if (is_array($topicData) && isset($topicData['subtopics'])) {
                            foreach ($topicData['subtopics'] as $stOrder => $stName) {
                                Subtopic::create([
                                    'topic_id' => $topic->id,
                                    'name' => $stName,
                                    'code' => strtolower(str_replace(' ', '_', $stName)),
                                    'sort_order' => $stOrder,
                                    'is_active' => true,
                                ]);
                            }
                        }
                    }
                }
            }
        }
    }

    private function getCurriculumData(): array
    {
        return [
            // ── Kenya CBC ────────────────────────────────────────────────────
            [
                'name' => 'Kenya CBC',
                'code' => 'cbc',
                'country' => 'Kenya',
                'description' => 'Competency-Based Curriculum by KICD',
                'sort_order' => 1,
                'levels' => [
                    [
                        'name' => 'CBC Primary',
                        'code' => 'cbc_primary',
                        'group_label' => 'Kenya CBC',
                        'grades' => ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'],
                        'subjects' => [
                            [
                                'name' => 'Mathematics',
                                'short_name' => 'Math',
                                'color' => '#3B82F6',
                                'topics' => [
                                    ['name' => 'Numbers', 'subtopics' => ['Counting', 'Place Value', 'Addition', 'Subtraction', 'Multiplication', 'Division']],
                                    ['name' => 'Measurement', 'subtopics' => ['Length', 'Mass', 'Capacity', 'Time', 'Money']],
                                    ['name' => 'Geometry', 'subtopics' => ['2D Shapes', '3D Shapes', 'Lines and Angles']],
                                    ['name' => 'Data Handling', 'subtopics' => ['Collecting Data', 'Displaying Data', 'Interpreting Data']],
                                ],
                            ],
                            [
                                'name' => 'English',
                                'color' => '#10B981',
                                'topics' => [
                                    ['name' => 'Listening and Speaking', 'subtopics' => ['Oral Communication', 'Pronunciation', 'Vocabulary']],
                                    ['name' => 'Reading', 'subtopics' => ['Phonics', 'Comprehension', 'Fluency']],
                                    ['name' => 'Writing', 'subtopics' => ['Handwriting', 'Spelling', 'Creative Writing', 'Grammar']],
                                    ['name' => 'Grammar', 'subtopics' => ['Parts of Speech', 'Sentence Structure', 'Punctuation']],
                                ],
                            ],
                            [
                                'name' => 'Kiswahili',
                                'color' => '#F59E0B',
                                'topics' => [
                                    ['name' => 'Kusikiliza na Kuzungumza', 'subtopics' => ['Mazungumzo', 'Matamshi', 'Msamiati']],
                                    ['name' => 'Kusoma', 'subtopics' => ['Ufahamu', 'Usomaji wa Haraka']],
                                    ['name' => 'Kuandika', 'subtopics' => ['Insha', 'Sarufi', 'Tahajia']],
                                ],
                            ],
                            [
                                'name' => 'Science & Technology',
                                'short_name' => 'Sci & Tech',
                                'color' => '#6366F1',
                                'topics' => [
                                    ['name' => 'Living Things', 'subtopics' => ['Plants', 'Animals', 'Human Body']],
                                    ['name' => 'Non-Living Things', 'subtopics' => ['Matter', 'Materials', 'Energy']],
                                    ['name' => 'Environment', 'subtopics' => ['Weather', 'Soil', 'Water']],
                                    ['name' => 'Technology', 'subtopics' => ['Simple Machines', 'ICT Basics']],
                                ],
                            ],
                            ['name' => 'Social Studies', 'color' => '#EC4899', 'topics' => ['Our Community', 'Our Country', 'Our Environment', 'Citizenship', 'History']],
                            ['name' => 'Religious Education', 'color' => '#8B5CF6', 'topics' => ['Christian Religious Education', 'Islamic Religious Education', 'Hindu Religious Education']],
                            ['name' => 'Creative Arts', 'color' => '#EF4444', 'topics' => ['Art and Craft', 'Music', 'Drama and Movement']],
                            ['name' => 'Physical Education', 'short_name' => 'PE', 'color' => '#14B8A6', 'topics' => ['Athletics', 'Team Sports', 'Individual Sports', 'Games']],
                        ],
                    ],
                    [
                        'name' => 'CBC Junior Secondary',
                        'code' => 'cbc_junior_secondary',
                        'group_label' => 'Kenya CBC',
                        'grades' => ['Grade 7', 'Grade 8', 'Grade 9'],
                        'subjects' => [
                            [
                                'name' => 'Mathematics',
                                'short_name' => 'Math',
                                'color' => '#3B82F6',
                                'topics' => [
                                    ['name' => 'Numbers and Operations', 'subtopics' => ['Integers', 'Fractions', 'Decimals', 'Percentages', 'Ratio & Proportion']],
                                    ['name' => 'Algebra', 'subtopics' => ['Expressions', 'Equations', 'Inequalities', 'Sequences']],
                                    ['name' => 'Geometry', 'subtopics' => ['Angles', 'Triangles', 'Quadrilaterals', 'Circles', 'Transformations']],
                                    ['name' => 'Statistics & Probability', 'subtopics' => ['Data Collection', 'Graphs', 'Measures of Central Tendency', 'Probability']],
                                    ['name' => 'Measurement', 'subtopics' => ['Area', 'Volume', 'Perimeter', 'Speed', 'Density']],
                                ],
                            ],
                            ['name' => 'English', 'color' => '#10B981', 'topics' => ['Reading Comprehension', 'Creative Writing', 'Grammar & Composition', 'Poetry', 'Literature']],
                            ['name' => 'Kiswahili', 'color' => '#F59E0B', 'topics' => ['Ufahamu', 'Insha', 'Sarufi', 'Fasihi', 'Mashairi']],
                            [
                                'name' => 'Integrated Science',
                                'short_name' => 'Science',
                                'color' => '#6366F1',
                                'topics' => [
                                    ['name' => 'Biology', 'subtopics' => ['Cell Biology', 'Photosynthesis', 'Nutrition', 'Reproduction', 'Ecology']],
                                    ['name' => 'Chemistry', 'subtopics' => ['States of Matter', 'Elements & Compounds', 'Chemical Reactions', 'Acids & Bases']],
                                    ['name' => 'Physics', 'subtopics' => ['Forces', 'Energy', 'Light', 'Sound', 'Electricity']],
                                ],
                            ],
                            ['name' => 'Social Studies', 'color' => '#EC4899', 'topics' => ['History of Kenya', 'East African Community', 'Civics & Governance', 'Geography', 'Economics']],
                            ['name' => 'Pre-Technical Studies', 'color' => '#F97316', 'topics' => ['Woodwork', 'Metalwork', 'Electricity', 'Drawing']],
                            ['name' => 'Agriculture', 'color' => '#84CC16', 'topics' => ['Crop Farming', 'Animal Husbandry', 'Soil Science', 'Farm Tools']],
                            ['name' => 'Creative Arts & Sports', 'color' => '#EF4444', 'topics' => ['Visual Arts', 'Performing Arts', 'Sports & Athletics']],
                            ['name' => 'Computer Science', 'short_name' => 'CS', 'color' => '#0EA5E9', 'topics' => ['Digital Literacy', 'Programming Basics', 'Spreadsheets', 'Internet Safety']],
                        ],
                    ],
                    [
                        'name' => 'CBC Senior Secondary',
                        'code' => 'cbc_senior_secondary',
                        'group_label' => 'Kenya CBC',
                        'grades' => ['Grade 10', 'Grade 11', 'Grade 12'],
                        'subjects' => [
                            [
                                'name' => 'Mathematics',
                                'short_name' => 'Math',
                                'color' => '#3B82F6',
                                'topics' => [
                                    ['name' => 'Algebra', 'subtopics' => ['Quadratic Equations', 'Polynomials', 'Logarithms', 'Surds', 'Progressions']],
                                    ['name' => 'Calculus', 'subtopics' => ['Differentiation', 'Integration', 'Applications of Calculus']],
                                    ['name' => 'Statistics', 'subtopics' => ['Frequency Distributions', 'Regression', 'Probability Distributions']],
                                    ['name' => 'Vectors & Matrices', 'subtopics' => ['Vector Operations', 'Matrix Operations', '3D Geometry']],
                                ],
                            ],
                            ['name' => 'English', 'color' => '#10B981', 'topics' => ['Literary Analysis', 'Advanced Writing', 'Grammar', 'Oral Skills', 'Set Books']],
                            ['name' => 'Kiswahili', 'color' => '#F59E0B', 'topics' => ['Fasihi ya Kiswahili', 'Lugha', 'Uandishi wa Ubunifu', 'Vitabu vya Masomo']],
                            [
                                'name' => 'Biology',
                                'color' => '#84CC16',
                                'topics' => [
                                    ['name' => 'Cell Biology', 'subtopics' => ['Cell Structure', 'Cell Division', 'Biochemistry']],
                                    ['name' => 'Genetics', 'subtopics' => ['Mendelian Genetics', 'DNA & RNA', 'Biotechnology']],
                                    ['name' => 'Ecology', 'subtopics' => ['Ecosystems', 'Population Dynamics', 'Conservation']],
                                    ['name' => 'Human Biology', 'subtopics' => ['Digestion', 'Respiration', 'Circulation', 'Excretion', 'Reproduction']],
                                ],
                            ],
                            [
                                'name' => 'Chemistry',
                                'color' => '#A855F7',
                                'topics' => [
                                    ['name' => 'Physical Chemistry', 'subtopics' => ['Atomic Structure', 'Chemical Bonding', 'Energetics', 'Rates of Reaction', 'Equilibrium']],
                                    ['name' => 'Organic Chemistry', 'subtopics' => ['Hydrocarbons', 'Alcohols', 'Acids', 'Polymers']],
                                    ['name' => 'Inorganic Chemistry', 'subtopics' => ['Periodic Table', 'Metals', 'Non-Metals', 'Salts']],
                                ],
                            ],
                            [
                                'name' => 'Physics',
                                'color' => '#6366F1',
                                'topics' => [
                                    ['name' => 'Mechanics', 'subtopics' => ['Kinematics', 'Dynamics', 'Circular Motion', 'Gravitation', 'Work Energy Power']],
                                    ['name' => 'Waves & Optics', 'subtopics' => ['Wave Motion', 'Sound', 'Light', 'Electromagnetic Spectrum']],
                                    ['name' => 'Electricity & Magnetism', 'subtopics' => ['Electrostatics', 'Current Electricity', 'Electromagnetism', 'Electronics']],
                                    ['name' => 'Modern Physics', 'subtopics' => ['Photoelectric Effect', 'Radioactivity', 'Nuclear Physics']],
                                ],
                            ],
                            ['name' => 'History', 'color' => '#D97706', 'topics' => ['Pre-Colonial Africa', 'Colonial Period', 'Nationalism', 'Post-Independence', 'World History']],
                            ['name' => 'Geography', 'color' => '#059669', 'topics' => ['Physical Geography', 'Human Geography', 'Environmental Geography', 'Map Work']],
                            ['name' => 'Business Studies', 'color' => '#0891B2', 'topics' => ['Introduction to Business', 'Commerce', 'Entrepreneurship', 'Office Practice']],
                            ['name' => 'Computer Science', 'short_name' => 'CS', 'color' => '#0EA5E9', 'topics' => ['Programming', 'Data Structures', 'Databases', 'Networking', 'Cybersecurity']],
                            ['name' => 'Agriculture', 'color' => '#65A30D', 'topics' => ['Crop Production', 'Livestock', 'Farm Inputs', 'Agricultural Economics']],
                            ['name' => 'Home Science', 'color' => '#F43F5E', 'topics' => ['Food & Nutrition', 'Clothing & Textiles', 'Home Management']],
                        ],
                    ],
                ],
            ],

            // ── British Curriculum ────────────────────────────────────────────
            [
                'name' => 'British Curriculum',
                'code' => 'british',
                'country' => null,
                'description' => 'Cambridge/Edexcel GCSE and A-Level curriculum',
                'sort_order' => 2,
                'levels' => [
                    [
                        'name' => 'GCSE',
                        'code' => 'british_gcse',
                        'group_label' => 'British Curriculum',
                        'grades' => ['Year 10', 'Year 11'],
                        'subjects' => [
                            ['name' => 'Mathematics', 'short_name' => 'Math', 'color' => '#3B82F6', 'topics' => ['Number', 'Algebra', 'Geometry', 'Statistics', 'Probability']],
                            ['name' => 'English Language', 'color' => '#10B981', 'topics' => ['Reading', 'Writing', 'Speaking & Listening']],
                            ['name' => 'English Literature', 'color' => '#34D399', 'topics' => ['Poetry', 'Prose', 'Drama', 'Unseen Texts']],
                            ['name' => 'Biology', 'color' => '#84CC16', 'topics' => ['Cell Biology', 'Organisation', 'Infection & Response', 'Bioenergetics', 'Homeostasis', 'Inheritance', 'Ecology']],
                            ['name' => 'Chemistry', 'color' => '#A855F7', 'topics' => ['Atomic Structure', 'Bonding', 'Quantitative Chemistry', 'Chemical Changes', 'Energy Changes', 'Organic Chemistry']],
                            ['name' => 'Physics', 'color' => '#6366F1', 'topics' => ['Energy', 'Electricity', 'Particle Model', 'Atomic Structure', 'Forces', 'Waves', 'Magnetism']],
                            ['name' => 'History', 'color' => '#D97706', 'topics' => ['Medicine Through Time', 'War & British Society', 'Cold War', 'Power & the People']],
                            ['name' => 'Geography', 'color' => '#059669', 'topics' => ['Natural Hazards', 'Living World', 'UK Landscapes', 'Urban Issues', 'Changing Economic World']],
                            ['name' => 'Economics', 'color' => '#0891B2', 'topics' => ['Microeconomics', 'Macroeconomics', 'Economic Policy']],
                            ['name' => 'Computer Science', 'color' => '#0EA5E9', 'topics' => ['Systems Architecture', 'Memory', 'Storage', 'Networking', 'Programming', 'Algorithms']],
                            ['name' => 'Business Studies', 'color' => '#F97316', 'topics' => ['Business in Context', 'Finance', 'Marketing', 'People in Business', 'Operations']],
                            ['name' => 'Psychology', 'color' => '#EC4899', 'topics' => ['Social Influence', 'Memory', 'Attachment', 'Psychopathology', 'Biopsychology']],
                        ],
                    ],
                    [
                        'name' => 'A-Level',
                        'code' => 'british_alevel',
                        'group_label' => 'British Curriculum',
                        'grades' => ['AS Level', 'A2 Level'],
                        'subjects' => [
                            ['name' => 'Mathematics', 'color' => '#3B82F6', 'topics' => ['Pure Mathematics', 'Statistics', 'Mechanics', 'Decision Mathematics']],
                            ['name' => 'Further Mathematics', 'color' => '#1D4ED8', 'topics' => ['Further Pure', 'Further Statistics', 'Further Mechanics']],
                            ['name' => 'English Literature', 'color' => '#10B981', 'topics' => ['Poetry', 'Prose', 'Drama', 'Comparative Study']],
                            ['name' => 'Biology', 'color' => '#84CC16', 'topics' => ['Biological Molecules', 'Cells', 'Exchange', 'Genetic Information', 'Energy Transfers', 'Organisms & Environment']],
                            ['name' => 'Chemistry', 'color' => '#A855F7', 'topics' => ['Physical Chemistry', 'Inorganic Chemistry', 'Organic Chemistry']],
                            ['name' => 'Physics', 'color' => '#6366F1', 'topics' => ['Measurements', 'Mechanics', 'Materials', 'Waves', 'Electricity', 'Further Mechanics', 'Thermal Physics', 'Nuclear']],
                            ['name' => 'Economics', 'color' => '#0891B2', 'topics' => ['Markets & Market Failure', 'National Economy', 'Economic Policy', 'Global Economy']],
                            ['name' => 'Computer Science', 'color' => '#0EA5E9', 'topics' => ['Fundamentals of Programming', 'Data Structures & Algorithms', 'Systems & Networking', 'Project']],
                            ['name' => 'Psychology', 'color' => '#EC4899', 'topics' => ['Social Cognition', 'Clinical Psychology', 'Criminological Psychology', 'Child Psychology']],
                        ],
                    ],
                ],
            ],

            // ── American Curriculum ────────────────────────────────────────────
            [
                'name' => 'American Curriculum',
                'code' => 'american',
                'country' => null,
                'description' => 'AP Courses and SAT/ACT preparation',
                'sort_order' => 3,
                'levels' => [
                    [
                        'name' => 'High School',
                        'code' => 'american_highschool',
                        'group_label' => 'American Curriculum',
                        'grades' => ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'],
                        'subjects' => [
                            ['name' => 'SAT Math', 'color' => '#3B82F6', 'topics' => ['Algebra', 'Advanced Math', 'Problem Solving & Data Analysis', 'Geometry']],
                            ['name' => 'SAT English', 'color' => '#10B981', 'topics' => ['Reading Comprehension', 'Writing & Language', 'Grammar']],
                            ['name' => 'AP Calculus AB', 'color' => '#1D4ED8', 'topics' => ['Limits', 'Differentiation', 'Integration', 'Differential Equations']],
                            ['name' => 'AP Calculus BC', 'color' => '#2563EB', 'topics' => ['Series & Sequences', 'Parametric Equations', 'Polar Coordinates', 'BC-Only Topics']],
                            ['name' => 'AP Biology', 'color' => '#84CC16', 'topics' => ['Biochemistry', 'Cell Structure', 'Genetics', 'Evolution', 'Ecology']],
                            ['name' => 'AP Chemistry', 'color' => '#A855F7', 'topics' => ['Atomic Structure', 'Thermodynamics', 'Kinetics', 'Electrochemistry', 'Organic Chemistry']],
                            ['name' => 'AP Physics 1', 'color' => '#6366F1', 'topics' => ['Kinematics', 'Dynamics', 'Circular Motion', 'Energy', 'Waves']],
                            ['name' => 'AP US History', 'color' => '#D97706', 'topics' => ['Colonial Era', 'Revolution', 'Civil War', 'Industrial Era', 'World Wars', 'Post-War America']],
                            ['name' => 'AP Computer Science A', 'color' => '#0EA5E9', 'topics' => ['Java Basics', 'Classes & Objects', 'Arrays', 'Inheritance', 'Recursion', 'Algorithms']],
                            ['name' => 'AP Economics', 'color' => '#0891B2', 'topics' => ['Microeconomics', 'Macroeconomics', 'Supply & Demand', 'GDP & Inflation']],
                        ],
                    ],
                ],
            ],

            // ── IB Diploma ─────────────────────────────────────────────────────
            [
                'name' => 'International Baccalaureate',
                'code' => 'ib',
                'country' => null,
                'description' => 'IB Diploma Programme',
                'sort_order' => 4,
                'levels' => [
                    [
                        'name' => 'IB Diploma',
                        'code' => 'ib_diploma',
                        'group_label' => 'IB',
                        'grades' => ['IB Year 1', 'IB Year 2'],
                        'subjects' => [
                            ['name' => 'Mathematics: Analysis and Approaches', 'short_name' => 'Math AA', 'color' => '#3B82F6', 'topics' => ['Algebra', 'Functions', 'Calculus', 'Statistics', 'Geometry']],
                            ['name' => 'Mathematics: Applications and Interpretation', 'short_name' => 'Math AI', 'color' => '#1D4ED8', 'topics' => ['Number', 'Statistics', 'Geometry', 'Functions', 'Calculus']],
                            ['name' => 'English A: Language & Literature', 'color' => '#10B981', 'topics' => ['Language in Cultural Context', 'Language & Mass Communication', 'Literature']],
                            ['name' => 'Biology', 'color' => '#84CC16', 'topics' => ['Cell Biology', 'Molecular Biology', 'Genetics', 'Ecology', 'Evolution']],
                            ['name' => 'Chemistry', 'color' => '#A855F7', 'topics' => ['Stoichiometry', 'Atomic Structure', 'Periodicity', 'Bonding', 'Energetics', 'Kinetics', 'Organic Chemistry']],
                            ['name' => 'Physics', 'color' => '#6366F1', 'topics' => ['Measurements', 'Mechanics', 'Thermal Physics', 'Waves', 'Electricity', 'Atomic & Nuclear Physics']],
                            ['name' => 'History', 'color' => '#D97706', 'topics' => ['Causes of WWI', 'Causes of WWII', 'The Cold War', 'Authoritarian States', 'African History']],
                            ['name' => 'Economics', 'color' => '#0891B2', 'topics' => ['Microeconomics', 'Macroeconomics', 'International Economics', 'Development Economics']],
                            ['name' => 'Computer Science', 'color' => '#0EA5E9', 'topics' => ['System Design', 'Computer Organization', 'Networks', 'OOP', 'Abstract Data Structures']],
                            ['name' => 'Theory of Knowledge', 'short_name' => 'TOK', 'color' => '#F59E0B', 'topics' => ['Nature of Knowledge', 'Areas of Knowledge', 'Ways of Knowing']],
                        ],
                    ],
                ],
            ],

            // ── College ────────────────────────────────────────────────────────
            [
                'name' => 'College',
                'code' => 'college',
                'country' => null,
                'description' => 'Diploma, Certificate, and TVET programs',
                'sort_order' => 5,
                'levels' => [
                    [
                        'name' => 'College / TVET',
                        'code' => 'college',
                        'group_label' => 'Higher Education',
                        'grades' => ['Year 1', 'Year 2', 'Year 3'],
                        'subjects' => [
                            ['name' => 'Business Management', 'color' => '#0891B2', 'topics' => ['Principles of Management', 'Marketing', 'Finance', 'Human Resources', 'Operations']],
                            ['name' => 'Information Technology', 'short_name' => 'IT', 'color' => '#0EA5E9', 'topics' => ['Computer Fundamentals', 'Programming', 'Databases', 'Networking', 'Web Development']],
                            ['name' => 'Engineering', 'color' => '#6366F1', 'topics' => ['Engineering Mathematics', 'Engineering Drawing', 'Materials Science', 'Electrical Engineering']],
                            ['name' => 'Health Sciences', 'color' => '#EF4444', 'topics' => ['Anatomy & Physiology', 'Pharmacology', 'Clinical Practice', 'Public Health']],
                            ['name' => 'Hospitality & Tourism', 'color' => '#F59E0B', 'topics' => ['Food & Beverage', 'Accommodation', 'Tour Operations', 'Events Management']],
                            ['name' => 'Education', 'color' => '#10B981', 'topics' => ['Education Psychology', 'Curriculum Development', 'Teaching Methods', 'Classroom Management']],
                            ['name' => 'Agriculture', 'color' => '#84CC16', 'topics' => ['Crop Production', 'Animal Husbandry', 'Agricultural Economics', 'Farm Management']],
                            ['name' => 'Social Work', 'color' => '#EC4899', 'topics' => ['Social Work Theory', 'Community Development', 'Counselling', 'Child Welfare']],
                        ],
                    ],
                ],
            ],

            // ── University ─────────────────────────────────────────────────────
            [
                'name' => 'University',
                'code' => 'university',
                'country' => null,
                'description' => 'Undergraduate and Postgraduate programs',
                'sort_order' => 6,
                'levels' => [
                    [
                        'name' => 'Undergraduate',
                        'code' => 'university_undergrad',
                        'group_label' => 'Higher Education',
                        'grades' => ['Year 1', 'Year 2', 'Year 3', 'Year 4'],
                        'subjects' => [
                            ['name' => 'Computer Science', 'short_name' => 'CS', 'color' => '#0EA5E9', 'topics' => ['Data Structures & Algorithms', 'Operating Systems', 'Computer Networks', 'Database Systems', 'Software Engineering', 'AI & Machine Learning']],
                            ['name' => 'Engineering', 'color' => '#6366F1', 'topics' => ['Calculus & Linear Algebra', 'Thermodynamics', 'Mechanics', 'Electrical Circuits', 'Control Systems', 'Final Year Project']],
                            ['name' => 'Medicine & Health', 'color' => '#EF4444', 'topics' => ['Anatomy', 'Physiology', 'Biochemistry', 'Pathology', 'Pharmacology', 'Clinical Medicine']],
                            ['name' => 'Law', 'color' => '#7C3AED', 'topics' => ['Constitutional Law', 'Contract Law', 'Criminal Law', 'Tort Law', 'International Law', 'Commercial Law']],
                            ['name' => 'Business Administration', 'short_name' => 'BBA/MBA', 'color' => '#0891B2', 'topics' => ['Accounting', 'Finance', 'Marketing Management', 'Strategic Management', 'Organizational Behaviour']],
                            ['name' => 'Economics', 'color' => '#F97316', 'topics' => ['Microeconomics', 'Macroeconomics', 'Econometrics', 'Development Economics', 'International Trade']],
                            ['name' => 'Education', 'color' => '#10B981', 'topics' => ['Philosophy of Education', 'Educational Psychology', 'Curriculum & Instruction', 'Research Methods']],
                            ['name' => 'Sciences', 'color' => '#84CC16', 'topics' => ['Advanced Mathematics', 'Physics', 'Chemistry', 'Biology', 'Environmental Science']],
                            ['name' => 'Arts & Humanities', 'color' => '#EC4899', 'topics' => ['Literature', 'Philosophy', 'History', 'Linguistics', 'Cultural Studies']],
                            ['name' => 'Social Sciences', 'color' => '#D97706', 'topics' => ['Sociology', 'Psychology', 'Political Science', 'Anthropology', 'Communication Studies']],
                        ],
                    ],
                    [
                        'name' => 'Postgraduate',
                        'code' => 'university_postgrad',
                        'group_label' => 'Higher Education',
                        'grades' => ['Year 1', 'Year 2', 'Postgraduate'],
                        'subjects' => [
                            ['name' => 'Computer Science', 'color' => '#0EA5E9', 'topics' => ['Advanced Algorithms', 'Machine Learning', 'Distributed Systems', 'Research Methods', 'Thesis']],
                            ['name' => 'Business Administration', 'short_name' => 'MBA', 'color' => '#0891B2', 'topics' => ['Strategic Management', 'Corporate Finance', 'Leadership', 'Innovation & Entrepreneurship']],
                            ['name' => 'Engineering', 'color' => '#6366F1', 'topics' => ['Advanced Engineering', 'Research Methodology', 'Thesis', 'Specialized Topics']],
                            ['name' => 'Medicine & Health', 'color' => '#EF4444', 'topics' => ['Medical Research', 'Specialization', 'Clinical Rotations']],
                        ],
                    ],
                ],
            ],

            // ── Lifelong Learner ────────────────────────────────────────────────
            [
                'name' => 'Professional Development',
                'code' => 'lifelong',
                'country' => null,
                'description' => 'Skill-based and professional development learning',
                'sort_order' => 7,
                'levels' => [
                    [
                        'name' => 'Lifelong Learning',
                        'code' => 'lifelong_learner',
                        'group_label' => 'Professional',
                        'grades' => [],
                        'subjects' => [
                            ['name' => 'Programming', 'color' => '#0EA5E9', 'topics' => ['Python', 'JavaScript', 'Java', 'PHP', 'Mobile Development', 'Web Development']],
                            ['name' => 'Data Science', 'color' => '#6366F1', 'topics' => ['Statistics', 'Machine Learning', 'Data Visualization', 'SQL', 'Python for Data Science']],
                            ['name' => 'Digital Marketing', 'color' => '#EC4899', 'topics' => ['SEO', 'Social Media Marketing', 'Email Marketing', 'Content Marketing', 'Analytics']],
                            ['name' => 'Project Management', 'color' => '#F97316', 'topics' => ['Agile', 'Scrum', 'PMP', 'Risk Management', 'Project Planning']],
                            ['name' => 'Design', 'color' => '#EF4444', 'topics' => ['UI/UX Design', 'Graphic Design', 'Brand Identity', 'Figma', 'Adobe Suite']],
                            ['name' => 'Languages', 'color' => '#10B981', 'topics' => ['English', 'French', 'Spanish', 'Swahili', 'Arabic', 'Chinese']],
                            ['name' => 'Finance & Investing', 'color' => '#059669', 'topics' => ['Personal Finance', 'Stock Market', 'Cryptocurrency', 'Accounting Basics', 'Financial Planning']],
                            ['name' => 'Leadership & Management', 'color' => '#7C3AED', 'topics' => ['Leadership Styles', 'Team Building', 'Conflict Resolution', 'Communication Skills']],
                            ['name' => 'Communication', 'color' => '#D97706', 'topics' => ['Public Speaking', 'Business Writing', 'Presentation Skills', 'Negotiation']],
                        ],
                    ],
                ],
            ],
        ];
    }
}
