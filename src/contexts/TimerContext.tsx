import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { Session, Cycle, Settings, TimerState, TimerContext as ITimerContext } from '../types';
import { DefaultSettings, TIMER_TICK_INTERVAL } from '../constants';
import { StorageService } from '../utils/storage';
import { AudioService } from '../utils/audio';

interface TimerAction {
  type: 'START_TIMER' | 'PAUSE_TIMER' | 'RESUME_TIMER' | 'STOP_TIMER' | 'SKIP_TIMER' | 'TICK' | 'COMPLETE_SESSION' | 'UPDATE_SETTINGS' | 'LOAD_SETTINGS' | 'INCREMENT_COMPLETED' | 'AUTO_START_NEXT' | 'RESET_STATS' | 'UPDATE_CYCLE_LABEL' | 'SET_DEFAULT_LABEL' | 'START_NEW_CYCLE' | 'COMPLETE_CYCLE';
  payload?: any;
}

interface TimerStateInternal {
  currentSession: Session | null;
  currentCycle: Cycle | null;
  timeRemaining: number;
  timerState: TimerState;
  completedCycles: number; // completed cycles count
  settings: Settings;
  nextSessionType: Session['type'] | null; // For auto-start logic
  defaultLabel: string; // Persists between cycles
  defaultCategory: string; // Persists between cycles
}

// Helper functions to derive counts from cycle sessions
const getCompletedWorkSessionsInCycle = (cycle: Cycle | null): number => {
  if (!cycle) return 0;
  return cycle.sessions.filter(session => session.type === 'work' && session.completed).length;
};

const getTotalWorkSessionsInCycle = (cycle: Cycle | null): number => {
  if (!cycle) return 0;
  return cycle.sessions.filter(session => session.type === 'work').length;
};

const initialState: TimerStateInternal = {
  currentSession: null,
  currentCycle: null,
  timeRemaining: 0,
  timerState: 'idle',
  completedCycles: 0,
  settings: DefaultSettings,
  nextSessionType: null,
  defaultLabel: '',
  defaultCategory: '',
};

function timerReducer(state: TimerStateInternal, action: TimerAction): TimerStateInternal {
  switch (action.type) {
    case 'START_TIMER':
      // Create new cycle if none exists or starting work after a long break
      let cycle = state.currentCycle;
      
      if (!cycle || (action.payload.type === 'work' && state.nextSessionType === 'work' && getTotalWorkSessionsInCycle(state.currentCycle) === 0)) {
        cycle = {
          id: Date.now().toString(),
          label: state.defaultLabel,
          category: state.defaultCategory,
          startTime: Date.now(),
          completed: false,
          sessions: [],
        };
      }

      const session: Session = {
        id: Date.now().toString() + '_session',
        cycleId: cycle.id,
        type: action.payload.type,
        duration: action.payload.duration,
        startTime: Date.now(),
        completed: false,
      };

      return {
        ...state,
        currentSession: session,
        currentCycle: cycle,
        timeRemaining: action.payload.duration * 60, // Convert to seconds
        timerState: 'running',
        nextSessionType: null, // Clear next session when starting manually
      };

    case 'START_NEW_CYCLE':
      const newCycle: Cycle = {
        id: Date.now().toString(),
        label: state.defaultLabel,
        category: state.defaultCategory,
        startTime: Date.now(),
        completed: false,
        sessions: [],
      };
      return {
        ...state,
        currentCycle: newCycle,
      };

    case 'PAUSE_TIMER':
      return {
        ...state,
        timerState: 'paused',
      };

    case 'RESUME_TIMER':
      return {
        ...state,
        timerState: 'running',
      };

    case 'STOP_TIMER':
      return {
        ...state,
        currentSession: null,
        currentCycle: null, // Clear the current cycle
        timeRemaining: 0,
        timerState: 'idle',
        nextSessionType: null,
      };

    case 'SKIP_TIMER':
      // Determine next session type based on current session and settings
      let nextTypeSkip: Session['type'] | null = null;
      let shouldEndCycle = false;
      
      if (state.currentSession?.type === 'work') {
        const currentTotalWorkSessions = getTotalWorkSessionsInCycle(state.currentCycle) + 1; // +1 for current session
        // Check if it's time for a long break
        if (currentTotalWorkSessions % state.settings.cycleDuration === 0) {
          nextTypeSkip = 'longBreak';
        } else {
          nextTypeSkip = 'shortBreak';
        }
      } else if (state.currentSession?.type === 'shortBreak') {
        nextTypeSkip = 'work';
      } else if (state.currentSession?.type === 'longBreak') {
        nextTypeSkip = 'work';
        shouldEndCycle = true; // End cycle when long break is skipped
      }

      const currentSession = state.currentSession ? {
        ...state.currentSession,
        endTime: Date.now(),
        completed: false,
      } : null;

      const currentCycle = shouldEndCycle ? null : state.currentCycle ? {
        ...state.currentCycle,
        sessions: [...state.currentCycle.sessions, currentSession as Session],
      } : null;

      return {
        ...state,
        currentSession: state.currentSession ? {
          ...state.currentSession,
          endTime: Date.now(),
          completed: false,
        } : null,
        currentCycle: currentCycle, // Clear cycle if long break was skipped
        timeRemaining: 0,
        timerState: 'idle',
        nextSessionType: nextTypeSkip,
      };

    case 'TICK':
      const newTimeRemaining = Math.max(0, state.timeRemaining - 1);
      return {
        ...state,
        timeRemaining: newTimeRemaining,
        timerState: newTimeRemaining === 0 ? 'completed' : state.timerState,
      };

    case 'COMPLETE_SESSION':
      // Determine next session type based on current session and settings
      let nextType: Session['type'] | null = null;
      let shouldCompleteCycle = false;
      
      // Add completed session to current cycle first
      const completedSession = state.currentSession ? {
        ...state.currentSession,
        endTime: Date.now(),
        completed: true,
      } : null;

      const updatedCycleWithSession = state.currentCycle && completedSession ? {
        ...state.currentCycle,
        sessions: [...state.currentCycle.sessions, completedSession],
      } : state.currentCycle;
      
      if (state.currentSession?.type === 'work') {
        const totalWorkSessionsAfterThis = getTotalWorkSessionsInCycle(updatedCycleWithSession);
        // Check if it's time for a long break
        if (totalWorkSessionsAfterThis % state.settings.cycleDuration === 0) {
          nextType = 'longBreak';
        } else {
          nextType = 'shortBreak';
        }
      } else if (state.currentSession?.type === 'shortBreak') {
        nextType = 'work';
      } else if (state.currentSession?.type === 'longBreak') {
        nextType = 'work';
        shouldCompleteCycle = true; // Cycle ends after long break
      }

      // Final cycle with end time if completing
      const finalCycle = updatedCycleWithSession && shouldCompleteCycle ? {
        ...updatedCycleWithSession,
        endTime: Date.now(),
      } : updatedCycleWithSession;

      return {
        ...state,
        currentSession: completedSession,
        currentCycle: shouldCompleteCycle ? null : finalCycle, // Clear cycle if completed
        timerState: 'idle',
        nextSessionType: nextType,
      };

    case 'COMPLETE_CYCLE':
      return {
        ...state,
        currentCycle: state.currentCycle ? {
          ...state.currentCycle,
          endTime: Date.now(),
          completed: true,
        } : null,
        completedCycles: state.completedCycles + 1,
      };

    case 'INCREMENT_COMPLETED':
      return {
        ...state,
        completedCycles: state.completedCycles + 1,
      };

    case 'AUTO_START_NEXT':
      if (state.nextSessionType) {
        // Create new cycle if starting work after long break
        let cycle = state.currentCycle;
        
        if (state.nextSessionType === 'work' && !cycle) {
          cycle = {
            id: Date.now().toString(),
            label: state.defaultLabel,
            category: state.defaultCategory,
            startTime: Date.now(),
            completed: false,
            sessions: [],
          };
        }

        const nextSession: Session = {
          id: Date.now().toString() + '_session',
          cycleId: cycle?.id || 'unknown',
          type: state.nextSessionType,
          duration: action.payload.duration,
          startTime: Date.now(),
          completed: false,
        };

        return {
          ...state,
          currentSession: nextSession,
          currentCycle: cycle,
          timeRemaining: action.payload.duration * 60,
          timerState: 'running',
          nextSessionType: null,
        };
      }
      return state;

    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };

    case 'LOAD_SETTINGS':
      return {
        ...state,
        settings: action.payload,
      };

    case 'RESET_STATS':
      return {
        ...state,
        completedCycles: action.payload || 0,
      };

    case 'UPDATE_CYCLE_LABEL':
      return {
        ...state,
        currentCycle: state.currentCycle ? {
          ...state.currentCycle,
          label: action.payload.label,
          category: action.payload.category,
        } : null,
      };

    case 'SET_DEFAULT_LABEL':
      return {
        ...state,
        defaultLabel: action.payload.label,
        defaultCategory: action.payload.category,
      };

    default:
      return state;
  }
}

const TimerContext = createContext<ITimerContext | null>(null);

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(timerReducer, initialState);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const backgroundTimeRef = useRef<number | null>(null);
  const autoStartTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize audio and load settings
  useEffect(() => {
    AudioService.initializeAudio();
    loadSettings();
    loadTodayStats();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (autoStartTimeoutRef.current) {
        clearTimeout(autoStartTimeoutRef.current);
      }
      AudioService.cleanup();
    };
  }, []);

  // Handle app state changes for background timer
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background' && state.timerState === 'running') {
        backgroundTimeRef.current = Date.now();
      } else if (nextAppState === 'active' && backgroundTimeRef.current && state.timerState === 'running') {
        const backgroundTime = Math.floor((Date.now() - backgroundTimeRef.current) / 1000);
        
        // Update timer with background time
        for (let i = 0; i < backgroundTime; i++) {
          dispatch({ type: 'TICK' });
        }
        
        backgroundTimeRef.current = null;
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [state.timerState, state.timeRemaining]);

  // Timer tick effect
  useEffect(() => {
    if (state.timerState === 'running') {
      timerRef.current = setInterval(() => {
        dispatch({ type: 'TICK' });
      }, TIMER_TICK_INTERVAL);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [state.timerState]);

  // Handle session completion
  useEffect(() => {
    if (state.timerState === 'completed' && state.currentSession) {
      handleSessionComplete();
    }
  }, [state.timerState]);

  // Handle auto-start logic
  useEffect(() => {
    if (state.nextSessionType && state.timerState === 'idle') {
      const shouldAutoStart = 
        (state.nextSessionType === 'work' && state.settings.autoStartWorkSessions) ||
        ((state.nextSessionType === 'shortBreak' || state.nextSessionType === 'longBreak') && state.settings.autoStartBreaks);

      if (shouldAutoStart) {
        // Auto-start after a brief delay (3 seconds)
        autoStartTimeoutRef.current = setTimeout(() => {
          startNextSession();
        }, 3000);
      }
    }

    return () => {
      if (autoStartTimeoutRef.current) {
        clearTimeout(autoStartTimeoutRef.current);
      }
    };
  }, [state.nextSessionType, state.timerState, state.settings.autoStartBreaks, state.settings.autoStartWorkSessions]);

  const loadSettings = async () => {
    const settings = await StorageService.getSettings();
    dispatch({ type: 'LOAD_SETTINGS', payload: settings });
  };

  const loadTodayStats = async () => {
    const stats = await StorageService.getTodayStats();
    // This would be more robust with proper state management
    if (stats.completedCycles > 0) {
      for (let i = 0; i < stats.completedCycles; i++) {
        dispatch({ type: 'INCREMENT_COMPLETED' });
      }
    }
  };

  const handleSessionComplete = async () => {
    if (!state.currentSession || !state.currentCycle) return;

    // Play notification sound
    if (state.settings.soundEnabled) {
      await AudioService.playNotificationSound(state.settings.volume / 100);
    }

    // Save completed session
    const completedSession = {
      ...state.currentSession,
      endTime: Date.now(),
      completed: true,
    };
    await StorageService.saveSession(completedSession);

    // Update stats
    const sessionDuration = state.currentSession.duration;
    const todayStats = await StorageService.getTodayStats();
    
    if (state.currentSession.type === 'work') {
      // Check if this work session completes a full pomodoro cycle
      const currentTotalWorkSessions = getTotalWorkSessionsInCycle(state.currentCycle) + 1; // +1 for current session
      const isFullCycleComplete = currentTotalWorkSessions % state.settings.cycleDuration === 0;
      
      await StorageService.updateTodayStats({
        totalFocusTime: todayStats.totalFocusTime + sessionDuration,
      });
    } else if (state.currentSession.type === 'longBreak') {
      // Create the finished cycle with the completed session first
      const finishedCycle = {
        ...state.currentCycle,
        sessions: [...state.currentCycle.sessions, completedSession],
        endTime: Date.now(),
        completed: false, // Will be updated below
      };
      
      // Check if the cycle qualifies as completed (with the long break session included)
      const totalWorkSessions = state.settings.cycleDuration; // e.g., 4 work sessions
      const requiredCompletedSessions = Math.ceil(totalWorkSessions / 2); // At least half (e.g., 2 out of 4)
      const completedWorkSessions = getCompletedWorkSessionsInCycle(finishedCycle);
      const cycleIsCompleted = completedWorkSessions >= requiredCompletedSessions;
      
      // Debug logging
      console.log('Cycle completion check:', {
        totalWorkSessions,
        requiredCompletedSessions,
        completedWorkSessions,
        cycleIsCompleted,
        cycleSessions: finishedCycle.sessions.length
      });
      
      // Update the cycle's completed status
      finishedCycle.completed = cycleIsCompleted;
      
      await StorageService.saveCycle(finishedCycle);

      // Only count as completed cycle and update stats if cycle qualifies as completed
      if (cycleIsCompleted) {
        dispatch({ type: 'COMPLETE_CYCLE' });

        // Update category stats for completed cycle
        const updatedCategories = { ...todayStats.categories };
        if (state.currentCycle.category) {
          updatedCategories[state.currentCycle.category] = 
            (updatedCategories[state.currentCycle.category] || 0) + 1;
        }

        await StorageService.updateTodayStats({
          completedCycles: state.completedCycles + 1,
          totalBreakTime: todayStats.totalBreakTime + sessionDuration,
          categories: updatedCategories,
        });
      } else {
        // Cycle was not completed (too many skipped sessions) - only update break time
        await StorageService.updateTodayStats({
          totalBreakTime: todayStats.totalBreakTime + sessionDuration,
        });
      }
    } else {
      // Short break session
      await StorageService.updateTodayStats({
        totalBreakTime: todayStats.totalBreakTime + sessionDuration,
      });
    }

    dispatch({ type: 'COMPLETE_SESSION' });
  };

  const startNextSession = () => {
    if (!state.nextSessionType) return;

    let duration: number;
    switch (state.nextSessionType) {
      case 'work':
        duration = state.settings.workDuration;
        break;
      case 'shortBreak':
        duration = state.settings.shortBreakDuration;
        break;
      case 'longBreak':
        duration = state.settings.longBreakDuration;
        break;
      default:
        return;
    }

    dispatch({
      type: 'AUTO_START_NEXT',
      payload: { duration },
    });
  };

  const startTimer = (type: Session['type']) => {
    // Clear any pending auto-start
    if (autoStartTimeoutRef.current) {
      clearTimeout(autoStartTimeoutRef.current);
      autoStartTimeoutRef.current = null;
    }

    let duration: number;
    switch (type) {
      case 'work':
        duration = state.settings.workDuration;
        break;
      case 'shortBreak':
        duration = state.settings.shortBreakDuration;
        break;
      case 'longBreak':
        duration = state.settings.longBreakDuration;
        break;
      default:
        duration = state.settings.workDuration;
    }

    dispatch({
      type: 'START_TIMER',
      payload: { type, duration },
    });
  };

  const pauseTimer = () => {
    dispatch({ type: 'PAUSE_TIMER' });
  };

  const resumeTimer = () => {
    dispatch({ type: 'RESUME_TIMER' });
  };

  const stopTimer = () => {
    // Clear any pending auto-start
    if (autoStartTimeoutRef.current) {
      clearTimeout(autoStartTimeoutRef.current);
      autoStartTimeoutRef.current = null;
    }
    dispatch({ type: 'STOP_TIMER' });
  };

  const skipTimer = async () => {
    if (state.currentSession) {
      // Save the skipped session (but don't count it as completed for stats)
      const skippedSession = {
        ...state.currentSession,
        endTime: Date.now(),
        completed: false, // Mark as not completed since it was skipped
      };
      await StorageService.saveSession(skippedSession);

      // If skipping a long break, need to handle cycle completion
      if (state.currentSession.type === 'longBreak' && state.currentCycle) {
        // Create the finished cycle with the skipped long break session
        const finishedCycle = {
          ...state.currentCycle,
          sessions: [...state.currentCycle.sessions, skippedSession],
          endTime: Date.now(),
          completed: false, // Will be updated below
        };
        
        // Check if the cycle qualifies as completed (even with skipped long break)
        const totalWorkSessions = state.settings.cycleDuration;
        const requiredCompletedSessions = Math.floor(totalWorkSessions / 2);
        const completedWorkSessions = getCompletedWorkSessionsInCycle(finishedCycle);
        const cycleIsCompleted = completedWorkSessions >= requiredCompletedSessions;
        
        // Update the cycle's completed status
        finishedCycle.completed = cycleIsCompleted;
        
        await StorageService.saveCycle(finishedCycle);

        // Only count as completed cycle if cycle qualifies as completed
        if (cycleIsCompleted) {
          const todayStats = await StorageService.getTodayStats();
          dispatch({ type: 'COMPLETE_CYCLE' });

          // Update category stats for completed cycle
          const updatedCategories = { ...todayStats.categories };
          if (state.currentCycle.category) {
            updatedCategories[state.currentCycle.category] = 
              (updatedCategories[state.currentCycle.category] || 0) + 1;
          }

          await StorageService.updateTodayStats({
            completedCycles: state.completedCycles + 1,
            categories: updatedCategories,
          });
        }
      }

      // Dispatch skip action to immediately reset timer
      dispatch({ type: 'SKIP_TIMER' });
    }
  };

  const updateSettings = async (newSettings: Partial<Settings>) => {
    const updatedSettings = { ...state.settings, ...newSettings };
    dispatch({ type: 'UPDATE_SETTINGS', payload: newSettings });
    await StorageService.saveSettings(updatedSettings);
  };

  const refreshStats = async () => {
    // Reset the completed cycles counter first
    dispatch({ type: 'RESET_STATS', payload: 0 });
    
    // Then reload today's stats
    const stats = await StorageService.getTodayStats();
    if (stats.completedCycles > 0) {
      // Set the correct count based on storage
      dispatch({ type: 'RESET_STATS', payload: stats.completedCycles });
    }
  };

  const updateCycleLabel = async (label: string, category: string) => {
    if (state.currentCycle) {
      dispatch({
        type: 'UPDATE_CYCLE_LABEL',
        payload: { label, category },
      });
    }
  };

  const setDefaultLabel = (label: string, category: string) => {
    dispatch({
      type: 'SET_DEFAULT_LABEL',
      payload: { label, category },
    });
  };

  const contextValue: ITimerContext = {
    currentSession: state.currentSession,
    currentCycle: state.currentCycle,
    timeRemaining: state.timeRemaining,
    timerState: state.timerState,
    completedCycles: state.completedCycles,
    settings: state.settings,
    nextSessionType: state.nextSessionType,
    defaultLabel: state.defaultLabel,
    defaultCategory: state.defaultCategory,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    skipTimer,
    updateSettings,
    startNextSession,
    refreshStats,
    updateCycleLabel,
    setDefaultLabel,
  };

  return <TimerContext.Provider value={contextValue}>{children}</TimerContext.Provider>;
}

export function useTimer(): ITimerContext {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
} 