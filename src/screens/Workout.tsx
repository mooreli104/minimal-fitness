import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  Dimensions,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Plus, Trash2, ChevronLeft, ChevronRight } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomNav from "../components/BottonNav";
import TemplateManager from "../components/TemplateManager";
import WorkoutDayActionSheet from "../components/WorkoutDayActionSheet";
import { useDate } from "../context/DateContext";
import { useIsFocused } from "@react-navigation/native";

interface Exercise {
  id: number;
  name: string; // e.g., "Bench Press"
  sets: string; // e.g., "3"
  reps: string; // e.g., "8-10"
  weight: string; // e.g., "135"
}

interface WorkoutDay {
  id: number;
  name: string;
  exercises: Exercise[];
}

interface WorkoutTemplate {
  id: number;
  name: string;
  days: WorkoutDay[];
}

const WORKOUT_LOG_PREFIX = "@workoutlog_";
const WORKOUT_PROGRAM_KEY = "@workoutProgram";

const DateHeader = ({ date, onPrev, onNext, onToday, onPressDate }: { date: Date, onPrev: () => void, onNext: () => void, onToday: () => void, onPressDate: () => void }) => {
  const today = new Date(); // Current date and time
  today.setHours(0, 0, 0, 0); // Set to the beginning of today
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0); // Set to the beginning of the given date
  const isToday = today.getTime() === compareDate.getTime();

  const formattedDate = isToday
    ? 'Today'
    : new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'long', day: 'numeric' }).format(date);

  return (
    <View style={styles.dateHeaderContainer}>
      <TouchableOpacity onPress={onPrev} style={styles.dateArrow}>
        <ChevronLeft size={24} color="#000" />
      </TouchableOpacity>
      <View>
        <TouchableOpacity onPress={onPressDate} style={{ alignItems: 'center' }}>
          <Text style={styles.dateHeaderText}>{formattedDate}</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={onNext} disabled={isToday} style={styles.dateArrow}>
        <ChevronRight size={24} color={isToday ? "#ccc" : "#000"} />
      </TouchableOpacity>
    </View>
  );
};

const CalendarModal = ({ isVisible, onClose, onDateSelect, selectedDate: initialSelectedDate }: { isVisible: boolean, onClose: () => void, onDateSelect: (date: Date) => void, selectedDate: Date }) => {
  const [displayDate, setDisplayDate] = useState(new Date(initialSelectedDate));

  useEffect(() => {
    if (isVisible) {
      setDisplayDate(new Date(initialSelectedDate));
    }
  }, [isVisible, initialSelectedDate]);

  const changeMonth = (amount: number) => {
    const newDate = new Date(displayDate);
    newDate.setMonth(newDate.getMonth() + amount);
    setDisplayDate(newDate);
  };

  const handleSelectDate = (day: number) => {
    const newSelectedDate = new Date(displayDate.getFullYear(), displayDate.getMonth(), day);
    onDateSelect(newSelectedDate);
  };

  const renderCalendar = () => {
    const year = displayDate.getFullYear();
    const month = displayDate.getMonth();
    const firstDayOfWeek = 1; // 0 for Sunday, 1 for Monday
    const firstDayOfMonth = (new Date(year, month, 1).getDay() - firstDayOfWeek + 7) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const calendarDays = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      calendarDays.push(<View key={`blank-${i}`} style={styles.calendarDay} />);
    }

    const today = new Date();
    const todayDate = today.getDate();
    const todayMonth = today.getMonth();
    const todayYear = today.getFullYear();

    const selectedDay = initialSelectedDate.getDate();
    const selectedMonth = initialSelectedDate.getMonth();
    const selectedYear = initialSelectedDate.getFullYear();

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = day === todayDate && month === todayMonth && year === todayYear;
      const isSelected = day === selectedDay && month === selectedMonth && year === selectedYear;
      const isFuture = new Date(year, month, day) > todayStart;

      calendarDays.push(
        <TouchableOpacity
          key={day}
          style={[styles.calendarDay, isSelected && styles.calendarDaySelected]}
          onPress={() => handleSelectDate(day)}
          disabled={isFuture}
        >
          <Text style={[
            styles.calendarDayText,
            isToday && styles.calendarDayTextToday,
            isSelected && styles.calendarDayTextSelected,
            isFuture && styles.calendarDayTextFuture,
          ]}>
            {day}
          </Text>
        </TouchableOpacity>
      );
    }
    return calendarDays;
  };

  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  const isFutureMonth =
    displayDate.getFullYear() > new Date().getFullYear() ||
    (displayDate.getFullYear() === new Date().getFullYear() &&
      displayDate.getMonth() > new Date().getMonth());

  return (
    <Modal visible={isVisible} animationType="fade" transparent onRequestClose={onClose}>
      <TouchableOpacity style={styles.calendarBackdrop} activeOpacity={1} onPress={onClose}>
        <View style={styles.calendarContainer} onStartShouldSetResponder={() => true}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.calendarNav}>
              <ChevronLeft size={20} color="#000" />
            </TouchableOpacity>
            <Text style={styles.calendarMonthText}>
              {displayDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </Text>
            <TouchableOpacity onPress={() => changeMonth(1)} style={styles.calendarNav} disabled={isFutureMonth}>
              <ChevronRight size={20} color={isFutureMonth ? "#ccc" : "#000"} />
            </TouchableOpacity>
          </View>
          <View style={styles.calendarWeekDays}>
            {weekDays.map((day, index) => <Text key={index} style={styles.calendarWeekDayText}>{day}</Text>)}
          </View>
          <View style={styles.calendarGrid}>{renderCalendar()}</View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");

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
        <Reanimated.View style={[styles.row, animatedStyle, { backgroundColor: 'white' }]}>
          <TextInput
            style={[styles.cell, styles.exerciseCol]}
            value={item.name}
            placeholder="Exercise Name"
            multiline
            onChangeText={(text) => onExerciseChange(item.id, "name", text)}
          />
          <TextInput
            style={[styles.cell, styles.numberCol]}
            value={item.sets}
            keyboardType="number-pad"
            onChangeText={(text) => onExerciseChange(item.id, "sets", text)}
          />
          <TextInput
            style={[styles.cell, styles.numberCol]}
            value={item.reps}
            keyboardType="default"
            onChangeText={(text) => onExerciseChange(item.id, "reps", text)}
          />
          <TextInput
            style={[styles.cell, styles.numberCol]}
            value={item.weight}
            keyboardType="number-pad"
            onChangeText={(text) => onExerciseChange(item.id, "weight", text)}
          />
        </Reanimated.View>
      </GestureDetector>
    </View>
  );
};

export default function Workout() {
  const { selectedDate, setSelectedDate } = useDate();
  const [workoutLog, setWorkoutLog] = useState<WorkoutDay | null>(null);
  const [program, setProgram] = useState<WorkoutDay[]>([]);
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTemplateManagerVisible, setTemplateManagerVisible] = useState(false);
  const [isActionSheetVisible, setIsActionSheetVisible] = useState(false);
  const [selectedDay, setSelectedDay] = useState<WorkoutDay | null>(null);
  const [isCalendarVisible, setCalendarVisible] = useState(false);
  const [yesterdaysWorkoutName, setYesterdaysWorkoutName] = useState<string | null>(null);
  const [isChangeDayModalVisible, setChangeDayModalVisible] = useState(false);
  const [isRenameModalVisible, setRenameModalVisible] = useState(false);
  const [newDayName, setNewDayName] = useState('');
  const isFocused = useIsFocused();
  const actionSheetRef = useRef(null);

  const dateKey = selectedDate.toISOString().split("T")[0];
  const storageKey = `${WORKOUT_LOG_PREFIX}${dateKey}`;

  // ==== Data Persistence ====
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Load current day's log
      const storedLog = await AsyncStorage.getItem(storageKey);
      const storedProgram = await AsyncStorage.getItem(WORKOUT_PROGRAM_KEY);
      const storedTemplates = await AsyncStorage.getItem("@workoutTemplates");

      if (storedLog) {
        setWorkoutLog(JSON.parse(storedLog));
      } else {
        setWorkoutLog(null); // No workout logged for this day
      }

      // Load yesterday's workout for context
      const yesterday = new Date(selectedDate);
      yesterday.setDate(selectedDate.getDate() - 1);
      const yesterdayStorageKey = `${WORKOUT_LOG_PREFIX}${yesterday.toISOString().split("T")[0]}`;
      const storedYesterdayLog = await AsyncStorage.getItem(yesterdayStorageKey);
      if (storedYesterdayLog) {
        setYesterdaysWorkoutName(JSON.parse(storedYesterdayLog).name);
      } else {
        setYesterdaysWorkoutName(null);
      }

      if (storedProgram) {
        setProgram(JSON.parse(storedProgram));
      }

      if (storedTemplates) {
        setTemplates(JSON.parse(storedTemplates));
      }
    } catch (e) {
      Alert.alert("Error", "Failed to load data.");
    } finally {
      setIsLoading(false);
    }
  }, [storageKey, selectedDate]);

  const saveWorkoutLog = useCallback(async (log: WorkoutDay | null) => {
    try {
      if (log) {
        await AsyncStorage.setItem(storageKey, JSON.stringify(log));
      } else {
        await AsyncStorage.removeItem(storageKey);
      }
    } catch (e) {
      Alert.alert("Error", "Failed to save workout log.");
    }
  }, [storageKey]);

  useEffect(() => {
    if (isFocused) {
      loadData();
    }
  }, [isFocused, loadData]);

  useEffect(() => {
    // This effect is for saving the program, not the daily log
    const saveProgram = async () => {
      if (!isLoading) {
        await AsyncStorage.setItem(WORKOUT_PROGRAM_KEY, JSON.stringify(program));
      }
    };
    saveProgram();
  }, [program, isLoading]);

  // ==== Workout Day Management ====
  const handleAddDay = () => {
    Alert.alert("Add Day", "Create a new, blank day for your program.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Add",
        onPress: () => {
          const newDayName = `Day ${program.length + 1}`;
          const newDay: WorkoutDay = {
            id: Date.now(),
            name: newDayName,
            exercises: [{ id: Date.now() + 1, name: "", sets: "", reps: "", weight: "" }],
          };
          setProgram([...program, newDay]);
        },
      },
    ]);
  };

  const openDayActionSheet = (day: WorkoutDay) => {
    setSelectedDay(day);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsActionSheetVisible(true);
  };

  const handleEditDay = () => {
    if (!selectedDay) return;
    const oldName = selectedDay.name;
    setIsActionSheetVisible(false);
    Alert.prompt("Rename Day", "Enter the new name:", (newName) => {
      const trimmedNewName = newName?.trim();
      if (trimmedNewName) {
        const newProgram = program.map((day) => (day.id === selectedDay.id ? { ...day, name: trimmedNewName } : day));
        setProgram(newProgram);

        // Also update the current day's log if it matches the day that was just renamed
        if (workoutLog && workoutLog.name === oldName) {
          const updatedLog = { ...workoutLog, name: trimmedNewName };
          setWorkoutLog(updatedLog);
          saveWorkoutLog(updatedLog);
        }
      }
    });
  };

  const handleDuplicateDay = () => {
    if (!selectedDay) return;
    const newDay: WorkoutDay = {
      ...selectedDay,
      id: Date.now(),
      name: `${selectedDay.name} (Copy)`,
    };
    const dayIndex = program.findIndex((d) => d.id === selectedDay.id);
    const newDays = [...program];
    newDays.splice(dayIndex + 1, 0, newDay);
    setProgram(newDays);
    setIsActionSheetVisible(false);
  };

  const handleDeleteDay = () => {
    if (!selectedDay) return;
    setIsActionSheetVisible(false);
    Alert.alert("Delete Day", `Are you sure you want to delete "${selectedDay.name}"? This will not affect any past workouts you've logged.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => setProgram(program.filter((day) => day.id !== selectedDay.id)),
      },
    ]);
  };
  // ==== Exercise Management ====
  const handleAddExercise = () => {
    if (!workoutLog) {
      // If no workout is active, create a new one
      const newWorkout: WorkoutDay = { id: Date.now(), name: 'Workout', exercises: [{ id: Date.now(), name: "", sets: "", reps: "", weight: "" }] };
      setWorkoutLog(newWorkout);
      saveWorkoutLog(newWorkout);
      return;
    }
    const newExercise: Exercise = { id: Date.now(), name: "", sets: "", reps: "", weight: "" };
    const updatedLog = { ...workoutLog, exercises: [...workoutLog.exercises, newExercise] };
    setWorkoutLog(updatedLog);
    saveWorkoutLog(updatedLog);
  };

  const handleExerciseChange = (exerciseId: number, field: keyof Exercise, value: string) => {
    if (!workoutLog) return;
    const updatedExercises = workoutLog.exercises.map((ex) =>
      ex.id === exerciseId ? { ...ex, [field]: value } : ex
    );
    const updatedLog = { ...workoutLog, exercises: updatedExercises };
    setWorkoutLog(updatedLog);
    saveWorkoutLog(updatedLog);
  };

  const handleDeleteExercise = (exerciseId: number) => {
    if (!workoutLog) return;
    const updatedExercises = workoutLog.exercises.filter((ex) => ex.id !== exerciseId);
    const updatedLog = { ...workoutLog, exercises: updatedExercises };
    setWorkoutLog(updatedLog);
    saveWorkoutLog(updatedLog);
  };

  const handleChangeWorkoutDay = () => {
    if (!workoutLog) return;
    setChangeDayModalVisible(true);
  };

  const handleSelectNewDay = (newDayName: string) => {
    if (workoutLog) {
      const updatedLog = { ...workoutLog, name: newDayName };
      setWorkoutLog(updatedLog);
      saveWorkoutLog(updatedLog);
    }
    setChangeDayModalVisible(false);
  };

  const handleLongPressDayHeader = () => {
    if (workoutLog) {
      setNewDayName(workoutLog.name);
      setRenameModalVisible(true);
    }
  };

  const handleSaveRename = () => {
    if (!newDayName.trim()) {
      Alert.alert("Invalid Name", "Workout day name cannot be empty.");
      return;
    }
    if (workoutLog) {
      handleSelectNewDay(newDayName.trim());
    }
    setRenameModalVisible(false);
  };

  const WorkoutDayRow = ({ day, onSelect, onDelete }: { day: WorkoutDay, onSelect: (name: string) => void, onDelete: () => void }) => {
    const translateX = useSharedValue(0);
    const SWIPE_THRESHOLD = -80;

    const panGesture = Gesture.Pan()
      .activeOffsetX([-10, 10])
      .onUpdate((event) => {
        translateX.value = Math.max(-100, Math.min(0, event.translationX));
      })
      .onEnd((event) => {
        if (event.translationX < SWIPE_THRESHOLD) {
          translateX.value = withTiming(-100, {}, () => runOnJS(onDelete)());
        } else {
          translateX.value = withTiming(0);
        }
      });

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: translateX.value }],
    }));

    return (
      <View>
        <View style={styles.sheetDeleteActionContainer}>
          <TouchableOpacity style={styles.sheetDeleteButton} onPress={onDelete}>
            <Trash2 size={20} color="white" />
          </TouchableOpacity>
        </View>
        <GestureDetector gesture={panGesture}>
          <Reanimated.View style={animatedStyle}>
            <TouchableOpacity style={styles.sheetOption} onPress={() => onSelect(day.name)}>
              <Text style={styles.sheetOptionText}>{day.name}</Text>
            </TouchableOpacity>
          </Reanimated.View>
        </GestureDetector>
      </View>
    );
  };

  const ChangeDayModal = ({ isVisible, onClose, onSelect, programDays, onAdd, onDelete }: { isVisible: boolean, onClose: () => void, onSelect: (name: string) => void, programDays: WorkoutDay[], onAdd: () => void, onDelete: (id: number) => void }) => {
    return (
      <Modal visible={isVisible} transparent animationType="fade" onRequestClose={onClose}>
        <TouchableOpacity style={styles.sheetBackdrop} activeOpacity={1} onPress={onClose}>
          <View style={styles.sheetContainer} onStartShouldSetResponder={() => true} ref={actionSheetRef}>
            <Text style={styles.sheetTitle}>Change Workout Day</Text>
            <ScrollView style={styles.sheetOptionsContainer}>
              <GestureHandlerRootView>
                {programDays.map((day, index) => (
                  <React.Fragment key={day.id}>
                    <WorkoutDayRow day={day} onSelect={onSelect} onDelete={() => onDelete(day.id)} />
                    {index < programDays.length - 1 && <View style={styles.sheetDivider} />}
                  </React.Fragment>
                ))}
              </GestureHandlerRootView>
            </ScrollView>
            <TouchableOpacity style={styles.sheetAction} onPress={onAdd}>
              <Plus size={16} color="#000" />
              <Text style={styles.sheetActionText}>Add New Day</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sheetCancel} onPress={onClose}>
              <Text style={styles.sheetCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  const RenameDayModal = ({ isVisible, onClose, onSave }: { isVisible: boolean, onClose: () => void, onSave: () => void }) => {
    return (
      <Modal visible={isVisible} transparent animationType="fade" onRequestClose={onClose}>
        <TouchableOpacity style={styles.renameModalBackdrop} activeOpacity={1} onPress={onClose}>
          <View style={styles.renameModalContainer} onStartShouldSetResponder={() => true}>
            <Text style={styles.renameModalTitle}>Rename Workout Day</Text>
            <TextInput
              style={styles.renameInput}
              value={newDayName}
              onChangeText={setNewDayName}
              autoFocus
              placeholder="Enter new name"
            />
            <View style={styles.renameActions}>
              <TouchableOpacity style={[styles.renameButton, styles.renameCancelButton]} onPress={onClose}>
                <Text style={styles.renameButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.renameButton, styles.renameSaveButton]} onPress={onSave}>
                <Text style={[styles.renameButtonText, { color: '#fff' }]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  // ==== Template Management ====
  const handleSaveCurrentAsTemplate = () => {
    Alert.prompt("Save Template", "Enter a name for this template:", (templateName) => {
      if (templateName) {
        const newTemplate: WorkoutTemplate = {
          id: Date.now(),
          name: templateName,
          days: program, // Save the program, not the daily log
        };
        setTemplates([...templates, newTemplate]);
        Alert.alert("Success", `Template "${templateName}" saved.`);
      }
    });
  };

  const handleLoadTemplate = (template: WorkoutTemplate) => {
    Alert.alert(
      "Load Template",
      `This will replace your current workout schedule. Load "${template.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Load",
          onPress: () => {
            setProgram(template.days); // Load the new program
            setWorkoutLog(null); // Clear the current day's log to force re-selection
            setTemplateManagerVisible(false);
          },
        },
      ]
    );
  };

  const handleRenameTemplate = (templateId: number, newName: string) => {
    setTemplates(
      templates.map((t) => (t.id === templateId ? { ...t, name: newName } : t))
    );
  };

  const handleDeleteTemplate = (templateId: number) => {
    setTemplates(templates.filter((t) => t.id !== templateId));
  };

  const handleSelectDayToLog = (dayToLog: WorkoutDay) => {
    // Create a deep copy of the day from the program to prevent modifying the template
    const newLog = JSON.parse(JSON.stringify(dayToLog));
    newLog.id = Date.now(); // Assign a new ID for this specific log instance
    setWorkoutLog(newLog);
    saveWorkoutLog(newLog);
  };

  const handleDateChange = (direction: 'prev' | 'next' | 'today') => {
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
  };

  const handleDateSelectFromCalendar = (date: Date) => {
    setSelectedDate(date);
    setCalendarVisible(false);
  };

  const isToday = selectedDate.toDateString() === new Date().toDateString();

  return (
    <View style={styles.container}>
      <TemplateManager
        isVisible={isTemplateManagerVisible}
        templates={templates}
        onClose={() => setTemplateManagerVisible(false)}
        onLoadTemplate={handleLoadTemplate}
        onSaveCurrent={handleSaveCurrentAsTemplate}
        onRenameTemplate={handleRenameTemplate}
        onDeleteTemplate={handleDeleteTemplate}
      />
      <WorkoutDayActionSheet
        visible={isActionSheetVisible}
        onClose={() => setIsActionSheetVisible(false)}
        onEdit={handleEditDay}
        onDuplicate={handleDuplicateDay}
        onDelete={handleDeleteDay}
      />
      <CalendarModal
        isVisible={isCalendarVisible}
        onClose={() => setCalendarVisible(false)}
        onDateSelect={handleDateSelectFromCalendar}
        selectedDate={selectedDate}
      />
      <ChangeDayModal
        isVisible={isChangeDayModalVisible}
        onClose={() => setChangeDayModalVisible(false)}
        onSelect={handleSelectNewDay}
        programDays={program}
        onAdd={handleAddDay}
        onDelete={(id) => setProgram(program.filter(p => p.id !== id))}
      />
      <RenameDayModal
        isVisible={isRenameModalVisible}
        onClose={() => setRenameModalVisible(false)}
        onSave={handleSaveRename}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.header}>Log Workout</Text>
          <TouchableOpacity onPress={() => setTemplateManagerVisible(true)}>
            <Text style={styles.templateButton}>Templates</Text>
          </TouchableOpacity>
        </View>

        {/* Program/Template Day Management */}
        <View style={styles.daySelectorContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 8 }}>
            {program.map((day) => (
              <TouchableOpacity
                key={day.id}
                style={styles.dayButton}
                onPress={() => handleSelectDayToLog(day)}
                onLongPress={() => openDayActionSheet(day)}
              >
                <Text style={styles.dayButtonText}>{day.name}</Text>
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
          onPressDate={() => setCalendarVisible(true)}
        />

        <View style={styles.yesterdayIndicator}>
          {!isToday ? (
            <TouchableOpacity onPress={() => handleDateChange('today')}>
              <Text style={styles.yesterdayText}>Jump to Today</Text>
            </TouchableOpacity>
          ) : yesterdaysWorkoutName ? (
            <Text style={styles.yesterdayText}>Yesterday: {yesterdaysWorkoutName}</Text>
          ) : null}
        </View>

        {isLoading ? (
          <Text style={styles.loadingText}>Loading workouts...</Text>
        ) : (
          workoutLog ? (
            <>
              {/* Table Header */}
              <View style={styles.workoutDayHeader}>
                <Text style={styles.workoutDayHeaderText}>{workoutLog.name}</Text>
              </View>
              <View style={[styles.row, styles.tableHeader]}>
                <Text style={[styles.headerText, styles.exerciseCol]}>Exercise</Text>
                <Text style={[styles.headerText, styles.numberCol]}>Sets</Text>
                <Text style={[styles.headerText, styles.numberCol]}>Reps</Text>
                <Text style={[styles.headerText, styles.numberCol]}>Weight</Text>
              </View>
              {/* Table Body */}
              {workoutLog.exercises.map((item) => (
                <ExerciseRow
                  key={item.id}
                  item={item}
                  onExerciseChange={handleExerciseChange}
                  onDeleteExercise={handleDeleteExercise}
                />
              ))}
              {/* Add Button */}
              <TouchableOpacity style={styles.addButton} onPress={handleAddExercise}>
                <Plus size={16} color="#000" strokeWidth={2} />
                <Text style={styles.addButtonText}>Add exercise</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.daySelectorContainer}>
              <Text style={styles.daySelectorTitle}>Select a workout for today</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 8 }}>
                {program.map((day) => (
                  <TouchableOpacity
                    key={day.id}
                    style={styles.dayButton}
                    onPress={() => handleSelectDayToLog(day)}
                  >
                    <Text style={styles.dayButtonText}>{day.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )
        )}
      </ScrollView>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff", paddingTop: 24 },
  content: { paddingHorizontal: 16, paddingTop: 48, paddingBottom: 120 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  header: { fontSize: 32, fontWeight: "700" },
  templateButton: {
    fontSize: 16,
    fontWeight: "500",
    color: "#007AFF", // A common choice for actionable text
  },
  loadingText: {
    textAlign: "center",
    color: "#999",
    marginTop: 48,
  },
  yesterdayIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 32, // Give the container a fixed height to prevent layout shifts
    marginBottom: 8,
  },
  yesterdayText: {
    fontSize: 13,
    color: '#aaa',
    fontStyle: 'italic',
  },
  workoutDayHeader: {
    // marginTop: 6, // Remove top margin to rely on the container above
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    alignItems: 'center',
  },
  workoutDayHeaderText: {
    fontSize: 18,
    fontWeight: '600',
  },
  daySelectorContainer: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e5e5e5',
    paddingVertical: 16,
    marginBottom: 16,
  },
  daySelectorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  dayButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: "#f8f8f8",
  },
  dayButtonText: {
    fontWeight: "600",
    color: "#000000",
  },
  exerciseRowContainer: {
    backgroundColor: '#DC2626', // Red background for swipe action
  },
  exerciseDeleteActionContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "flex-end",
  },
  exerciseDeleteButton: {
    justifyContent: "center",
    alignItems: "center",
    width: 100,
    height: "100%",
    paddingRight: 20,
  },
  addDayButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderStyle: "dashed",
  },
  addDayButtonText: {
    marginLeft: 4,
    color: "#999",
    fontWeight: "500",
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  tableHeader: {
    backgroundColor: "#f8f8f8",
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
  },
  headerText: { padding: 12, fontWeight: "600", fontSize: 12, color: "#999", textTransform: "uppercase", letterSpacing: 0.5 },
  exerciseCol: { flex: 12 },
  numberCol: { flex: 1, textAlign: "center", minWidth: 70 },
  cell: { padding: 12, fontSize: 16, alignSelf: "center" },
  deleteButton: {
    padding: 12, // Increase touchable area
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
  },
  addButtonText: { fontSize: 16, fontWeight: "500" },
  emptyStateContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
  },
  // Date Header
  dateHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
  },
  dateArrow: {
    padding: 8,
  },
  dateHeaderText: {
    fontSize: 18,
    fontWeight: '600',
  },
  // Calendar Modal
  calendarBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  calendarContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  calendarNav: {
    padding: 8,
  },
  calendarMonthText: {
    fontSize: 18,
    fontWeight: '600',
  },
  calendarWeekDays: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 },
  calendarWeekDayText: { fontSize: 12, color: '#999', fontWeight: '500', width: 32, textAlign: 'center' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around' },
  calendarDay: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', marginVertical: 2 },
  calendarDaySelected: { backgroundColor: '#000', borderRadius: 20 },
  calendarDayText: { fontSize: 16 },
  calendarDayTextToday: { fontWeight: 'bold', color: '#007AFF' },
  calendarDayTextSelected: { color: '#fff', fontWeight: '600' },
  calendarDayTextFuture: { color: '#ccc' },
  // Change Day Modal Styles
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 48,
    borderRadius: 16,
  },
  sheetTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#999',
    textAlign: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  sheetOptionsContainer: {
    maxHeight: 300, // Limit height for long lists
    marginHorizontal: 16,
    backgroundColor: '#f8f8f8', // Group background
    overflow: 'hidden',
    borderRadius: 12, // Rounded corners for the group
  },
  sheetOption: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  sheetOptionText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000',
    backgroundColor: 'white', // Each row has a white background
  },
  sheetDivider: {
    height: 1,
    backgroundColor: '#e5e5e5',
    marginLeft: 16, // Indent divider
  },
  sheetAction: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetActionText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000',
  },
  sheetCancel: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16, // Add space at the bottom
    paddingVertical: 16,
    alignItems: 'center',
  },
  sheetCancelText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#999',
  },
  sheetDeleteActionContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "flex-end",
  },
  sheetDeleteButton: {
    backgroundColor: "#DC2626",
    justifyContent: "center",
    alignItems: "center",
    width: 100,
    height: "100%",
  },
  // Rename Day Modal
  renameModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  renameModalContainer: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
  },
  renameModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  renameInput: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 24,
  },
  renameActions: {
    flexDirection: 'row',
    gap: 12,
  },
  renameButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  renameCancelButton: {
    backgroundColor: '#e5e5e5',
  },
  renameSaveButton: {
    backgroundColor: '#000',
  },
  renameButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});