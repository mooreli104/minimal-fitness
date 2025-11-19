import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { X } from "lucide-react-native";
import { useTheme } from "../../context/ThemeContext";
import { getNutritionTargetsModalStyles } from "./NutritionTargetsModal.styles";

export interface NutritionTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface NutritionTargetsModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (targets: NutritionTargets) => void;
  currentTargets: NutritionTargets;
}

const NutritionTargetsModal = ({
  isVisible,
  onClose,
  onSave,
  currentTargets,
}: NutritionTargetsModalProps) => {
  const { colors, theme } = useTheme();
  const styles = getNutritionTargetsModalStyles(colors);

  const [calories, setCalories] = useState(String(currentTargets.calories));
  const [protein, setProtein] = useState(String(currentTargets.protein));
  const [carbs, setCarbs] = useState(String(currentTargets.carbs));
  const [fat, setFat] = useState(String(currentTargets.fat));

  useEffect(() => {
    if (isVisible) {
      setCalories(String(currentTargets.calories));
      setProtein(String(currentTargets.protein));
      setCarbs(String(currentTargets.carbs));
      setFat(String(currentTargets.fat));
    }
  }, [isVisible, currentTargets]);

  const handleSave = () => {
    const caloriesNum = parseInt(calories, 10);
    const proteinNum = parseInt(protein, 10);
    const carbsNum = parseInt(carbs, 10);
    const fatNum = parseInt(fat, 10);

    if (!caloriesNum || caloriesNum < 1 || caloriesNum > 10000) {
      Alert.alert("Invalid Input", "Please enter a valid calorie target (1-10000).");
      return;
    }

    if (!proteinNum || proteinNum < 0 || proteinNum > 1000) {
      Alert.alert("Invalid Input", "Please enter a valid protein target (0-1000g).");
      return;
    }

    if (!carbsNum || carbsNum < 0 || carbsNum > 1000) {
      Alert.alert("Invalid Input", "Please enter a valid carbs target (0-1000g).");
      return;
    }

    if (!fatNum || fatNum < 0 || fatNum > 500) {
      Alert.alert("Invalid Input", "Please enter a valid fat target (0-500g).");
      return;
    }

    onSave({
      calories: caloriesNum,
      protein: proteinNum,
      carbs: carbsNum,
      fat: fatNum,
    });
    onClose();
  };

  return (
    <Modal visible={isVisible} animationType="fade" transparent>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Nutrition Targets</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Daily Calories</Text>
            <TextInput
              style={styles.input}
              placeholder="2000"
              placeholderTextColor={colors.textSecondary}
              value={calories}
              onChangeText={setCalories}
              keyboardType="number-pad"
              keyboardAppearance={theme === 'dark' ? 'dark' : 'light'}
            />
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Macros (grams)</Text>
            <View style={styles.macroRow}>
              <View style={styles.macroInput}>
                <TextInput
                  style={styles.input}
                  placeholder="Protein"
                  placeholderTextColor={colors.textSecondary}
                  value={protein}
                  onChangeText={setProtein}
                  keyboardType="number-pad"
                  keyboardAppearance={theme === 'dark' ? 'dark' : 'light'}
                />
              </View>
              <View style={styles.macroInput}>
                <TextInput
                  style={styles.input}
                  placeholder="Carbs"
                  placeholderTextColor={colors.textSecondary}
                  value={carbs}
                  onChangeText={setCarbs}
                  keyboardType="number-pad"
                  keyboardAppearance={theme === 'dark' ? 'dark' : 'light'}
                />
              </View>
              <View style={styles.macroInput}>
                <TextInput
                  style={styles.input}
                  placeholder="Fat"
                  placeholderTextColor={colors.textSecondary}
                  value={fat}
                  onChangeText={setFat}
                  keyboardType="number-pad"
                  keyboardAppearance={theme === 'dark' ? 'dark' : 'light'}
                />
              </View>
            </View>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default NutritionTargetsModal;
