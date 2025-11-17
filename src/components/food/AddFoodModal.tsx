import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from "react-native";
import { X } from "lucide-react-native";
import { FoodEntry } from "../../types";

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
  const [timestamp, setTimestamp] = useState(new Date());
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");

  useEffect(() => {
    if (editingFood) {
      setName(editingFood.name);
      setCalories(String(editingFood.calories));
      setTimestamp(new Date(editingFood.timestamp));
      setProtein(editingFood.protein != null ? String(editingFood.protein) : "");
      setCarbs(editingFood.carbs != null ? String(editingFood.carbs) : "");
      setFat(editingFood.fat != null ? String(editingFood.fat) : "");
    } else {
      setName("");
      setTimestamp(new Date());
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
      timestamp: timestamp.toISOString(),
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

          <TouchableOpacity onPress={() => Alert.alert("Time", "Time editing coming soon!")}>
            <Text style={styles.input}>
              Time: {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </TouchableOpacity>
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

const styles = StyleSheet.create({
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

export default AddFoodModal;
