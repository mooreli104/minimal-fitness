import React, { useState } from 'react';
import { View, ScrollView, Alert, KeyboardAvoidingView, Platform, Text, TouchableOpacity } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomNav from '../components/BottomNav';
import TemplateManager from '../components/TemplateManager';
import { useDateManager } from '../hooks/useDateManager';
import { useWorkout } from '../hooks/useWorkout';
import { useWeeklyPlan } from '../hooks/useWeeklyPlan';
import { WorkoutTemplate } from '../types';
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
import { ExerciseHistoryModal } from '../components/workout/ExerciseHistoryModal';
import { useWeekPopulator } from '../hooks/useWeekPopulator';
import ProgramEditor from '../components/workout/ProgramEditor';

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
    addExerciseToDay,
    updateExerciseInDay,
    removeExerciseFromDay,
    reorderDays,
    addExercise,
    updateExercise,
    deleteExercise,
    selectDayToLog,
    saveCurrentAsTemplate,
    loadTemplate,
    renameTemplate,
    deleteTemplate,
    setWorkoutLog,
    saveLog,
  } = useWorkout(selectedDate);

  const modals = useWorkoutModals();
  const [newDayName, setNewDayName] = useState('');
  const [historyExercise, setHistoryExercise] = useState<string>('');
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);

  const handleShowHistory = (exerciseName: string) => {
    setHistoryExercise(exerciseName);
    setIsHistoryVisible(true);
  };
  const [isWeekPlannerVisible, setIsWeekPlannerVisible] = useState(false);

  const { weeklyPlan, updateDayPlan, clearWeeklyPlan } = useWeeklyPlan();

  const { handlePopulateWeek } = useWeekPopulator({
    program,
    weeklyPlan,
    selectedDate,
    updateDayPlan,
    setWorkoutLog,
  });

  const handleAddDay = () => {
    modals.programEditor.open();
  };

  const handleSaveRename = () => {
    if (!newDayName.trim()) {
      Alert.alert('Invalid Name', 'Workout day name cannot be empty.');
      return;
    }
    if (workoutLog) {
      const updatedLog = { ...workoutLog, name: newDayName.trim() };
      setWorkoutLog(updatedLog);
      saveLog(updatedLog);
    }
    modals.renameModal.close();
  };

  const handleSaveTemplate = (templateName: string) => {
    saveCurrentAsTemplate(templateName);
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
              saveLog(updatedLog);
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
                saveLog(updatedLog);
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
          <ExerciseHistoryModal
            isVisible={isHistoryVisible}
            exerciseName={historyExercise}
            currentDate={selectedDate}
            onClose={() => setIsHistoryVisible(false)}
          />
          <ProgramEditor
            isVisible={modals.programEditor.isVisible}
            onClose={modals.programEditor.close}
            program={program}
            onAddDay={addDayToProgram}
            onRenameDay={renameProgramDay}
            onDuplicateDay={duplicateProgramDay}
            onDeleteDay={deleteProgramDay}
            onToggleRestDay={toggleRestDay}
            onReorderDays={reorderDays}
            onAddExercise={addExerciseToDay}
            onUpdateExercise={updateExerciseInDay}
            onRemoveExercise={removeExerciseFromDay}
          />

          <ScrollView contentContainerStyle={styles.content}>
            <WorkoutHeader
              onOpenTemplateManager={modals.templateManager.open}
              onOpenProgramEditor={modals.programEditor.open}
            />
            <DaySelector
              program={program}
              onSelectDay={selectDayToLog}
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
              onUpdateExercise={updateExercise}
              onDeleteExercise={deleteExercise}
              onAddExercise={addExercise}
              onShowHistory={handleShowHistory}
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
