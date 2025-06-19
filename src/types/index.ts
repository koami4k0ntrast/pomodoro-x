export interface Session {
  id: string;
  cycleId: string; // Reference to the cycle this session belongs to
  type: 'work' | 'shortBreak' | 'longBreak';
  duration: number; // minutes
  startTime: number; // timestamp
  endTime?: number; // timestamp
  completed: boolean;
}

export interface Cycle {
  id: string;
  label?: string;
  category?: string;
  startTime: number; // timestamp
  endTime?: number; // timestamp - set when cycle completes (long break ends)
  completed: boolean;
  sessions: Session[]; // All sessions in this cycle
}

export interface Goals {
  dailyCycles: number; // default: 8
  weeklyCycles: number; // default: 40
  dailyFocusTime: number; // minutes, default: 200 (8 * 25)
  streakTarget: number; // days, default: 7
}

export interface Settings {
  workDuration: number; // default: 25
  shortBreakDuration: number; // default: 5
  longBreakDuration: number; // default: 15
  cycleDuration: number; // default: 4
  soundEnabled: boolean;
  soundType: string;
  volume: number; // 0-100
  autoStartBreaks: boolean;
  autoStartWorkSessions: boolean;
  theme: 'light' | 'dark';
  goals: Goals; // user goals
}

export interface DailyStats {
  date: string; // YYYY-MM-DD
  completedCycles: number; // completed cycles
  totalFocusTime: number; // minutes
  totalBreakTime: number; // minutes
  streak: number; // consecutive days
  categories: Record<string, number>; // category usage counts
}

export type TimerState = 'idle' | 'running' | 'paused' | 'completed';

export interface TimerContext {
  currentSession: Session | null;
  currentCycle: Cycle | null;
  timeRemaining: number; // seconds
  timerState: TimerState;
  completedCycles: number; // completed cycles count
  settings: Settings;
  nextSessionType: Session['type'] | null; // For auto-start logic
  // Default label/category that persists between cycles
  defaultLabel: string;
  defaultCategory: string;
  startTimer: (type: Session['type']) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
  skipTimer: () => void;
  updateSettings: (settings: Partial<Settings>) => void;
  startNextSession: () => void; // For auto-start functionality
  refreshStats: () => Promise<void>; // For refreshing statistics after reset
  updateCycleLabel: (label: string, category: string) => Promise<void>; // For updating cycle labels
  setDefaultLabel: (label: string, category: string) => void; // For setting defaults for next cycles
} 