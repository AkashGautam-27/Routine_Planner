import { RoutineTemplate } from '../types/routine';

export const ROUTINE_TEMPLATES: RoutineTemplate[] = [
  {
    id: 'fitness-kickstart-30',
    title: '30-Day Fitness & Strength Kickstart',
    purpose: 'Build consistent athletic stamina, strength, and daily movement habit',
    totalDays: 30,
    category: 'Health & Fitness',
    tagline: 'Alternating strength, cardio, mobility, and hydration goals',
    routineItems: [
      { id: 'fit-1', title: 'Daily Workout (Push/Pull/Legs/Cardio)', target: '30-45 mins', category: 'Exercise', color: 'emerald' },
      { id: 'fit-2', title: '10,000 Steps / Daily Walk', target: '10k steps', category: 'Activity', color: 'blue' },
      { id: 'fit-3', title: 'Hydration Goal (3 Liters Water)', target: '3.0 L', category: 'Health', color: 'cyan' },
      { id: 'fit-4', title: 'Full Body Mobility & Stretching', target: '10 mins', category: 'Recovery', color: 'amber' },
      { id: 'fit-5', title: 'High-Protein Clean Diet & No Junk', target: '120g protein', category: 'Nutrition', color: 'indigo' },
    ],
    tasks: Array.from({ length: 30 }, (_, i) => {
      const day = i + 1;
      const mod = day % 4;
      if (mod === 1) {
        return { dayNumber: day, taskTitle: 'Upper Body & Core Power', description: '3 sets: 12 push-ups, 15 dumbbell rows, 30s plank, 15 dips.' };
      } else if (mod === 2) {
        return { dayNumber: day, taskTitle: 'Lower Body & Posterior Chain', description: '3 sets: 15 bodyweight squats, 12 lunges/leg, 15 glute bridges, calf raises.' };
      } else if (mod === 3) {
        return { dayNumber: day, taskTitle: 'Aerobic Stamina & Interval Run', description: '25 min interval cardio (run/brisk walk) + 10 min cool-down mobility.' };
      } else {
        return { dayNumber: day, taskTitle: 'Active Recovery & Flexibility', description: '30 min gentle walk + full body foam rolling & hamstring/hip opener stretches.' };
      }
    }),
  },
  {
    id: 'morning-routine-30',
    title: '30-Day Morning Habit Reset',
    purpose: 'Build consistent energy, mindfulness, and focused morning momentum',
    totalDays: 30,
    category: 'Habits & Wellness',
    tagline: 'Hydration, light mobility, breathwork, and reading',
    routineItems: [
      { id: 'mrn-1', title: 'Wake up at 6:30 AM (No Snooze)', target: '6:30 AM', category: 'Sleep', color: 'amber' },
      { id: 'mrn-2', title: 'Drink 500ml Water First Thing', target: '500 ml', category: 'Health', color: 'cyan' },
      { id: 'mrn-3', title: '10 min Morning Breathwork / Meditation', target: '10 mins', category: 'Mindset', color: 'emerald' },
      { id: 'mrn-4', title: '15 min Dynamic Joint Mobility', target: '15 mins', category: 'Movement', color: 'teal' },
      { id: 'mrn-5', title: 'Read 20 Pages Non-Fiction', target: '20 pages', category: 'Learning', color: 'purple' },
      { id: 'mrn-6', title: 'Top 3 Priorities Defined for Today', target: '3 items', category: 'Productivity', color: 'indigo' },
    ],
    tasks: Array.from({ length: 30 }, (_, i) => {
      const day = i + 1;
      let taskTitle = 'Morning Flow & Focus';
      let description = '500ml water, 10 min dynamic mobility, 10 min breathwork, 20 min reading.';
      if (day % 7 === 1) {
        taskTitle = 'Weekly Kickoff & Intention';
        description = '500ml water, set weekly top 3 priorities, 15 min mobility, 15 min journal.';
      } else if (day % 7 === 0) {
        taskTitle = 'Rest & Weekly Reflection';
        description = 'Gentle morning walk, 500ml water, review wins and lessons learned this week.';
      } else if (day % 3 === 0) {
        taskTitle = 'Deep Focus & Reading Sprint';
        description = '500ml water, 25 pages non-fiction reading, 10 min quiet meditation.';
      }
      return { dayNumber: day, taskTitle, description };
    }),
  },
  {
    id: 'coding-challenge-21',
    title: '21-Day Full-Stack Coding Sprint',
    purpose: 'Level up TypeScript, modern React hooks, and build production-grade projects',
    totalDays: 21,
    category: 'Learning & Career',
    tagline: '1 focused coding hour every day with structured progressive concepts',
    routineItems: [
      { id: 'code-1', title: '1 Hour Dedicated Hands-on Coding', target: '60 mins', category: 'Coding', color: 'blue' },
      { id: 'code-2', title: 'Push at least 1 Commit to GitHub', target: '1 commit', category: 'Dev', color: 'emerald' },
      { id: 'code-3', title: 'Review 1 Concept / Documentation Page', target: '1 topic', category: 'Learning', color: 'indigo' },
      { id: 'code-4', title: 'Solve 1 Algorithmic / Logic Puzzle', target: '1 problem', category: 'DSA', color: 'amber' },
      { id: 'code-5', title: 'No Social Media During Focus Block', target: '0 distractions', category: 'Focus', color: 'rose' },
    ],
    tasks: [
      { dayNumber: 1, taskTitle: 'Git & Project Setup', description: 'Review Git branching, configure Vite + TypeScript with strict compiler settings.' },
      { dayNumber: 2, taskTitle: 'TypeScript Interfaces & Generics', description: 'Practice utility types (Pick, Omit, Record) and typed API responses.' },
      { dayNumber: 3, taskTitle: 'Clean Component Design', description: 'Refactor a monolithic view into atomic components with typed props.' },
      { dayNumber: 4, taskTitle: 'State Architecture with Hooks', description: 'Master useState & useReducer for complex multi-step UI flows.' },
      { dayNumber: 5, taskTitle: 'Side Effects & Cleanups', description: 'Implement useEffect with proper abort controllers and dependency array hygiene.' },
      { dayNumber: 6, taskTitle: 'Custom Hook Extraction', description: 'Extract reusable useLocalStorage and useDebounce custom hooks.' },
      { dayNumber: 7, taskTitle: 'Week 1 Review & Mini-Project', description: 'Build and deploy a responsive interactive dashboard using custom hooks.' },
      { dayNumber: 8, taskTitle: 'Context & State Boundaries', description: 'Set up modular React Context with custom consumer hooks and error boundaries.' },
      { dayNumber: 9, taskTitle: 'Form Management & Validation', description: 'Implement uncontrolled vs controlled forms with inline schema validation.' },
      { dayNumber: 10, taskTitle: 'REST & Async Data Fetching', description: 'Handle loading, error, and cached states with clean retry mechanisms.' },
      { dayNumber: 11, taskTitle: 'Optimistic UI Updates', description: 'Build instant responsive toggles with background sync and rollback safety.' },
      { dayNumber: 12, taskTitle: 'Performance Optimization', description: 'Profile with React DevTools; apply useMemo, useCallback, and virtual lists.' },
      { dayNumber: 13, taskTitle: 'Accessibility & Keyboard Nav', description: 'Audit ARIA roles, trap modal focus, and ensure 100% keyboard accessibility.' },
      { dayNumber: 14, taskTitle: 'Week 2 Capstone Review', description: 'Review progress, test cross-browser responsiveness, clean up code debt.' },
      { dayNumber: 15, taskTitle: 'Tailwind CSS Mastery', description: 'Design responsive layouts using flexbox, CSS grid, and dark mode classes.' },
      { dayNumber: 16, taskTitle: 'Framer Motion & Transitions', description: 'Add micro-interactions, layout animations, and enter/exit presence.' },
      { dayNumber: 17, taskTitle: 'Storage & Offline First', description: 'Implement robust IndexedDB or localStorage persistence with schema migrations.' },
      { dayNumber: 18, taskTitle: 'Unit Testing with Vitest', description: 'Write unit tests for utility functions and custom hooks.' },
      { dayNumber: 19, taskTitle: 'Component Integration Testing', description: 'Test modal interactions, form submissions, and error states.' },
      { dayNumber: 20, taskTitle: 'Lighthouse & Performance Audit', description: 'Achieve 95+ scores on Performance, Accessibility, and Best Practices.' },
      { dayNumber: 21, taskTitle: 'Portfolio Deployment & Demo', description: 'Deploy live build, write clean README documentation, and celebrate victory!' },
    ],
  },
  {
    id: 'mindfulness-detox-14',
    title: '14-Day Mindfulness & Focus Detox',
    purpose: 'Reduce screen fatigue, improve attention span, and restore mental clarity',
    totalDays: 14,
    category: 'Mental Health',
    tagline: 'Daily digital boundaries, evening journaling, and stillness practices',
    routineItems: [
      { id: 'mnd-1', title: 'First 60 Mins Screen-Free Upon Waking', target: '60 mins', category: 'Digital Detox', color: 'indigo' },
      { id: 'mnd-2', title: '15 Mins Silent Breathwork Meditation', target: '15 mins', category: 'Mindfulness', color: 'teal' },
      { id: 'mnd-3', title: 'Outdoor Walk Without Phone/Podcasts', target: '30 mins', category: 'Nature', color: 'emerald' },
      { id: 'mnd-4', title: 'Night Gratitude & Reflection Journal', target: '10 mins', category: 'Journal', color: 'amber' },
      { id: 'mnd-5', title: 'No Screens 1 Hour Before Bedtime', target: '10:00 PM', category: 'Rest', color: 'purple' },
    ],
    tasks: Array.from({ length: 14 }, (_, i) => {
      const day = i + 1;
      return {
        dayNumber: day,
        taskTitle: `Day ${day} Mindful Awareness`,
        description: 'First 60 mins screen-free upon waking. 15 mins guided breathwork. Night gratitude journal.',
      };
    }),
  },
];
