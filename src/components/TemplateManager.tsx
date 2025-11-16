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

interface Exercise {
  id: number;
  name: string;
  sets: string;
  reps: string;
  weight: string;
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

interface TemplateManagerProps {
  isVisible: boolean;
  templates: WorkoutTemplate[];
  onClose: () => void;
  onLoadTemplate: (template: WorkoutTemplate) => void;
  onSaveCurrent: () => void;
  onRenameTemplate: (templateId: number, newName: string) => void;
  onDeleteTemplate: (templateId: number) => void;
}

const TemplateCard = ({
  template,
  onSelect,
  onShowOptions,
}: {
  template: WorkoutTemplate;
  onSelect: () => void;
  onShowOptions: () => void;
}) => {
  const dayNames = template.days.map((d) => d.name).join(", ");
  const dayCount = template.days.length;

  return (
    <TouchableOpacity style={styles.card} onPress={onSelect}>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{template.name}</Text>
        <Text style={styles.cardSubtitle} numberOfLines={1}>
          {dayCount} {dayCount === 1 ? "day" : "days"}: {dayNames}
        </Text>
      </View>
      <TouchableOpacity style={styles.optionsButton} onPress={onShowOptions}>
        <MoreHorizontal size={20} color="#999" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default function TemplateManager({
  isVisible,
  templates,
  onClose,
  onLoadTemplate,
  onSaveCurrent,
  onRenameTemplate,
  onDeleteTemplate,
}: TemplateManagerProps) {
  const insets = useSafeAreaInsets();

  const handleShowOptions = (template: WorkoutTemplate) => {
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
            <Text style={styles.headerTitle}>Templates</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onSelect={() => onLoadTemplate(template)}
                onShowOptions={() => handleShowOptions(template)}
              />
            ))}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.saveButton} onPress={onSaveCurrent}>
              <Text style={styles.saveButtonText}>Save Current as Template</Text>
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

  card: {
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 17, fontWeight: "600", marginBottom: 4 },
  cardSubtitle: { fontSize: 14, color: "#999" },
  optionsButton: { padding: 8, marginLeft: 12 },

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
