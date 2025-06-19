import { Settings, Goals } from '../types';

// Design System Colors
export const Colors = {
  primary: '#ff6b6b',      // Tomato Red - Active states, work sessions
  secondary: '#51cf66',    // Sage Green - Break sessions, success states
  accent: '#ffa94d',       // Warm Orange - Highlights, CTAs
  background: '#fafafa',   // Off-white - Light theme background
  darkBg: '#2c2c2c',      // Charcoal - Dark theme background
  text: '#343a40',        // Dark Gray - Primary text
  muted: '#868e96',       // Light Gray - Secondary text
  white: '#ffffff',
  shadow: 'rgba(0, 0, 0, 0.1)',
};

// Typography
export const Typography = {
  sizes: {
    timer: 48,
    header: 24,
    body: 16,
    caption: 14,
  },
  weights: {
    normal: '400' as const,
    medium: '500' as const,
    bold: '700' as const,
  },
  families: {
    regular: 'Lato-Regular',
    bold: 'Lato-Bold',
    black: 'Lato-Black',
    system: 'System',
  },
};

// Spacing (8px grid system)
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Default Goals
export const DefaultGoals: Goals = {
  dailyCycles: 8,
  weeklyCycles: 40,
  dailyFocusTime: 200, // 8 * 25 minutes
  streakTarget: 7,
};

// Default Settings
export const DefaultSettings: Settings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  cycleDuration: 4,
  soundEnabled: true,
  soundType: 'default',
  volume: 80,
  autoStartBreaks: false,
  autoStartWorkSessions: false,
  theme: 'auto', // Default to auto (follow system theme)
  goals: DefaultGoals,
};

// Timer Constants
export const TIMER_TICK_INTERVAL = 1000; // 1 second
export const NOTIFICATION_TITLE = 'PomodoroX';
export const STORAGE_KEYS = {
  SETTINGS: '@PomodoroX:settings',
  SESSIONS: '@PomodoroX:sessions',
  CYCLES: '@PomodoroX:cycles',
  STATS: '@PomodoroX:stats',
};

// Session Type Labels
export const SessionLabels = {
  work: 'Focus Time',
  shortBreak: 'Short Break',
  longBreak: 'Long Break',
} as const;

// Predefined Categories for Session Labeling
export const PredefinedCategories = [
  { id: 'work', name: 'Work', color: '#ff6b6b', icon: '💼' },
  { id: 'study', name: 'Study', color: '#4ecdc4', icon: '📚' },
  { id: 'personal', name: 'Personal', color: '#45b7d1', icon: '🏠' },
  { id: 'health', name: 'Health & Fitness', color: '#96ceb4', icon: '💪' },
  { id: 'creative', name: 'Creative', color: '#feca57', icon: '🎨' },
  { id: 'learning', name: 'Learning', color: '#ff9ff3', icon: '🧠' },
  { id: 'side-project', name: 'Side Project', color: '#54a0ff', icon: '🚀' },
  { id: 'admin', name: 'Admin Tasks', color: '#5f27cd', icon: '📋' },
] as const;

// Quick Labels for sessions
export const QuickLabels = [
  'Deep Work',
  'Email & Communication',
  'Planning',
  'Code Review',
  'Meeting Prep',
  'Research',
  'Documentation',
  'Bug Fixes',
  'Learning',
  'Admin Tasks',
] as const; 