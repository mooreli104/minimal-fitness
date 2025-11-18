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
    <TouchableOpacity style={styles.card} onPress={onSelect}>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{template.name}</Text>
        <Text style={styles.cardSubtitle}>
          {totalCalories} cal • {totalItems} {totalItems === 1 ? "item" : "items"}
        </Text>
        {mealsWithItems.length > 0 && (
          <Text style={styles.cardMeals} numberOfLines={1}>
            {mealsWithItems.join(", ")}
          </Text>
        )}
      </View>
      <TouchableOpacity style={styles.optionsButton} onPress={onShowOptions}>
        <MoreHorizontal size={20} color="#999" />
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
  const insets = useSafeAreaInsets();

  const handleShowOptions = (template: DietTemplate) => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ["Cancel", "Rename", "Delete"],
        destructiveButtonIndex: 2,
        cancelButtonIndex: 0,
        title: template.name,
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
      <SafeAreaView style={styles.modalContainer} edges={["left", "right", "bottom"]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
            <Text style={styles.headerTitle}>Diet Templates</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.sectionHeader}>My Diet Templates</Text>
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onSelect={() => onLoadTemplate(template)}
                onShowOptions={() => handleShowOptions(template)}
              />
            ))}
            {templates.length === 0 && (
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyStateText}>Your saved diet templates will appear here.</Text>
                <Text style={styles.emptyStateSubtext}>
                  Log your meals for a day, then save it as a template below.
                </Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.saveButton} onPress={onSaveCurrent}>
              <Text style={styles.saveButtonText}>Save Current Day as Template</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: { flex: 1, backgroundColor: "#ffffff" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  headerTitle: { fontSize: 17, fontWeight: "600" },
  closeButton: { padding: 8 },

  content: { padding: 24, gap: 16 },

  sectionHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  card: {
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 17, fontWeight: "600", marginBottom: 4 },
  cardSubtitle: { fontSize: 14, color: "#666", marginBottom: 2 },
  cardMeals: { fontSize: 12, color: "#999" },
  optionsButton: { padding: 8, marginLeft: 12 },

  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
  },
  emptyStateText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
  },

  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
  },
  saveButton: {
    backgroundColor: "#000",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
