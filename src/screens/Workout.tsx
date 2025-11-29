import React, { useState } from 'react';
import { View, ScrollView, Alert, KeyboardAvoidingView, Platform, Text, TouchableOpacity } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import BottomNav from '../components/BottomNav';
import TemplateManager from '../components/TemplateManager';
import WorkoutDayActionSheet from '../components/WorkoutDayActionSheet';
import { useDateManager } from '../hooks/useDateManager';
import { useWorkout } from '../hooks/useWorkout';
import { useWeeklyPlan } from '../hooks/useWeeklyPlan';
import { WorkoutDay, WorkoutTemplate, DayOfWeek } from '../types';
import DateHeader from '../components/common/DateHeader';
import WorkoutCalendarModal from '../components/workout/WorkoutCalendarModal';
import { ChangeDayModal } from '../components/workout/ChangeDayModal';
import { RenameDayModal } from '../components/workout/RenameDayModal';
import { CountdownTimer } from '../components/workout/CountdownTimer';
import { InlineLoopingTimer } from '../components/workout/InlineLoopingTimer';
import { WeekPlannerModal } from '../components/workout/WeekPlannerModal';
import { useTheme } from '../context/ThemeContext';
import WorkoutHeader from '../components/workout/WorkoutHeader';
import DaySelector from '../components/workout/DaySelector';
import { BackgroundPattern } from '../components/common/BackgroundPattern';
import { useWorkoutModals } from '../hooks/useWorkoutModals';
import { WorkoutContent } from '../components/workout/WorkoutContent';
import { getStartOfWeek } from '../utils/formatters';
import { generateId, generateUniqueId } from '../utils/generators';
import {
  loadWorkoutLog,
  saveWorkoutLog as saveWorkoutLogService
} from '../services/workoutStorage.service';

import { getWorkoutStyles } from '../styles/Workout.styles';

export default function Workout() {
  const { colors } = useTheme();
  const styles = getWorkoutStyles(colors);

  const {
    selectedDate,
    isCalendarVisible,
    handleDateChange,
    handleDateSelectFromCalendar,
    openCalendar,
    closeCalendar,
    isToday,
  } = useDateManager();

  const {
    workoutLog,
    previousWorkout,
    program,
    templates,
    isLoading,
    yesterdaysWorkoutName,
    addDayToProgram,
    renameProgramDay,
    duplicateProgramDay,
    deleteProgramDay,
    toggleRestDay,
    addExerciseToLog,
    updateExerciseInLog,
    deleteExerciseFromLog,
    selectDayToLog,
    saveCurrentAsTemplate,
    loadTemplate,
    renameTemplate,
    deleteTemplate,
    setWorkoutLog,
    saveWorkoutLog,
  } = useWorkout(selectedDate);

  const modals = useWorkoutModals();
  const [selectedDay, setSelectedDay] = useState<WorkoutDay | null>(null);
  const [newDayName, setNewDayName] = useState('');
  const [isWeekPlannerVisible, setIsWeekPlannerVisible] = useState(false);

  const { weeklyPlan, updateDayPlan, clearWeeklyPlan } = useWeeklyPlan();

  const handleOpenDayActionSheet = (day: WorkoutDay) => {
    setSelectedDay(day);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    modals.actionSheet.open();
  };

  const handleEditDay = () => {
    if (!selectedDay || selectedDay.isRest) return;
    modals.actionSheet.close();
    Alert.prompt('Rename Day', 'Enter the new name:', (newName) => {
      if (newName) {
        renameProgramDay(selectedDay.id, newName);
      }
    });
  };

  const handleDuplicateDay = () => {
    if (!selectedDay) return;
    duplicateProgramDay(selectedDay.id);
    modals.actionSheet.close();
  };

  const handleDeleteDay = () => {
    if (!selectedDay) return;
    modals.actionSheet.close();
    Alert.alert('Delete Day', `Are you sure you want to delete "${selectedDay.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteProgramDay(selectedDay.id) },
    ]);
  };

  const handleAddDay = () => {
    Alert.prompt('Add Day', 'Enter the name for the new day:', (name) => {
      if (name) {
        addDayToProgram(name);
      }
    });
  };

  const handleSaveRename = () => {
    if (!newDayName.trim()) {
      Alert.alert('Invalid Name', 'Workout day name cannot be empty.');
      return;
    }
    if (workoutLog) {
      const updatedLog = { ...workoutLog, name: newDayName.trim() };
      setWorkoutLog(updatedLog);
      saveWorkoutLog(updatedLog);
    }
    modals.renameModal.close();
  };

  const handleSaveTemplate = () => {
    Alert.prompt('Save Template', 'Enter a name for this template:', (templateName) => {
      if (templateName) {
        saveCurrentAsTemplate(templateName);
      }
    });
  };

  const handleLoadTemplate = (template: WorkoutTemplate) => {
    Alert.alert(
      'Load Template',
      `This will replace your current workout schedule. Load "${template.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Load',
          onPress: () => {
            loadTemplate(template);
            modals.templateManager.close();
          },
        },
      ]
    );
  };

  const handleToggleRestDay = () => {
    if (workoutLog) {
      Alert.alert(
        'Make Rest Day',
        'Are you sure you want to make this a rest day? Your logged exercises for today will be saved but hidden.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Confirm',
            onPress: () => {
              const updatedLog = { ...workoutLog, isRest: true };
              setWorkoutLog(updatedLog);
              saveWorkoutLog(updatedLog);
            },
          },
        ]
      );
    }
  };

  const handleClearWeeklyPlan = () => {
    Alert.alert(
      'Clear Weekly Plan',
      'Are you sure you want to clear all planned workouts for the week?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => clearWeeklyPlan(),
        },
      ]
    );
  };

  const handlePopulateWeek = async () => {
    const workoutDays = program.filter(day => !day.isRest);

    if (workoutDays.length === 0) {
      Alert.alert('No Workouts', 'Please add workout days to your program first.');
      return;
    }

    // Check if user has set up a weekly plan
    const hasWeeklyPlan = Object.values(weeklyPlan).some(dayId => dayId !== null);

    // Check for existing logs in the current week
    const startOfWeek = getStartOfWeek(selectedDate);
    let existingLogsCount = 0;

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const existingLog = await loadWorkoutLog(date);
      if (existingLog) {
        existingLogsCount++;
      }
    }

    const message = hasWeeklyPlan
      ? 'This will create workout logs for the current week based on your weekly plan.'
      : `This will set up a default weekly plan and create workout logs with your ${workoutDays.length} workout day${workoutDays.length > 1 ? 's' : ''} in a repeating pattern.`;

    // If there are existing logs, ask about override behavior
    if (existingLogsCount > 0) {
      Alert.alert(
        'Auto-Populate Week',
        `${message}\n\nFound ${existingLogsCount} existing workout log${existingLogsCount > 1 ? 's' : ''} in the current week. What would you like to do?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Skip Existing',
            onPress: () => populateWeek(hasWeeklyPlan, false),
          },
          {
            text: 'Override All',
            style: 'destructive',
            onPress: () => populateWeek(hasWeeklyPlan, true),
          },
        ]
      );
    } else {
      // No existing logs, just populate
      Alert.alert(
        'Auto-Populate Week',
        message,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Populate',
            onPress: () => populateWeek(hasWeeklyPlan, false),
          },
        ]
      );
    }
  };

  const populateWeek = async (hasWeeklyPlan: boolean, shouldOverride: boolean) => {
    try {
      const daysOfWeek: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const workoutDays = program.filter(day => !day.isRest);

      // If no weekly plan exists, create a default repeating pattern
      if (!hasWeeklyPlan) {
        daysOfWeek.forEach((day, index) => {
          const workoutIndex = index % workoutDays.length;
          updateDayPlan(day, workoutDays[workoutIndex].id);
        });
        // Wait a bit for the weekly plan to update
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Create actual workout logs for the current week based on weekly plan
      const startOfWeek = getStartOfWeek(selectedDate);
      let logsCreated = 0;
      let logsOverwritten = 0;
      let logsSkipped = 0;

      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        const dayOfWeek = daysOfWeek[i];

        // Get the workout ID from the weekly plan for this day
        const workoutDayId = weeklyPlan[dayOfWeek];

        // Skip if no workout assigned for this day
        if (workoutDayId === null) {
          continue;
        }

        // Check if there's already a workout log for this date
        const existingLog = await loadWorkoutLog(date);
        if (existingLog && !shouldOverride) {
          logsSkipped++;
          continue;
        }

        // Find the workout day template
        const workoutDay = program.find(day => day.id === workoutDayId);

        if (!workoutDay) {
          continue;
        }

        // Create a fresh workout log from the template (without copying exercise logs)
        const newLog: WorkoutDay = {
          id: generateId(),
          name: workoutDay.name,
          isRest: workoutDay.isRest,
          exercises: workoutDay.exercises.map(exercise => ({
            id: generateUniqueId(), // Use generateUniqueId to prevent duplicate keys when mapping
            name: exercise.name,
            target: exercise.target, // Copy target from template
            actual: '', // Start with empty actual
            weight: '', // Start with empty weight
            sets: exercise.sets, // Legacy field for backwards compatibility
          })),
        };

        await saveWorkoutLogService(date, newLog);

        if (existingLog) {
          logsOverwritten++;
        } else {
          logsCreated++;
        }
      }

      // Reload current day's data if it was in the populated range
      const currentLog = await loadWorkoutLog(selectedDate);
      if (currentLog) {
        setWorkoutLog(currentLog);
      }

      // Show appropriate success message
      const total = logsCreated + logsOverwritten;
      if (total > 0) {
        let message = '';
        if (logsOverwritten > 0 && logsCreated > 0) {
          message = `Created ${logsCreated} new log${logsCreated > 1 ? 's' : ''} and overwritten ${logsOverwritten} existing log${logsOverwritten > 1 ? 's' : ''}.`;
        } else if (logsOverwritten > 0) {
          message = `Overwritten ${logsOverwritten} workout log${logsOverwritten > 1 ? 's' : ''}.`;
        } else {
          message = `Created ${logsCreated} workout log${logsCreated > 1 ? 's' : ''} for the week!`;
        }

        if (logsSkipped > 0) {
          message += ` Skipped ${logsSkipped} existing log${logsSkipped > 1 ? 's' : ''}.`;
        }

        Alert.alert('Success', message);
      } else {
        Alert.alert('Info', 'All days in the week already have workout logs.');
      }
    } catch (error) {
      console.error('Error populating week:', error);
      Alert.alert('Error', 'Failed to populate the week. Please try again.');
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={styles.container}>
          <BackgroundPattern />
          <TemplateManager
            isVisible={modals.templateManager.isVisible}
            templates={templates}
            onClose={modals.templateManager.close}
            onLoadTemplate={handleLoadTemplate}
            onSaveCurrent={handleSaveTemplate}
            onRenameTemplate={renameTemplate}
            onDeleteTemplate={deleteTemplate}
          />
          <WorkoutDayActionSheet
            visible={modals.actionSheet.isVisible}
            onClose={modals.actionSheet.close}
            onEdit={handleEditDay}
            onDuplicate={handleDuplicateDay}
            onDelete={handleDeleteDay}
            onToggleRestDay={() => {
              if (selectedDay) {
                toggleRestDay(selectedDay.id);
              }
              modals.actionSheet.close();
            }}
            isRestDay={selectedDay?.isRest}
          />
          <WorkoutCalendarModal
            isVisible={isCalendarVisible}
            onClose={closeCalendar}
            onDateSelect={handleDateSelectFromCalendar}
            selectedDate={selectedDate}
          />
          <ChangeDayModal
            isVisible={modals.changeDayModal.isVisible}
            onClose={modals.changeDayModal.close}
            onSelect={(name) => {
              if (workoutLog) {
                const updatedLog = { ...workoutLog, name };
                setWorkoutLog(updatedLog);
                saveWorkoutLog(updatedLog);
              }
              modals.changeDayModal.close();
            }}
            programDays={program}
            onAdd={handleAddDay}
            onDelete={deleteProgramDay}
          />
          <RenameDayModal
            isVisible={modals.renameModal.isVisible}
            onClose={modals.renameModal.close}
            onSave={handleSaveRename}
            newDayName={newDayName}
            setNewDayName={setNewDayName}
          />
          <CountdownTimer
            isVisible={modals.timer.isVisible}
            onClose={modals.timer.close}
          />
          <WeekPlannerModal
            isVisible={isWeekPlannerVisible}
            onClose={() => setIsWeekPlannerVisible(false)}
            weeklyPlan={weeklyPlan}
            programDays={program}
            onUpdateDay={updateDayPlan}
            onClearPlan={handleClearWeeklyPlan}
            onPopulateWeek={handlePopulateWeek}
          />

          <ScrollView contentContainerStyle={styles.content}>
            <WorkoutHeader onOpenTemplateManager={modals.templateManager.open} />
            <DaySelector
              program={program}
              onSelectDay={selectDayToLog}
              onLongPressDay={handleOpenDayActionSheet}
              onAddDay={handleAddDay}
            />

            <DateHeader
              date={selectedDate}
              onPrev={() => handleDateChange('prev')}
              onNext={() => handleDateChange('next')}
              onToday={() => handleDateChange('today')}
              onPressDate={openCalendar}
            />

            <View style={styles.yesterdayIndicator}>
              {!isToday ? (
                <TouchableOpacity onPress={() => handleDateChange('today')}>
                  <Text style={styles.yesterdayText}>Jump to Today</Text>
                </TouchableOpacity>
              ) : yesterdaysWorkoutName === 'REST_DAY' ? (
                <Text style={styles.yesterdayText}>Yesterday: Rest Day</Text>
              ) : yesterdaysWorkoutName ? (
                <Text style={styles.yesterdayText}>Yesterday: {yesterdaysWorkoutName}</Text>
              ) : null}
            </View>

            <WorkoutContent
              workoutLog={workoutLog}
              previousWorkout={previousWorkout}
              isLoading={isLoading}
              onOpenTimer={modals.timer.open}
              onOpenChangeDayModal={modals.changeDayModal.open}
              onOpenRenameModal={() => {
                if (workoutLog) {
                  setNewDayName(workoutLog.name);
                  modals.renameModal.open();
                }
              }}
              onToggleRestDay={handleToggleRestDay}
              onUpdateExercise={updateExerciseInLog}
              onDeleteExercise={deleteExerciseFromLog}
              onAddExercise={addExerciseToLog}
            />

            <InlineLoopingTimer />

            <TouchableOpacity
              style={styles.planWeekButton}
              onPress={() => setIsWeekPlannerVisible(true)}
            >
              <Text style={styles.planWeekButtonText}>Plan Your Week</Text>
            </TouchableOpacity>
          </ScrollView>
          <BottomNav />
        </View>
      </KeyboardAvoidingView>
    </GestureHandlerRootView>
  );
}
