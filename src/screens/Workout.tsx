import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Reanimated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Plus, Trash2 } from 'lucide-react-native';
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
import { styles } from '../styles/Workout.styles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ExerciseRow = ({ item, onExerciseChange, onDeleteExercise }: { item: Exercise, onExerciseChange: (id: number, field: keyof Exercise, value: string) => void, onDeleteExercise: (id: number) => void }) => {
  const translateX = useSharedValue(0);
  const SWIPE_THRESHOLD = -SCREEN_WIDTH * 0.2;

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((event) => {
      translateX.value = Math.max(-100, Math.min(0, event.translationX));
    })
    .onEnd((event) => {
      if (event.translationX < SWIPE_THRESHOLD) {
        translateX.value = withTiming(-100);
      } else {
        translateX.value = withTiming(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.exerciseRowContainer}>
      <View style={styles.exerciseDeleteActionContainer}>
        <TouchableOpacity style={styles.exerciseDeleteButton} onPress={() => onDeleteExercise(item.id)}>
          <Trash2 size={20} color="white" />
        </TouchableOpacity>
      </View>
      <GestureDetector gesture={panGesture}>
        <Reanimated.View style={[styles.row, animatedStyle]}>
          <TextInput
            style={[styles.cell, styles.exerciseCol]}
            value={item.name}
            placeholder="Exercise Name"
            multiline
            onChangeText={(text) => onExerciseChange(item.id, 'name', text)}
          />
          <TextInput
            style={[styles.cell, styles.numberCol]}
            value={item.sets}
            keyboardType="number-pad"
            onChangeText={(text) => onExerciseChange(item.id, 'sets', text)}
          />
          <TextInput
            style={[styles.cell, styles.numberCol]}
            value={item.reps}
            keyboardType="default"
            onChangeText={(text) => onExerciseChange(item.id, 'reps', text)}
          />
          <TextInput
            style={[styles.cell, styles.numberCol]}
            value={item.weight}
            keyboardType="number-pad"
            onChangeText={(text) => onExerciseChange(item.id, 'weight', text)}
          />
        </Reanimated.View>
      </GestureDetector>
    </View>
  );
};

export default function Workout() {
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

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
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

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.headerRow}>
            <Text style={styles.header}>Log Workout</Text>
            <TouchableOpacity onPress={() => setTemplateManagerVisible(true)}>
              <Text style={styles.templateButton}>Templates</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.daySelectorContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 8 }}>
              {program.map((day) => (
                <TouchableOpacity
                  key={day.id}
                  style={[styles.dayButton, day.isRest && styles.restDayButton]}
                  onPress={() => !day.isRest && selectDayToLog(day)}
                  onLongPress={() => openDayActionSheet(day)}
                >
                  <Text style={[styles.dayButtonText, day.isRest && styles.restDayButtonText]}>{day.name}</Text>
                  {day.isRest && <Text style={styles.restDayBadge}>REST</Text>}
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.addDayButton} onPress={handleAddDay}>
                <Plus size={16} color="#999" />
                <Text style={styles.addDayButtonText}>Add Day</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

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

          {isLoading ? (
            <Text style={styles.loadingText}>Loading workouts...</Text>
          ) : workoutLog ? (
            workoutLog.isRest ? (
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyStateText}>Today is a rest day.</Text>
              </View>
            ) : (
              <>
                <View style={styles.workoutDayHeader}>
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
                  ><Text style={styles.restToggleText}>Make Rest Day</Text></TouchableOpacity>
                </View>
                <View style={[styles.row, styles.tableHeader]}>
                  <Text style={[styles.headerText, styles.exerciseCol]}>Exercise</Text>
                  <Text style={[styles.headerText, styles.numberCol]}>Sets</Text>
                  <Text style={[styles.headerText, styles.numberCol]}>Reps</Text>
                  <Text style={[styles.headerText, styles.numberCol]}>Weight</Text>
                </View>
                {workoutLog.exercises.map((item) => (
                  <ExerciseRow
                    key={item.id}
                    item={item}
                    onExerciseChange={updateExerciseInLog}
                    onDeleteExercise={deleteExerciseFromLog}
                  />
                ))}
                <TouchableOpacity style={styles.addButton} onPress={addExerciseToLog}>
                  <Plus size={16} color="#000" strokeWidth={2} />
                  <Text style={styles.addButtonText}>Add exercise</Text>
                </TouchableOpacity>
              </>
            )
          ) : (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateText}>Today is a rest day.</Text>
            </View>
          )}
        </ScrollView>
        <BottomNav />
      </View>
    </GestureHandlerRootView>
  );
}
