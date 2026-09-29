export interface RoutineItem {
  id: string;
  title: string;
  category?: string;
  target?: string;
  color?: string;
}

export interface DateColumn {
  dayNumber: number;
  date: string;
  customLabel?: string;
  isRestDay?: boolean;
  notes?: string;
}

export interface DayBlock {
  dayNumber: number;
  date: string;
  taskTitle: string;
  description: string;
  isCompleted: boolean;
  completedAt?: string;
}

export interface RoutinePlan {
  id: string;
  title: string;
  purpose: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  days: DayBlock[];
  routineItems?: RoutineItem[];
  dateColumns?: DateColumn[];
  matrixCompletions?: Record<string, Record<string, boolean>>; // [routineItemId][dateString or dayNumber] => boolean
  createdAt: string;
  updatedAt?: string;
  category?: string;
}

export interface RoutineTemplate {
  id: string;
  title: string;
  purpose: string;
  totalDays: number;
  category: string;
  tagline: string;
  routineItems?: RoutineItem[];
  tasks: Array<{
    dayNumber: number;
    taskTitle: string;
    description: string;
  }>;
}
