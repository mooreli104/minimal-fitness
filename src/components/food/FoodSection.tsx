import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Plus } from "lucide-react-native";
import { FoodEntry } from "../../types";
import FoodRowItem from "./FoodRowItem";
import { useTheme } from "../../context/ThemeContext";
import { getFoodLogStyles } from "../../styles/FoodLog.styles";

interface FoodSectionProps {
  title: string;
  foods: FoodEntry[];
  onAdd: () => void;
  onEdit: (food: FoodEntry) => void;
  onDelete: (foodId: number) => void;
}

const FoodSection = ({ title, foods, onAdd, onEdit, onDelete }: FoodSectionProps) => {
  const { colors } = useTheme();
  const styles = getFoodLogStyles(colors);
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
        <Plus size={16} color={colors.textPrimary} />
        <Text style={styles.addButtonText}>Add Food</Text>
      </TouchableOpacity>
    </View>
  );
};

export default FoodSection;
