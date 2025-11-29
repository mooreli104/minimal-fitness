import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Copy, BookOpen, Settings } from 'lucide-react-native';
import { MealCategory, FoodEntry as Food } from '../../types';
import FoodSection from './FoodSection';
import CalorieSummaryCard from './CalorieSummaryCard';
import MacroSummaryCards from './MacroSummaryCards';
import { useTheme } from '../../context/ThemeContext';
import { getFoodLogStyles } from '../../styles/FoodLog.styles';

interface FoodLogContentProps {
  log: Record<string, Food[]>;
  isLoading: boolean;
  mealCategories: string[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  calorieTarget: number;
  proteinTarget: number;
  carbsTarget: number;
  fatTarget: number;
  onAddFood: (meal: MealCategory) => void;
  onEditFood: (food: Food, meal: MealCategory) => void;
  onDeleteFood: (id: number, meal: MealCategory) => void;
  onToggleConsumed: (id: number, meal: MealCategory) => void;
  onSetCalorieTarget: () => void;
  onCopyYesterday: () => void;
  onOpenTemplateManager: () => void;
  onManageMealCategories: () => void;
}

export const FoodLogContent: React.FC<FoodLogContentProps> = ({
  log,
  isLoading,
  mealCategories,
  totalCalories,
  totalProtein,
  totalCarbs,
  totalFat,
  calorieTarget,
  proteinTarget,
  carbsTarget,
  fatTarget,
  onAddFood,
  onEditFood,
  onDeleteFood,
  onToggleConsumed,
  onSetCalorieTarget,
  onCopyYesterday,
  onOpenTemplateManager,
  onManageMealCategories,
}) => {
  const { colors } = useTheme();
  const styles = getFoodLogStyles(colors);

  return (
    <>
      <CalorieSummaryCard
        consumed={totalCalories}
        target={calorieTarget}
        onPressTarget={onSetCalorieTarget}
      />
      <MacroSummaryCards
        protein={{ current: totalProtein, target: proteinTarget }}
        carbs={{ current: totalCarbs, target: carbsTarget }}
        fat={{ current: totalFat, target: fatTarget }}
      />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      ) : (
        <>
          {mealCategories.map((meal) => (
            <FoodSection
              key={meal}
              title={meal}
              foods={log[meal] || []}
              onAdd={() => onAddFood(meal)}
              onEdit={(food) => onEditFood(food, meal)}
              onDelete={(id) => onDeleteFood(id, meal)}
              onToggleConsumed={(id) => onToggleConsumed(id, meal)}
            />
          ))}
        </>
      )}

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.copyButton} onPress={onCopyYesterday}>
          <Copy size={16} color={colors.textSecondary} />
          <Text style={styles.copyButtonText}>Copy from yesterday</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.templateButton}
          onPress={onOpenTemplateManager}
        >
          <BookOpen size={16} color={colors.textSecondary} />
          <Text style={styles.templateButtonText}>Diet Templates</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.templateButton}
          onPress={onManageMealCategories}
        >
          <Settings size={16} color={colors.textSecondary} />
          <Text style={styles.templateButtonText}>Manage Meals</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};
