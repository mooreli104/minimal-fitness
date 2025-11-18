import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActionSheetIOS,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { MoreHorizontal, X } from "lucide-react-native";
import { DietTemplate, MealCategory } from "../types";
import { useTheme } from "../context/ThemeContext";
import { getDietTemplateManagerStyles } from './DietTemplateManager.styles';

interface DietTemplateManagerProps {
  isVisible: boolean;
  templates: DietTemplate[];
  onClose: () => void;
  onLoadTemplate: (template: DietTemplate) => void;
  onSaveCurrent: () => void;
  onRenameTemplate: (templateId: number, newName: string) => void;
  onDeleteTemplate: (templateId: number) => void;
}

const TemplateCard = ({
  template,
  onSelect,
  onShowOptions,
}: {
  template: DietTemplate;
  onSelect: () => void;
  onShowOptions: () => void;
}) => {
  const { colors } = useTheme();
  const styles = getDietTemplateManagerStyles(colors);
  // Calculate total calories in template
  const totalCalories = Object.values(template.meals)
    .flat()
    .reduce((sum, food) => sum + food.calories, 0);

  // Count total food items
  const totalItems = Object.values(template.meals)
    .flat()
    .length;

  // Get meals that have items
  const mealsWithItems = (Object.keys(template.meals) as MealCategory[])
    .filter(meal => template.meals[meal].length > 0);

  return (
    <TouchableOpacity style={styles.dmCard} onPress={onSelect}>
      <View style={styles.dmCardContent}>
        <Text style={styles.dmCardTitle}>{template.name}</Text>
        <Text style={styles.dmCardSubtitle}>
          {totalCalories} cal • {totalItems} {totalItems === 1 ? "item" : "items"}
        </Text>
        {mealsWithItems.length > 0 && (
          <Text style={styles.dmCardMeals} numberOfLines={1}>
            {mealsWithItems.join(", ")}
          </Text>
        )}
      </View>
      <TouchableOpacity style={styles.dmOptionsButton} onPress={onShowOptions}>
        <MoreHorizontal size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default function DietTemplateManager({
  isVisible,
  templates,
  onClose,
  onLoadTemplate,
  onSaveCurrent,
  onRenameTemplate,
  onDeleteTemplate,
}: DietTemplateManagerProps) {
  const { colors, theme } = useTheme();
  const styles = getDietTemplateManagerStyles(colors);
  const insets = useSafeAreaInsets();

  const handleShowOptions = (template: DietTemplate) => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ["Cancel", "Rename", "Delete"],
        destructiveButtonIndex: 2,
        cancelButtonIndex: 0,
        title: template.name,
        userInterfaceStyle: theme,
      },
      (buttonIndex) => {
        if (buttonIndex === 1) {
          Alert.prompt("Rename Template", "Enter the new name:", (newName) => {
            if (newName) {
              onRenameTemplate(template.id, newName);
            }
          });
        } else if (buttonIndex === 2) {
          Alert.alert(
            "Delete Template",
            `Are you sure you want to delete "${template.name}"? This cannot be undone.`,
            [
              { text: "Cancel", style: "cancel" },
              { text: "Delete", style: "destructive", onPress: () => onDeleteTemplate(template.id) },
            ]
          );
        }
      }
    );
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.dmModalContainer} edges={["left", "right", "bottom"]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View style={[styles.dmHeader, { paddingTop: insets.top + 8 }]}>
            <Text style={styles.dmHeaderTitle}>Diet Templates</Text>
            <TouchableOpacity onPress={onClose} style={styles.dmCloseButton}>
              <X size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.dmContent}>
            <Text style={styles.dmSectionHeader}>My Diet Templates</Text>
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onSelect={() => onLoadTemplate(template)}
                onShowOptions={() => handleShowOptions(template)}
              />
            ))}
            {templates.length === 0 && (
              <View style={styles.dmEmptyStateContainer}>
                <Text style={styles.dmEmptyStateText}>Your saved diet templates will appear here.</Text>
                <Text style={styles.dmEmptyStateSubtext}>
                  Log your meals for a day, then save it as a template below.
                </Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.dmFooter}>
            <TouchableOpacity style={styles.dmSaveButton} onPress={onSaveCurrent}>
              <Text style={styles.dmSaveButtonText}>Save Current Day as Template</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}
