import { useState, useCallback } from 'react';
import { useDate } from '../context/DateContext';

export const useDateManager = () => {
  const { selectedDate, setSelectedDate } = useDate();
  const [isCalendarVisible, setCalendarVisible] = useState(false);

  const handleDateChange = useCallback((direction: 'prev' | 'next' | 'today') => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (direction === 'today') {
      setSelectedDate(today);
      return;
    }

    const newDate = new Date(selectedDate);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 1);
    } else if (direction === 'next') {
      // Prevent going past today
      if (selectedDate.getTime() >= today.getTime()) return;
      newDate.setDate(newDate.getDate() + 1);
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
