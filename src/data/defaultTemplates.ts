import { Exercise, WorkoutTemplate, DietTemplate, FoodEntry, DailyFoodLog } from '../types';

let exerciseIdCounter = 1000; // Start from a high number to avoid collisions with user-generated IDs
const createExercise = (name: string, sets: string, reps: string): Exercise => ({
  id: exerciseIdCounter++,
  name,
  sets,
  reps,
  weight: '',
  target: `${sets}x${reps}`,
  actual: ''
});

let foodIdCounter = 2000; // Start from a high number to avoid collisions with user-generated IDs
const createFood = (name: string, calories: number, protein: number, carbs: number, fat: number): FoodEntry => ({
  id: foodIdCounter++,
  name,
  timestamp: '',
  calories,
  protein,
  carbs,
  fat,
});

export const defaultTemplates: WorkoutTemplate[] = [
  {
    id: 0,
    name: 'Start from Scratch',
    days: [],
  },
  {
    id: -1,
    name: 'Starting Strength',
    days: [
      {
        id: -11,
        name: 'Workout A',
        exercises: [
          createExercise('Squat', '3', '5'),
          createExercise('Bench Press', '3', '5'),
          createExercise('Deadlift', '1', '5'),
        ],
      },
      {
        id: -12,
        name: 'Workout B',
        exercises: [
          createExercise('Squat', '3', '5'),
          createExercise('Overhead Press', '3', '5'),
          createExercise('Power Clean / Barbell Row', '5', '3'),
        ],
      },
    ],
  },
  {
    id: -2,
    name: 'Push / Pull / Legs (PPL)',
    days: [
      {
        id: -21,
        name: 'Push Day',
        exercises: [
          createExercise('Bench or Incline Bench', '3', '5-8'),
          createExercise('OHP', '3', '6-8'),
          createExercise('Triceps Extensions', '3', '10-12'),
          createExercise('Chest Fly', '3', '10-12'),
          createExercise('Lateral Raise', '3', '12-15'),
        ],
      },
      {
        id: -22,
        name: 'Pull Day',
        exercises: [
          createExercise('Pull-Ups', '3', '6-10'),
          createExercise('Barbell Rows', '3', '6-8'),
          createExercise('Lat Pulldown', '3', '10-12'),
          createExercise('Face Pull', '3', '15-20'),
          createExercise('Biceps Curls', '3', '10-12'),
        ],
      },
      {
        id: -23,
        name: 'Legs Day',
        exercises: [
          createExercise('Squat', '3', '5-8'),
          createExercise('RDL', '3', '6-8'),
          createExercise('Leg Press', '3', '10-12'),
          createExercise('Leg Extension', '3', '12-15'),
          createExercise('Calf Raise', '3', '12-15'),
        ],
      },
    ],
  },
  {
    id: -3,
    name: 'Upper / Lower',
    days: [
      {
        id: -31,
        name: 'Upper',
        exercises: [
          createExercise('Bench Press', '3', '6-8'),
          createExercise('Pull-Up', '3', '6-8'),
          createExercise('Seated Row', '3', '10-12'),
          createExercise('Lateral Raise', '3', '12-15'),
          createExercise('Triceps Extension', '2', '10-12'),
          createExercise('Biceps Curl', '2', '10-12'),
        ],
      },
      {
        id: -32,
        name: 'Lower',
        exercises: [
          createExercise('Squat or Hack Squat', '3', '6-8'),
          createExercise('RDL', '3', '6-8'),
          createExercise('Leg Extension', '3', '10-12'),
          createExercise('Hamstring Curl', '3', '10-12'),
          createExercise('Core Work', '3', '10-15'),
        ],
      },
    ],
  },
  {
    id: -4,
    name: 'ULxPPL Hybrid',
    days: [
      {
        id: -41, name: 'Day 1 - Upper', exercises: [
          createExercise('Incline Bench', '3', '6-8'),
          createExercise('Weighted Pull-Up', '3', '6-8'),
          createExercise('Seated Cable Fly', '2', '12-15'),
          createExercise('Cable Lateral Raise', '2', '8-10'),
          createExercise('Deficit Pendlay Row', '2', '6-8'),
          createExercise('Overhead Tricep Extension', '2', '8-10'),
          createExercise('Bayesian Curl', '2', '8-10'),
        ]
      },
      {
        id: -42, name: 'Day 2 - Lower', exercises: [
          createExercise('Leg Curls (lying/seated)', '2', '6-8'),
          createExercise('Hack Squats', '3', '6-8'),
          createExercise('RDL', '3', '6-8'),
          createExercise('Leg Extension', '2', '8-10'),
          createExercise('Hip Abduction', '2', '8-10'),
          createExercise('Cable Crunch', '3', '8-10'),
          createExercise('Face Pull', '3', '15-20'),
        ]
      },
      {
        id: -43, name: 'Day 3 - Push', exercises: [
          createExercise('Incline Bench', '3', '6-8'),
          createExercise('Shoulder Press', '3', '10-12'),
          createExercise('Tricep Extension', '3', '10-12'),
          createExercise('Chest Fly', '3', '10-12'),
          createExercise('Lateral Raise', '3', '20'),
          createExercise('Front Raise', '2', '15-20'),
          createExercise('Dips', '1', 'Failure'),
        ]
      },
      {
        id: -44, name: 'Day 4 - Pull', exercises: [
          createExercise('Mixed Lat Pulldown', '3', '12-15'),
          createExercise('Pull-Up', '1', 'AMRAP'),
          createExercise('Seated Row', '3', '10-12'),
          createExercise('Shrugs', '3', '10-12'),
          createExercise('Reverse Fly', '3', '10-12'),
          createExercise('Bicep Curls', '3', '10-12'),
        ]
      },
      {
        id: -45, name: 'Day 5 - Legs', exercises: [
          createExercise('Deadlift', '3', '3'),
          createExercise('Hip Thrust', '2', '6-8'),
          createExercise('Leg Press', '4', '10-12'),
          createExercise('Leg Extension', '3', '8-10'),
          createExercise('Sulek Curl', '3', '20'),
          createExercise('Leg Raise', '3', '8-10'),
          createExercise('Decline Sit-Up', '3', '8-10'),
        ]
      },
    ],
  },
];

export const defaultDietTemplates: DietTemplate[] = [
  {
    id: -101,
    name: 'Balanced 2000 Cal',
    meals: {
      Breakfast: [
        createFood('Oatmeal with berries', 350, 12, 58, 8),
        createFood('2 Eggs', 140, 12, 2, 10),
        createFood('Orange juice', 110, 2, 26, 0),
      ],
      Lunch: [
        createFood('Grilled chicken breast (6oz)', 280, 53, 0, 6),
        createFood('Brown rice (1 cup)', 216, 5, 45, 2),
        createFood('Mixed vegetables', 80, 3, 15, 0),
      ],
      Dinner: [
        createFood('Salmon (6oz)', 367, 40, 0, 22),
        createFood('Sweet potato (medium)', 103, 2, 24, 0),
        createFood('Broccoli (1 cup)', 55, 4, 11, 0),
      ],
      Snacks: [
        createFood('Greek yogurt', 100, 17, 6, 0),
        createFood('Apple with peanut butter', 200, 4, 25, 8),
      ],
    },
  },
  {
    id: -102,
    name: 'High Protein 2400 Cal',
    meals: {
      Breakfast: [
        createFood('Protein shake with banana', 320, 40, 35, 5),
        createFood('3 Whole eggs', 210, 18, 3, 15),
        createFood('Whole wheat toast', 140, 6, 26, 2),
      ],
      Lunch: [
        createFood('Lean ground beef (8oz)', 464, 48, 0, 30),
        createFood('White rice (1.5 cups)', 309, 6, 67, 1),
        createFood('Green beans', 44, 2, 10, 0),
      ],
      Dinner: [
        createFood('Chicken thighs (8oz)', 440, 52, 0, 24),
        createFood('Pasta (2 cups)', 400, 14, 78, 2),
        createFood('Marinara sauce', 70, 2, 12, 2),
      ],
      Snacks: [
        createFood('Cottage cheese (1 cup)', 163, 28, 6, 2),
        createFood('Protein bar', 200, 20, 22, 7),
      ],
    },
  },
  {
    id: -103,
    name: 'Low Carb 1800 Cal',
    meals: {
      Breakfast: [
        createFood('Scrambled eggs (3)', 210, 18, 3, 15),
        createFood('Avocado (half)', 120, 1, 6, 11),
        createFood('Turkey bacon (3 strips)', 90, 9, 1, 6),
      ],
      Lunch: [
        createFood('Grilled steak (7oz)', 420, 56, 0, 21),
        createFood('Caesar salad (no croutons)', 200, 8, 6, 15),
        createFood('Olive oil dressing', 120, 0, 0, 14),
      ],
      Dinner: [
        createFood('Baked cod (8oz)', 280, 60, 0, 3),
        createFood('Asparagus (1 cup)', 27, 3, 5, 0),
        createFood('Butter (1 tbsp)', 102, 0, 0, 12),
      ],
      Snacks: [
        createFood('Almonds (1oz)', 164, 6, 6, 14),
        createFood('String cheese', 80, 7, 1, 6),
      ],
    },
  },
  {
    id: -104,
    name: 'Vegetarian 2100 Cal',
    meals: {
      Breakfast: [
        createFood('Smoothie bowl with granola', 380, 15, 65, 9),
        createFood('Chia seeds (2 tbsp)', 138, 5, 12, 9),
        createFood('Almond milk', 30, 1, 1, 2),
      ],
      Lunch: [
        createFood('Black bean burger', 240, 12, 32, 8),
        createFood('Quinoa (1 cup)', 222, 8, 39, 4),
        createFood('Roasted vegetables', 120, 3, 20, 4),
      ],
      Dinner: [
        createFood('Tofu stir-fry (10oz)', 280, 30, 10, 14),
        createFood('Brown rice (1.5 cups)', 324, 7, 68, 3),
        createFood('Mixed stir-fry veggies', 90, 3, 18, 1),
      ],
      Snacks: [
        createFood('Hummus with carrots', 180, 6, 20, 8),
        createFood('Trail mix (1/4 cup)', 150, 4, 13, 10),
      ],
    },
  },
];