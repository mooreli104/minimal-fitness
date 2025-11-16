import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  GestureHandlerRootView,
  Gesture,
  GestureDetector,
} from "react-native-gesture-handler";
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Plus, X, Copy, Trash2 } from "lucide-react-native";

import BottomNav from "../components/BottonNav";

// ==== Types ====

interface FoodEntry {
  id: number;
  name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

type MealCategory = "Breakfast" | "Lunch" | "Dinner" | "Snacks";

type DailyFoodLog = {
  [key in MealCategory]: FoodEntry[];
};

const initialLog: DailyFoodLog = {
  Breakfast: [],
  Lunch: [],
  Dinner: [],
  Snacks: [],
};

// Storage keys
const LOG_KEY_PREFIX = "@foodlog_";

// ==== Components ====

const CalorieSummaryBar = ({ consumed, target }: { consumed: number; target: number }) => (
  <View style={styles.summaryBar}>
    <View style={styles.summaryItem}>
      <Text style={styles.summaryValue}>{consumed}</Text>
      <Text style={styles.summaryLabel}>Consumed</Text>
    </View>
    <View style={styles.summaryItem}>
      <Text style={styles.summaryValue}>{target}</Text>
      <Text style={styles.summaryLabel}>Target</Text>
    </View>
    <View style={styles.summaryItem}>
      <Text style={[styles.summaryValue, { color: "#4ade80" }]}>{target - consumed}</Text>
      <Text style={styles.summaryLabel}>Remaining</Text>
    </View>
  </View>
);

const MacroSummary = ({ protein, carbs, fat }: { protein: number; carbs: number; fat: number }) => (
  <View style={styles.macroContainer}>
    <View style={styles.macroItem}>
      <Text style={styles.macroValue}>{protein}g</Text>
      <Text style={styles.macroLabel}>Protein</Text>
    </View>
    <View style={styles.macroItem}>
      <Text style={styles.macroValue}>{carbs}g</Text>
      <Text style={styles.macroLabel}>Carbs</Text>
    </View>
    <View style={styles.macroItem}>
      <Text style={styles.macroValue}>{fat}g</Text>
      <Text style={styles.macroLabel}>Fat</Text>
    </View>
  </View>
);

interface FoodSectionProps {
  title: string;
  foods: FoodEntry[];
  onAdd: () => void;
  onEdit: (food: FoodEntry) => void;
  onDelete: (foodId: number) => void;
}

const FoodSection = ({ title, foods, onAdd, onEdit, onDelete }: FoodSectionProps) => {
  const totalCalories = (foods ?? []).reduce((sum, item) => sum + item.calories, 0);

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionCalories}>{totalCalories} kcal</Text>
      </View>

      {(foods ?? []).map((food, index) => (
        <FoodRowItem
          key={food.id}
          food={food}
          onPress={() => onEdit(food)}
          onDelete={() => onDelete(food.id)}
          isLastItem={index === foods.length - 1}
        />
      ))}

      <TouchableOpacity style={styles.addButton} onPress={onAdd}>
        <Plus size={16} color="#000" />
        <Text style={styles.addButtonText}>Add Food</Text>
      </TouchableOpacity>
    </View>
  );
};

interface FoodRowItemProps {
  food: FoodEntry;
  onPress: () => void;
  onDelete: () => void;
  isLastItem: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SWIPE_THRESHOLD = -SCREEN_WIDTH * 0.2;

const FoodRowItem = ({ food, onPress, onDelete, isLastItem }: FoodRowItemProps) => {
  const macroParts: string[] = [];
  if (food.protein != null) macroParts.push(`P ${food.protein}g`);
  if (food.carbs != null) macroParts.push(`C ${food.carbs}g`);
  if (food.fat != null) macroParts.push(`F ${food.fat}g`);
  macroParts.push(`${food.calories} kcal`);
  const macroLine = macroParts.join(" • ");

  const translateX = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((event) => {
      translateX.value = Math.max(-100, Math.min(0, event.translationX));
    })
    .onEnd((event) => {
      if (event.translationX < SWIPE_THRESHOLD) {
        translateX.value = withTiming(-SCREEN_WIDTH, {}, () => runOnJS(onDelete)());
      } else {
        translateX.value = withTiming(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const handlePress = () => {
    // If the row is swiped open, animate it closed first,
    // then trigger the onPress action.
    if (translateX.value !== 0) {
      translateX.value = withTiming(0, undefined, (isFinished) => {
        if (isFinished) runOnJS(onPress)();
      });
    } else {
      onPress();
    }
  };

  return (
    <View>
      <View style={styles.deleteActionContainer}>
        <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
          <Trash2 size={20} color="white" />
        </TouchableOpacity>
      </View>
      <GestureDetector gesture={panGesture}>
        <Reanimated.View style={animatedStyle}>
          <TouchableOpacity style={[styles.foodRow, isLastItem && { borderBottomWidth: 0 }]} onPress={handlePress} activeOpacity={1}>
            <View style={{ flex: 1 }}>
              <Text style={styles.foodName}>{food.name}</Text>
              <Text style={styles.foodMacros}>{macroLine}</Text>
            </View>
          </TouchableOpacity>
        </Reanimated.View>
      </GestureDetector>
    </View>
  );
};

// Add/Edit modal
interface AddFoodModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (food: FoodEntry) => void;
  editingFood: FoodEntry | null;
}

const AddFoodModal = ({ isVisible, onClose, onSave, editingFood }: AddFoodModalProps) => {
  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");

  useEffect(() => {
    if (editingFood) {
      setName(editingFood.name);
      setCalories(String(editingFood.calories));
      setProtein(editingFood.protein != null ? String(editingFood.protein) : "");
      setCarbs(editingFood.carbs != null ? String(editingFood.carbs) : "");
      setFat(editingFood.fat != null ? String(editingFood.fat) : "");
    } else {
      setName("");
      setCalories("");
      setProtein("");
      setCarbs("");
      setFat("");
    }
  }, [editingFood, isVisible]);

  const handleSave = () => {
    if (!name || !calories) {
      Alert.alert("Missing Info", "Please enter at least a name and calories.");
      return;
    }
    onSave({
      id: editingFood?.id ?? Date.now(),
      name,
      calories: parseInt(calories, 10) || 0,
      protein: protein ? parseInt(protein, 10) : undefined,
      carbs: carbs ? parseInt(carbs, 10) : undefined,
      fat: fat ? parseInt(fat, 10) : undefined,
    });
    onClose();
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalBackdrop}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{editingFood ? "Edit Food" : "Add Food"}</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#999" />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Food Name"
            value={name}
            onChangeText={setName}
          />

          <View style={styles.inputRow}>
            <TextInput
              style={styles.inputFlex}
              placeholder="Calories"
              value={calories}
              onChangeText={setCalories}
              keyboardType="number-pad"
            />
          </View>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.inputFlex}
              placeholder="Protein (g)"
              value={protein}
              onChangeText={setProtein}
              keyboardType="number-pad"
            />
            <TextInput
              style={styles.inputFlex}
              placeholder="Carbs (g)"
              value={carbs}
              onChangeText={setCarbs}
              keyboardType="number-pad"
            />
            <TextInput
              style={styles.inputFlex}
              placeholder="Fat (g)"
              value={fat}
              onChangeText={setFat}
              keyboardType="number-pad"
            />
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ==== Main Screen ====

export default function FoodLog() {
  const [log, setLog] = useState<DailyFoodLog>(initialLog);
  const [calorieTarget] = useState(2000);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalVisible, setModalVisible] = useState(false);
  const [editingFood, setEditingFood] = useState<FoodEntry | null>(null);
  const [activeMeal, setActiveMeal] = useState<MealCategory | null>(null);

  const todayKey = new Date().toISOString().split("T")[0];
  const storageKey = `${LOG_KEY_PREFIX}${todayKey}`;

  // --- Load and auto-migrate ---
  const loadLog = useCallback(async () => {
    try {
      const storedLog = await AsyncStorage.getItem(storageKey);
      if (storedLog) {
        const parsed = JSON.parse(storedLog);
        // Ensure all meal categories exist to prevent crashes
        const fixed: DailyFoodLog = {
          Breakfast: parsed.Breakfast ?? [],
          Lunch: parsed.Lunch ?? [],
          Dinner: parsed.Dinner ?? [],
          Snacks: parsed.Snacks ?? [],
        };
        setLog(fixed);
      }
    } catch {
      Alert.alert("Error", "Failed to load food log");
    } finally {
      setIsLoading(false);
    }
  }, [storageKey]);

  const saveLog = useCallback(
    async (newLog: DailyFoodLog) => {
      try {
        await AsyncStorage.setItem(storageKey, JSON.stringify(newLog));
      } catch {}
    },
    [storageKey]
  );

  useEffect(() => {
    loadLog();
  }, [loadLog]);

  // --- Macros totals ---
  const { totalCalories, totalProtein, totalCarbs, totalFat } = useMemo(() => {
    let c = 0, p = 0, crb = 0, f = 0;
    Object.values(log).forEach((meal) => {
      meal.forEach((food) => {
        c += food.calories;
        p += food.protein ?? 0;
        crb += food.carbs ?? 0;
        f += food.fat ?? 0;
      });
    });
    return { totalCalories: c, totalProtein: p, totalCarbs: crb, totalFat: f };
  }, [log]);

  // --- user actions ---

  const handleAddFood = (m: MealCategory) => {
    setActiveMeal(m);
    setEditingFood(null);
    setModalVisible(true);
  };

  const handleEditFood = (food: FoodEntry, m: MealCategory) => {
    setActiveMeal(m);
    setEditingFood(food);
    setModalVisible(true);
  };

  const handleDeleteFood = (id: number, m: MealCategory) => {
    const newLog = { ...log };
    newLog[m] = newLog[m].filter((f) => f.id !== id);
    setLog(newLog);
    saveLog(newLog);
  };

  const handleSaveFood = (food: FoodEntry) => {
    if (!activeMeal) return;
    const newLog = { ...log };
    const list = [...newLog[activeMeal]];
    const ix = list.findIndex((f) => f.id === food.id);
    if (ix >= 0) list[ix] = food;
    else list.push(food);
    newLog[activeMeal] = list;
    setLog(newLog);
    saveLog(newLog);
  };

  const handleCopyYesterday = async () => {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    const key = `${LOG_KEY_PREFIX}${y.toISOString().split("T")[0]}`;
    try {
      const stored = await AsyncStorage.getItem(key);
      if (!stored) return Alert.alert("Not Found", "No log found for yesterday.");
      const parsed: DailyFoodLog = JSON.parse(stored);
      const fixed: DailyFoodLog = {
        Breakfast: parsed.Breakfast ?? [],
        Lunch: parsed.Lunch ?? [],
        Dinner: parsed.Dinner ?? [],
        Snacks: parsed.Snacks ?? [],
      };
      setLog(fixed);
      saveLog(fixed);
    } catch {
      Alert.alert("Error", "Failed to copy data.");
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <AddFoodModal
          isVisible={isModalVisible}
          onClose={() => setModalVisible(false)}
          onSave={handleSaveFood}
          editingFood={editingFood}
        />

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.header}>Food Log</Text>

          <CalorieSummaryBar consumed={totalCalories} target={calorieTarget} />
          <MacroSummary protein={totalProtein} carbs={totalCarbs} fat={totalFat} />

          <FoodSection
            title="Breakfast"
            foods={log.Breakfast}
            onAdd={() => handleAddFood("Breakfast")}
            onEdit={(f) => handleEditFood(f, "Breakfast")}
            onDelete={(id) => handleDeleteFood(id, "Breakfast")}
          />
          <FoodSection
            title="Lunch"
            foods={log.Lunch}
            onAdd={() => handleAddFood("Lunch")}
            onEdit={(f) => handleEditFood(f, "Lunch")}
            onDelete={(id) => handleDeleteFood(id, "Lunch")}
          />
          <FoodSection
            title="Dinner"
            foods={log.Dinner}
            onAdd={() => handleAddFood("Dinner")}
            onEdit={(f) => handleEditFood(f, "Dinner")}
            onDelete={(id) => handleDeleteFood(id, "Dinner")}
          />
          <FoodSection
            title="Snacks"
            foods={log.Snacks}
            onAdd={() => handleAddFood("Snacks")}
            onEdit={(f) => handleEditFood(f, "Snacks")}
            onDelete={(id) => handleDeleteFood(id, "Snacks")}
          />

          <TouchableOpacity style={styles.copyButton} onPress={handleCopyYesterday}>
            <Copy size={16} color="#999" />
            <Text style={styles.copyButtonText}>Copy foods from yesterday</Text>
          </TouchableOpacity>
        </ScrollView>

        <BottomNav />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

// ==== Styles ====

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  content: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 120, gap: 24 },
  header: { fontSize: 32, fontWeight: "700" },

  // Summary
  summaryBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: 16,
  },
  summaryItem: { alignItems: "center", flex: 1 },
  summaryValue: { fontSize: 20, fontWeight: "600" },
  summaryLabel: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // Macros
  macroContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: 16,
  },
  macroItem: { alignItems: "center" },
  macroValue: { fontSize: 16, fontWeight: "500" },
  macroLabel: { fontSize: 14, color: "#999", marginTop: 2 },

  // Sections
  section: { backgroundColor: "#f8f8f8", borderRadius: 12, overflow: "hidden" },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  sectionTitle: { fontSize: 18, fontWeight: "600" },
  sectionCalories: { fontSize: 16, color: "#999" },

  foodRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
    backgroundColor: "white", // Match Mibu style
  },
  foodName: { fontSize: 16, fontWeight: "500" },
  foodMacros: { fontSize: 13, color: "#999", marginTop: 4 },

  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
  },
  addButtonText: { fontSize: 16, fontWeight: "500" },

  // Swipe delete style
  deleteActionContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "flex-end",
  },
  deleteButton: {
    backgroundColor: "#DC2626",
    justifyContent: "center",
    alignItems: "center",
    width: 100,
    height: "100%",
  },

  // Copy button
  copyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 12,
    borderStyle: "dashed",
  },
  copyButtonText: { fontSize: 16, color: "#999", fontWeight: "500" },

  // Modal
  modalBackdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
    gap: 16,
  },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  modalTitle: { fontSize: 20, fontWeight: "700" },

  input: { backgroundColor: "#f8f8f8", padding: 12, borderRadius: 8, fontSize: 16 },
  inputRow: { flexDirection: "row", gap: 8 },
  inputFlex: { flex: 1, backgroundColor: "#f8f8f8", padding: 12, borderRadius: 8, fontSize: 16 },

  saveButton: { backgroundColor: "#000", paddingVertical: 16, borderRadius: 12, alignItems: "center" },
  saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
