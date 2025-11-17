import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  Platform,
  TouchableOpacity,
  Alert,
} from "react-native";
import { X } from "lucide-react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
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
  const [showTimePicker, setShowTimePicker] = useState(false);

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

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (selectedDate) {
      setTimestamp(selectedDate);
    }
  };

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
      <View style={styles.modalBackdrop}>
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

          <TouchableOpacity onPress={() => setShowTimePicker(!showTimePicker)}>
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
      </View>

      {showTimePicker && (
        <Modal visible={showTimePicker} transparent animationType="fade">
          <TouchableOpacity
            style={styles.timePickerBackdrop}
            activeOpacity={1}
            onPress={() => setShowTimePicker(false)}
          >
            <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
              <View style={styles.timePickerContainer}>
                <DateTimePicker
                  value={timestamp}
                  mode="time"
                  is24Hour={false}
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleTimeChange}
                />
                {Platform.OS === 'ios' && (
                  <TouchableOpacity
                    style={styles.doneButton}
                    onPress={() => setShowTimePicker(false)}
                  >
                    <Text style={styles.doneButtonText}>Done</Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingBottom: 120,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    gap: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: { fontSize: 20, fontWeight: "700" },

  input: { backgroundColor: "#f8f8f8", padding: 12, borderRadius: 8, fontSize: 16 },
  inputRow: { flexDirection: "row", gap: 8 },
  inputFlex: { flex: 1, backgroundColor: "#f8f8f8", padding: 12, borderRadius: 8, fontSize: 16 },

  saveButton: { backgroundColor: "#000", paddingVertical: 16, borderRadius: 12, alignItems: "center" },
  saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },

  timePickerBackdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingBottom: 120,
  },
  timePickerContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "80%",
    maxWidth: 400,
  },
  doneButton: { backgroundColor: "#000", paddingVertical: 12, borderRadius: 8, alignItems: "center", marginTop: 16 },
  doneButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});

export default AddFoodModal;
