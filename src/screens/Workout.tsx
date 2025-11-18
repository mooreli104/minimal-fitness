import React, { useState } from 'react';
import { View, ScrollView, Alert, KeyboardAvoidingView, Platform, Text, TouchableOpacity } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import BottomNav from '../components/BottomNav';
import TemplateManager from '../components/TemplateManager';
import WorkoutDayActionSheet from '../components/WorkoutDayActionSheet';
import { useDateManager } from '../hooks/useDateManager';
import { useWorkout } from '../hooks/useWorkout';
import { WorkoutDay, WorkoutTemplate } from '../types';
import DateHeader from '../components/common/DateHeader';
import CalendarModal from '../components/common/CalendarModal';
import { ChangeDayModal } from '../components/workout/ChangeDayModal';
import { RenameDayModal } from '../components/workout/RenameDayModal';
import { CountdownTimer } from '../components/workout/CountdownTimer';
import { useTheme } from '../context/ThemeContext';
import WorkoutHeader from '../components/workout/WorkoutHeader';
import DaySelector from '../components/workout/DaySelector';
import { BackgroundPattern } from '../components/common/BackgroundPattern';
import { useWorkoutModals } from '../hooks/useWorkoutModals';
import { WorkoutContent } from '../components/workout/WorkoutContent';

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
          <CalendarModal
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
          </ScrollView>
          <BottomNav />
        </View>
      </KeyboardAvoidingView>
    </GestureHandlerRootView>
  );
}
