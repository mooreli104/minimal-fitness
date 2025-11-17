import { useState, useCallback } from 'react';
import { useDate } from '../context/DateContext';

export const useDateManager = () => {
  const { selectedDate, setSelectedDate } = useDate();
  const [isCalendarVisible, setCalendarVisible] = useState(false);

  const handleDateChange = useCallback((direction: 'prev' | 'next' | 'today') => {
    const newDate = new Date(selectedDate);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 1);
    } else if (direction === 'next') {
      if (selectedDate.toDateString() === new Date().toDateString()) return;
      newDate.setDate(newDate.getDate() + 1);
    } else {
      setSelectedDate(new Date());
      return;
    }
    setSelectedDate(newDate);
  }, [selectedDate, setSelectedDate]);

  const handleDateSelectFromCalendar = useCallback((date: Date) => {
    setSelectedDate(date);
    setCalendarVisible(false);
  }, [setSelectedDate]);

  const openCalendar = () => setCalendarVisible(true);
  const closeCalendar = () => setCalendarVisible(false);

  return {
    selectedDate,
    isCalendarVisible,
    handleDateChange,
    handleDateSelectFromCalendar,
    openCalendar,
    closeCalendar,
    isToday: selectedDate.toDateString() === new Date().toDateString(),
  };
};
