import React, { createContext, useState, useContext, ReactNode } from 'react';

interface DateContextType {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}

const DateContext = createContext<DateContextType | undefined>(undefined);

// Helper function to normalize date to midnight (removes time component)
const normalizeDate = (date: Date): Date => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

export const DateProvider = ({ children }: { children: ReactNode }) => {
  const [selectedDate, setSelectedDate] = useState(normalizeDate(new Date()));

  const setNormalizedDate = (date: Date) => {
    setSelectedDate(normalizeDate(date));
  };

  return (
    <DateContext.Provider value={{ selectedDate, setSelectedDate: setNormalizedDate }}>
      {children}
    </DateContext.Provider>
  );
};

export const useDate = () => {
  const context = useContext(DateContext);
  if (!context) {
    throw new Error('useDate must be used within a DateProvider');
  }
  return context;
};