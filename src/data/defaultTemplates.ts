import { Exercise, WorkoutTemplate } from '../types';

let exerciseIdCounter = 1000; // Start from a high number to avoid collisions with user-generated IDs
const createExercise = (name: string, sets: string, reps: string): Exercise => ({
  id: exerciseIdCounter++,
  name,
  sets,
  reps,
  weight: '',
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