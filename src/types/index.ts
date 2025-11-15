// Type definitions for the entire app

export type EntryType = 'meal' | 'workout';

export interface Entry {
  id: number;
  icon: string;
  name: string;
  category: string;
  source: string;
  calories: number;
  type: EntryType;
}

export interface ChartDataPoint {
  label: string;
  value: number;
}

export type Period = 'today' | 'week' | 'month';

export type Mode = 'calories' | 'workout';

export interface DateItem {
  day: number;
  label: string;
}

export interface NavItem {
  name: string;
  path: string;
  icon: string;
  isCenter?: boolean;
}

export interface Stat {
  label: string;
  value: string;
  icon: string;
  color: string;
}

// Navigation types
export type RootStackParamList = {
  Welcome: undefined;
  Dashboard: undefined;
  AddEntry: undefined;
  Stats: undefined;
};

export type ScreenName = keyof RootStackParamList;
