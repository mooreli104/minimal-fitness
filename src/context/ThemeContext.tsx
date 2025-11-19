import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Theme = 'light' | 'dark';

export interface ThemeColors {
  // Backgrounds
  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;

  // Text
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;

  // Accent
  accent: string;

  // Status
  error: string;

  // Stat colors
  orange: string;
  blue: string;
  green: string;
  cyan: string;
  red: string;

  // Additional theme-specific colors
  chartLine: string;
  cardBackground: string;
  inputBackground: string;
}

const lightColors: ThemeColors = {
  background: '#FCFCFC',
  surface: '#FFFFFF',
  surfaceAlt: '#F3F4F6',
  border: '#E8E8E8',
  textPrimary: '#111827',
  textSecondary: '#4B5563',
  textTertiary: '#9CA3AF',
  accent: '#0A0A0A',
  error: '#DC2626',
  orange: '#F97316',
  blue: '#3B82F6',
  green: '#10B981',
  cyan: '#06B6D4',
  red: '#EF4444',
  chartLine: '#111111',
  cardBackground: '#FFFFFF',
  inputBackground: '#F3F4F6',
};


const darkColors: ThemeColors = {
  background: '#0B0B0B',
  surface: '#1A1A1A',
  surfaceAlt: '#232323',
  border: '#333333',
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0A0',
  textTertiary: '#707070',
  accent: '#FFFFFF',
  error: '#FF4D4D',
  orange: '#FB923C',
  blue: '#60A5FA',
  green: '#34D399',
  cyan: '#22D3EE',
  red: '#F87171',
  chartLine: '#FFFFFF',
  cardBackground: '#1A1A1A',
  inputBackground: '#2A2A2A',
};


interface ThemeContextType {
  theme: Theme;
  colors: ThemeColors;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@app_theme';

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>('light');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const storedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (storedTheme === 'dark' || storedTheme === 'light') {
        setThemeState(storedTheme);
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
    }
  };

  const setTheme = async (newTheme: Theme) => {
    try {
      setThemeState(newTheme);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  const colors = theme === 'light' ? lightColors : darkColors;

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
