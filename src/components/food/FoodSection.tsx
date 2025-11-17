import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Plus } from "lucide-react-native";
import { FoodEntry } from "../../types";
import FoodRowItem from "./FoodRowItem";

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

const styles = StyleSheet.create({
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
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
  },
  addButtonText: { fontSize: 16, fontWeight: "500" },
});

export default FoodSection;
