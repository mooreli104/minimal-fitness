import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import * as Haptics from "expo-haptics";
import { Plus, Trash2 } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomNav from "../components/BottonNav";
import TemplateManager from "../components/TemplateManager";
import WorkoutDayActionSheet from "../components/WorkoutDayActionSheet";

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

const initialWorkoutDays: WorkoutDay[] = [
  {
    id: 1,
    name: "Push",
    exercises: [
      { id: 1, name: "Bench Press", sets: "4", reps: "8", weight: "135" },
      { id: 2, name: "Overhead Press", sets: "3", reps: "10", weight: "85" },
      { id: 3, name: "Tricep Pushdown", sets: "3", reps: "12", weight: "40" },
    ],
  },
  {
    id: 2,
    name: "Pull",
    exercises: [
      { id: 4, name: "Pull Ups", sets: "3", reps: "AMRAP", weight: "BW" },
      { id: 5, name: "Barbell Row", sets: "4", reps: "8", weight: "155" },
    ],
  },
  {
    id: 3,
    name: "Legs",
    exercises: [
      { id: 6, name: "Squat", sets: "5", reps: "5", weight: "225" },
      { id: 7, name: "Leg Press", sets: "3", reps: "12", weight: "300" },
    ],
  },
];

export default function Workout() {
  const [workoutDays, setWorkoutDays] = useState<WorkoutDay[]>([]);
  const [activeDayId, setActiveDayId] = useState<number | null>(null);
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTemplateManagerVisible, setTemplateManagerVisible] = useState(false);
  const [isActionSheetVisible, setIsActionSheetVisible] = useState(false);
  const [selectedDay, setSelectedDay] = useState<WorkoutDay | null>(null);

  // ==== Data Persistence ====
  const loadData = useCallback(async () => {
    try {
      const storedDays = await AsyncStorage.getItem("@workoutDays");
      const storedTemplates = await AsyncStorage.getItem("@workoutTemplates");

      if (storedDays) {
        setWorkoutDays(JSON.parse(storedDays));
      } else {
        setWorkoutDays(initialWorkoutDays); // Set initial data if nothing is stored
      }

      if (storedTemplates) {
        setTemplates(JSON.parse(storedTemplates));
      }
    } catch (e) {
      Alert.alert("Error", "Failed to load workout data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveData = useCallback(async () => {
    if (isLoading) return; // Don't save while still loading initial data
    try {
      await AsyncStorage.setItem("@workoutDays", JSON.stringify(workoutDays));
      await AsyncStorage.setItem("@workoutTemplates", JSON.stringify(templates));
    } catch (e) {
      Alert.alert("Error", "Failed to save workout data.");
    }
  }, [workoutDays, templates, isLoading]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    saveData();
  }, [saveData]);

  useEffect(() => {
    // Set initial active day
    if (workoutDays.length > 0 && activeDayId === null) {
      setActiveDayId(workoutDays[0].id);
    }
    // If active day was deleted, select the first day
    if (activeDayId && !workoutDays.some((d) => d.id === activeDayId)) {
      setActiveDayId(workoutDays.length > 0 ? workoutDays[0].id : null);
    }
  }, [workoutDays, activeDayId]);

  // ==== Workout Day Management ====
  const handleAddDay = () => {
    Alert.prompt("Add New Day", "Enter the name for the new workout day:", (dayName) => {
      if (dayName) {
        const newDay: WorkoutDay = {
          id: Date.now(),
          name: dayName,
          exercises: [{ id: Date.now(), name: "", sets: "", reps: "", weight: "" }],
        };
        setWorkoutDays([...workoutDays, newDay]);
        setActiveDayId(newDay.id);
      }
    });
  };

  const openDayActionSheet = (day: WorkoutDay) => {
    setSelectedDay(day);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsActionSheetVisible(true);
  };

  const handleEditDay = () => {
    if (!selectedDay) return;
    setIsActionSheetVisible(false);
    Alert.prompt("Rename Day", "Enter the new name:", (newName) => {
      if (newName) {
        setWorkoutDays(
          workoutDays.map((day) => (day.id === selectedDay.id ? { ...day, name: newName } : day))
        );
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
    const dayIndex = workoutDays.findIndex((d) => d.id === selectedDay.id);
    const newDays = [...workoutDays];
    newDays.splice(dayIndex + 1, 0, newDay);
    setWorkoutDays(newDays);
    setIsActionSheetVisible(false);
  };

  const handleDeleteDay = () => {
    if (!selectedDay) return;
    setIsActionSheetVisible(false);
    Alert.alert("Delete Day", `Are you sure you want to delete "${selectedDay.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => setWorkoutDays(workoutDays.filter((day) => day.id !== selectedDay.id)),
      },
    ]);
  };
  // ==== Exercise Management ====
  const handleAddExercise = () => {
    if (!activeDayId) return;
    const newExercise: Exercise = { id: Date.now(), name: "", sets: "", reps: "", weight: "" };
    setWorkoutDays(
      workoutDays.map((day) =>
        day.id === activeDayId ? { ...day, exercises: [...day.exercises, newExercise] } : day
      )
    );
  };

  const handleExerciseChange = (exerciseId: number, field: keyof Exercise, value: string) => {
    if (!activeDayId) return;
    setWorkoutDays(
      workoutDays.map((day) => {
        if (day.id === activeDayId) {
          return {
            ...day,
            exercises: day.exercises.map((ex) =>
              ex.id === exerciseId ? { ...ex, [field]: value } : ex
            ),
          };
        }
        return day;
      })
    );
  };

  const handleDeleteExercise = (exerciseId: number) => {
    if (!activeDayId) return;
    setWorkoutDays(
      workoutDays.map((day) => {
        if (day.id === activeDayId) {
          return { ...day, exercises: day.exercises.filter((ex) => ex.id !== exerciseId) };
        }
        return day;
      })
    );
  };

  // ==== Template Management ====
  const handleSaveCurrentAsTemplate = () => {
    Alert.prompt("Save Template", "Enter a name for this template:", (templateName) => {
      if (templateName) {
        const newTemplate: WorkoutTemplate = {
          id: Date.now(),
          name: templateName,
          days: workoutDays,
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
            setWorkoutDays(template.days);
            setActiveDayId(template.days.length > 0 ? template.days[0].id : null);
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

  const activeDay = workoutDays.find((day) => day.id === activeDayId);

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

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.header}>Log Workout</Text>
          <TouchableOpacity onPress={() => setTemplateManagerVisible(true)}>
            <Text style={styles.templateButton}>Templates</Text>
          </TouchableOpacity>
        </View>

        {/* Day Selector */}
        <View style={styles.daySelectorContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {workoutDays.map((day) => (
              <TouchableOpacity
                key={day.id}
                style={[styles.dayButton, activeDayId === day.id && styles.dayButtonActive]}
                onPress={() => setActiveDayId(day.id)}
                onLongPress={() => openDayActionSheet(day)}
              >
                <Text style={[styles.dayButtonText, activeDayId === day.id && styles.dayButtonTextActive]}>
                  {day.name}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.addDayButton} onPress={handleAddDay}>
              <Plus size={16} color="#999" />
              <Text style={styles.addDayButtonText}>Add Day</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Table Header */}
        <View style={[styles.row, styles.tableHeader]}>
          <Text style={[styles.headerText, styles.exerciseCol]}>Exercise</Text>
          <Text style={[styles.headerText, styles.numberCol]}>Sets</Text>
          <Text style={[styles.headerText, styles.numberCol]}>Reps</Text>
          <Text style={[styles.headerText, styles.numberCol]}>Weight</Text>
        </View>

        {/* Table Body */}
        {isLoading ? (
          <Text style={styles.loadingText}>Loading workouts...</Text>
        ) : (
          activeDay?.exercises.map((item) => (
            <View key={item.id} style={styles.row}>
              <TextInput
                style={[styles.cell, styles.exerciseCol]}
                value={item.name}
                placeholder="Exercise Name"
                onChangeText={(text) => handleExerciseChange(item.id, "name", text)}
              />
              <TextInput
                style={[styles.cell, styles.numberCol]}
                value={item.sets}
                keyboardType="number-pad"
                onChangeText={(text) => handleExerciseChange(item.id, "sets", text)}
              />
              <TextInput
                style={[styles.cell, styles.numberCol]}
                value={item.reps}
                keyboardType="default"
                onChangeText={(text) => handleExerciseChange(item.id, "reps", text)}
              />
              <TextInput
                style={[styles.cell, styles.numberCol]}
                value={item.weight}
                keyboardType="number-pad"
                onChangeText={(text) => handleExerciseChange(item.id, "weight", text)}
              />
              <TouchableOpacity
                onPress={() => handleDeleteExercise(item.id)}
                style={styles.deleteButton}
              >
                <Trash2 size={18} color="#9ca3af" />
              </TouchableOpacity>
            </View>
          ))
        )}

        {/* Add Button */}
        <TouchableOpacity style={styles.addButton} onPress={handleAddExercise}>
          <Plus size={16} color="#000" strokeWidth={2} />
          <Text style={styles.addButtonText}>Add exercise</Text>
        </TouchableOpacity>
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
    marginBottom: 24,
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
  daySelectorContainer: {
    marginBottom: 24,
    paddingLeft: 8,
  },
  dayButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: "#f8f8f8",
  },
  dayButtonActive: {
    backgroundColor: "#000000",
  },
  dayButtonText: {
    fontWeight: "600",
    color: "#000000",
  },
  dayButtonTextActive: {
    color: "#ffffff",
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
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  tableHeader: {
    backgroundColor: "#f8f8f8",
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
  },
  headerText: { padding: 12, fontWeight: "600", fontSize: 12, color: "#999", textTransform: "uppercase", letterSpacing: 0.5 },
  exerciseCol: { flex: 2.5 },
  numberCol: { flex: 1, textAlign: "center", minWidth: 50 },
  cell: { padding: 12, fontSize: 16 },
  deleteButton: {
    padding: 8,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
  },
  addButtonText: { fontSize: 16, fontWeight: "500" },
});