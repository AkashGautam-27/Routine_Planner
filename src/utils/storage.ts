import { RoutinePlan, DayBlock, RoutineItem, DateColumn } from '../types/routine';
import { addDays, formatDateISO, parseDateISO } from './dateUtils';
import { ROUTINE_TEMPLATES } from './templates';

export const STORAGE_KEY = 'routine_planner_data';
export const LIBRARY_STORAGE_KEY = 'routine_planner_library';

const DEFAULT_ROUTINE_ITEMS: RoutineItem[] = [
  { id: 'item-1', title: 'Morning Workout & Mobility', target: '30 mins', category: 'Fitness', color: 'emerald' },
  { id: 'item-2', title: 'Deep Focus & Learning Sprint', target: '45 mins', category: 'Growth', color: 'blue' },
  { id: 'item-3', title: 'Hydration Goal (3 Liters)', target: '3.0 L', category: 'Health', color: 'cyan' },
  { id: 'item-4', title: 'Read 20 Pages Non-Fiction', target: '20 pages', category: 'Reading', color: 'amber' },
  { id: 'item-5', title: 'Evening Reflection & Screen-Free Wind Down', target: '15 mins', category: 'Mindfulness', color: 'purple' },
];

export function createRoutineFromParams(params: {
  title: string;
  purpose: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  templateId?: string;
  customRoutineItems?: RoutineItem[];
}): RoutinePlan {
  const { title, purpose, startDate, endDate, totalDays, templateId, customRoutineItems } = params;
  const start = parseDateISO(startDate);

  let templateTasks: Array<{ dayNumber: number; taskTitle: string; description: string }> = [];
  let routineItems: RoutineItem[] = customRoutineItems || [];

  if (templateId) {
    const matched = ROUTINE_TEMPLATES.find((t) => t.id === templateId);
    if (matched) {
      templateTasks = matched.tasks;
      if (!customRoutineItems && matched.routineItems && matched.routineItems.length > 0) {
        routineItems = [...matched.routineItems];
      }
    }
  }

  if (routineItems.length === 0) {
    routineItems = [...DEFAULT_ROUTINE_ITEMS];
  }

  const days: DayBlock[] = [];
  const dateColumns: DateColumn[] = [];
  const matrixCompletions: Record<string, Record<string, boolean>> = {};

  // Initialize matrix completions structure for each routine item
  routineItems.forEach((item) => {
    matrixCompletions[item.id] = {};
  });

  for (let i = 0; i < totalDays; i++) {
    const dayNumber = i + 1;
    const dayDate = addDays(start, i);
    const dateStr = formatDateISO(dayDate);

    const templateTask = templateTasks.find((t) => t.dayNumber === dayNumber);

    days.push({
      dayNumber,
      date: dateStr,
      taskTitle: templateTask ? templateTask.taskTitle : `Day ${dayNumber} Task`,
      description: templateTask ? templateTask.description : `Complete daily routine milestone for Day ${dayNumber}`,
      isCompleted: false,
    });

    dateColumns.push({
      dayNumber,
      date: dateStr,
      customLabel: undefined,
      isRestDay: false,
    });

    // Default false for all routine items on this date
    routineItems.forEach((item) => {
      matrixCompletions[item.id][dateStr] = false;
    });
  }

  return {
    id: `routine-${Date.now()}`,
    title: title.trim(),
    purpose: purpose.trim(),
    startDate,
    endDate,
    totalDays,
    days,
    routineItems,
    dateColumns,
    matrixCompletions,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function createDefaultRoutine(): RoutinePlan {
  const today = new Date();
  const startDate = formatDateISO(today);
  const totalDays = 30;
  const endDate = formatDateISO(addDays(today, totalDays - 1));

  return createRoutineFromParams({
    title: '30-Day Fitness & Habit Tracker',
    purpose: 'Build consistent athletic stamina, strength, and daily movement habit',
    startDate,
    endDate,
    totalDays,
    templateId: 'fitness-kickstart-30',
  });
}

export function ensureRoutineMigrated(parsed: any): RoutinePlan {
  if (!parsed || !parsed.id) {
    return createDefaultRoutine();
  }

  // Ensure days array
  const days: DayBlock[] = Array.isArray(parsed.days) ? parsed.days : [];

  // Ensure routineItems array (Rows in table)
  let routineItems: RoutineItem[] = Array.isArray(parsed.routineItems) && parsed.routineItems.length > 0
    ? parsed.routineItems
    : [...DEFAULT_ROUTINE_ITEMS];

  // Ensure dateColumns array (Columns in table)
  let dateColumns: DateColumn[] = Array.isArray(parsed.dateColumns) && parsed.dateColumns.length > 0
    ? parsed.dateColumns
    : days.map((d) => ({
        dayNumber: d.dayNumber,
        date: d.date,
        customLabel: undefined,
        isRestDay: false,
      }));

  if (dateColumns.length === 0 && parsed.startDate && parsed.totalDays) {
    const start = parseDateISO(parsed.startDate);
    dateColumns = Array.from({ length: parsed.totalDays }, (_, i) => ({
      dayNumber: i + 1,
      date: formatDateISO(addDays(start, i)),
    }));
  }

  // Ensure matrixCompletions object: [routineId][dateStr]
  let matrixCompletions: Record<string, Record<string, boolean>> = parsed.matrixCompletions || {};
  
  routineItems.forEach((item) => {
    if (!matrixCompletions[item.id]) {
      matrixCompletions[item.id] = {};
    }
    dateColumns.forEach((col) => {
      if (matrixCompletions[item.id][col.date] === undefined) {
        // If legacy days had completion, carry over
        const matchingDay = days.find((d) => d.date === col.date || d.dayNumber === col.dayNumber);
        matrixCompletions[item.id][col.date] = matchingDay ? matchingDay.isCompleted : false;
      }
    });
  });

  return {
    ...parsed,
    days,
    routineItems,
    dateColumns,
    matrixCompletions,
  };
}

export function loadRoutineFromStorage(): RoutinePlan | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.id) {
      return ensureRoutineMigrated(parsed);
    }
    return null;
  } catch (err) {
    console.error('Failed to load routine from localStorage', err);
    return null;
  }
}

export function saveRoutineToStorage(routine: RoutinePlan | null): void {
  try {
    if (routine) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(routine));
      // Also update in library
      saveToLibrary(routine);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (err) {
    console.error('Failed to save routine to localStorage', err);
  }
}

export function loadLibraryFromStorage(): RoutinePlan[] {
  try {
    const raw = localStorage.getItem(LIBRARY_STORAGE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list.map(ensureRoutineMigrated) : [];
  } catch {
    return [];
  }
}

export function saveToLibrary(routine: RoutinePlan): void {
  try {
    const existing = loadLibraryFromStorage();
    const index = existing.findIndex((r) => r.id === routine.id);
    let updated: RoutinePlan[];
    if (index >= 0) {
      updated = [...existing];
      updated[index] = routine;
    } else {
      updated = [routine, ...existing];
    }
    // Keep up to 15 recent routines
    localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(updated.slice(0, 15)));
  } catch (err) {
    console.error('Failed to update library in localStorage', err);
  }
}

export function removeFromLibrary(routineId: string): void {
  try {
    const existing = loadLibraryFromStorage();
    const filtered = existing.filter((r) => r.id !== routineId);
    localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error('Failed to remove from library', err);
  }
}
