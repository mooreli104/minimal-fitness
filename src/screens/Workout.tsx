import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Dimensions, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import {  GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import BottomNav from '../components/BottomNav';
import TemplateManager from '../components/TemplateManager';
import WorkoutDayActionSheet from '../components/WorkoutDayActionSheet';
import { useDateManager } from '../hooks/useDateManager';
import { useWorkout } from '../hooks/useWorkout';
import { Exercise, WorkoutDay, WorkoutTemplate } from '../types';
import DateHeader from '../components/common/DateHeader';
import CalendarModal from '../components/common/CalendarModal';
import { ChangeDayModal } from '../components/workout/ChangeDayModal';
import { RenameDayModal } from '../components/workout/RenameDayModal';
import { CountdownTimer } from '../components/workout/CountdownTimer';
import { useTimer } from '../context/TimerContext';
import { useTheme } from '../context/ThemeContext';
import WorkoutHeader from '../components/workout/WorkoutHeader';
import DaySelector from '../components/workout/DaySelector';
import WorkoutTable from '../components/workout/WorkoutTable';
import WorkoutEmptyState from '../components/workout/WorkoutEmptyState';
import { BackgroundPattern } from '../components/common/BackgroundPattern';

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

  const [isTemplateManagerVisible, setTemplateManagerVisible] = useState(false);
  const [isActionSheetVisible, setIsActionSheetVisible] = useState(false);
  const [selectedDay, setSelectedDay] = useState<WorkoutDay | null>(null);
  const [isChangeDayModalVisible, setChangeDayModalVisible] = useState(false);
  const [isRenameModalVisible, setRenameModalVisible] = useState(false);
  const [newDayName, setNewDayName] = useState('');
  const [isTimerVisible, setTimerVisible] = useState(false);

  const { remainingSeconds, isRunning, formatTime } = useTimer();

  const openDayActionSheet = (day: WorkoutDay) => {
    setSelectedDay(day);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsActionSheetVisible(true);
  };

  const handleEditDay = () => {
    if (!selectedDay || selectedDay.isRest) return;
    setIsActionSheetVisible(false);
    Alert.prompt('Rename Day', 'Enter the new name:', (newName) => {
      if (newName) {
        renameProgramDay(selectedDay.id, newName);
      }
    });
  };

  const handleDuplicateDay = () => {
    if (!selectedDay) return;
    duplicateProgramDay(selectedDay.id);
    setIsActionSheetVisible(false);
  };

  const handleDeleteDay = () => {
    if (!selectedDay) return;
    setIsActionSheetVisible(false);
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
    setRenameModalVisible(false);
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
            setTemplateManagerVisible(false);
          },
        },
      ]
    );
  };
  
  const renderWorkoutContent = () => {
    if (isLoading) {
      return <Text style={styles.loadingText}>Loading workouts...</Text>;
    }

    if (!workoutLog) {
      return <WorkoutEmptyState text="Today is a rest day." />;
    }

    if (workoutLog.isRest) {
      return <WorkoutEmptyState text="Today is a rest day." />;
    }

    return (
      <>
        <View style={styles.workoutDayHeader}>
          <TouchableOpacity
            style={styles.timerToggle}
            onPress={() => setTimerVisible(true)}
          >
            <Text style={styles.timerToggleText}>
              {isRunning ? formatTime(remainingSeconds) : 'Start Timer'}
            </Text>
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <TouchableOpacity
              onPress={() => setChangeDayModalVisible(true)}
              onLongPress={() => {
                setNewDayName(workoutLog.name);
                setRenameModalVisible(true);
              }}
            >
              <Text style={styles.workoutDayHeaderText}>{workoutLog.name}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.restToggle}
            onPress={() => {
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
            }}
          ><Text style={styles.restToggleText}>Rest Day</Text></TouchableOpacity>
        </View>
        <WorkoutTable
          exercises={workoutLog.exercises}
          onExerciseChange={updateExerciseInLog}
          onDeleteExercise={deleteExerciseFromLog}
          onAddExercise={addExerciseToLog}
        />
      </>
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
            isVisible={isTemplateManagerVisible}
            templates={templates}
            onClose={() => setTemplateManagerVisible(false)}
            onLoadTemplate={handleLoadTemplate}
            onSaveCurrent={handleSaveTemplate}
            onRenameTemplate={renameTemplate}
            onDeleteTemplate={deleteTemplate}
          />
          <WorkoutDayActionSheet
            visible={isActionSheetVisible}
            onClose={() => setIsActionSheetVisible(false)}
            onEdit={handleEditDay}
            onDuplicate={handleDuplicateDay}
            onDelete={handleDeleteDay}
            onToggleRestDay={() => {
              if (selectedDay) {
                toggleRestDay(selectedDay.id);
              }
              setIsActionSheetVisible(false);
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
            isVisible={isChangeDayModalVisible}
            onClose={() => setChangeDayModalVisible(false)}
            onSelect={(name) => {
              if (workoutLog) {
                const updatedLog = { ...workoutLog, name };
                setWorkoutLog(updatedLog);
                saveWorkoutLog(updatedLog);
              }
              setChangeDayModalVisible(false);
            }}
            programDays={program}
            onAdd={handleAddDay}
            onDelete={deleteProgramDay}
          />
          <RenameDayModal
            isVisible={isRenameModalVisible}
            onClose={() => setRenameModalVisible(false)}
            onSave={handleSaveRename}
            newDayName={newDayName}
            setNewDayName={setNewDayName}
          />
          <CountdownTimer
            isVisible={isTimerVisible}
            onClose={() => setTimerVisible(false)}
          />

          <ScrollView contentContainerStyle={styles.content}>
            <WorkoutHeader onOpenTemplateManager={() => setTemplateManagerVisible(true)} />
            <DaySelector
              program={program}
              onSelectDay={selectDayToLog}
              onLongPressDay={openDayActionSheet}
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

            {renderWorkoutContent()}
          </ScrollView>
          <BottomNav />
        </View>
      </KeyboardAvoidingView>
    </GestureHandlerRootView>
  );
}

