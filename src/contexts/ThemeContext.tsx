import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useColorScheme, Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark';
export type ThemePreference = 'auto' | 'light' | 'dark';

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  muted: string;
  white: string;
  border: string;
  shadow: string;
  buttonShadow: string;
  error: string;
  success: string;
  warning: string;
}

const lightTheme: ThemeColors = {
  primary: '#ff6b6b',
  secondary: '#51cf66',
  accent: '#ffa94d',
  background: '#fafafa',
  surface: '#ffffff',
  text: '#343a40',
  textSecondary: '#495057',
  muted: '#868e96',
  white: '#ffffff',
  border: '#e9ecef',
  shadow: 'rgba(0, 0, 0, 0.1)',
  buttonShadow: '#ffffff',
  error: '#e74c3c',
  success: '#51cf66',
  warning: '#f39c12',
};

const darkTheme: ThemeColors = {
  primary: '#ff7979',
  secondary: '#55a3ff',
  accent: '#fdcb6e',
  background: '#1a1a1a',
  surface: '#2c2c2c',
  text: '#f8f9fa',
  textSecondary: '#e9ecef',
  muted: '#adb5bd',
  white: '#ffffff',
  border: '#495057',
  shadow: 'rgba(0, 0, 0, 0.3)',
  buttonShadow: '#2c2c2c',
  error: '#ff6b6b',
  success: '#55a3ff',
  warning: '#fdcb6e',
};

interface ThemeContextType {
  theme: ThemeMode;
  colors: ThemeColors;
  themePreference: ThemePreference;
  systemTheme: ThemeMode;
  setThemePreference: (preference: ThemePreference) => Promise<void>;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@PomodoroX:theme_preference';

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>('auto');
  const [isLoading, setIsLoading] = useState(true);

  // Determine system theme with fallback
  const systemTheme: ThemeMode = systemColorScheme === 'dark' ? 'dark' : 'light';

  // Determine active theme based on preference
  const activeTheme: ThemeMode = themePreference === 'auto' ? systemTheme : themePreference;
  
  // Get theme colors
  const colors = activeTheme === 'dark' ? darkTheme : lightTheme;
  const isDark = activeTheme === 'dark';

  // Load saved theme preference on mount
  useEffect(() => {
    loadThemePreference();
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      // Only react to system changes if user is in auto mode
      if (themePreference === 'auto') {
        console.log('System theme changed to:', colorScheme);
      }
    });

    return () => subscription?.remove();
  }, [themePreference]);

  const loadThemePreference = async () => {
    try {
      const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (saved && ['auto', 'light', 'dark'].includes(saved)) {
        setThemePreferenceState(saved as ThemePreference);
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setThemePreference = async (preference: ThemePreference) => {
    try {
      setThemePreferenceState(preference);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, preference);
      console.log('Theme preference saved:', preference);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const contextValue: ThemeContextType = {
    theme: activeTheme,
    colors,
    themePreference,
    systemTheme,
    setThemePreference,
    isDark,
  };

  // Don't render until theme is loaded
  if (isLoading) {
    return null;
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Legacy Colors export for backward compatibility
export function getColors(theme: ThemeMode): ThemeColors {
  return theme === 'dark' ? darkTheme : lightTheme;
} 