import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { MoreHorizontal, X } from "lucide-react-native";
import { WorkoutTemplate } from "../types";
import { useTheme } from "../context/ThemeContext";

interface TemplateManagerProps {
  isVisible: boolean;
  templates: WorkoutTemplate[];
  onClose: () => void;
  onLoadTemplate: (template: WorkoutTemplate) => void;
  onSaveCurrent: (name: string) => void;
  onRenameTemplate: (templateId: number, newName: string) => void;
  onDeleteTemplate: (templateId: number) => void;
}

const TemplateCard = ({
  template,
  onSelect,
  onShowOptions,
  isRenaming,
  renameText,
  onRenameTextChange,
  onRenameSubmit,
}: {
  template: WorkoutTemplate;
  onSelect: () => void;
  onShowOptions: () => void;
  isRenaming: boolean;
  renameText: string;
  onRenameTextChange: (text: string) => void;
  onRenameSubmit: () => void;
}) => {
  const { colors, theme } = useTheme();
  const dayNames = template.days.map((d) => d.name).join(", ");
  const dayCount = template.days.length;

  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: colors.surface }]} onPress={onSelect}>
      <View style={styles.cardContent}>
        {isRenaming ? (
          <TextInput
            style={[styles.cardTitle, { color: colors.textPrimary, borderBottomWidth: 1, borderBottomColor: colors.accent, padding: 0 }]}
            value={renameText}
            onChangeText={onRenameTextChange}
            onSubmitEditing={onRenameSubmit}
            onBlur={onRenameSubmit}
            autoFocus
            selectTextOnFocus
            keyboardAppearance={theme === 'dark' ? 'dark' : 'light'}
          />
        ) : (
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{template.name}</Text>
        )}
        <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
          {dayCount} {dayCount === 1 ? "day" : "days"}: {dayNames}
        </Text>
      </View>
      <TouchableOpacity style={[styles.optionsButton, { opacity: 1 }]} onPress={onShowOptions}>
        <MoreHorizontal size={20} color={colors.textSecondary} />
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
  const { colors, theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [renamingId, setRenamingId] = useState<number | null>(null);
  const [renameText, setRenameText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveName, setSaveName] = useState('');

  const handleShowOptions = (template: WorkoutTemplate) => {
    Alert.alert(template.name, 'Choose an action', [
      {
        text: 'Rename',
        onPress: () => {
          setRenamingId(template.id);
          setRenameText(template.name);
        },
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          Alert.alert(
            "Delete Template",
            `Are you sure you want to delete "${template.name}"? This cannot be undone.`,
            [
              { text: "Cancel", style: "cancel" },
              { text: "Delete", style: "destructive", onPress: () => onDeleteTemplate(template.id) },
            ]
          );
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleRenameSubmit = () => {
    if (renamingId !== null && renameText.trim()) {
      onRenameTemplate(renamingId, renameText.trim());
    }
    setRenamingId(null);
    setRenameText('');
  };

  const handleSaveTemplate = () => {
    if (saveName.trim()) {
      onSaveCurrent(saveName.trim());
      setSaveName('');
      setIsSaving(false);
    }
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent={false}>
      <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]} edges={["left", "right", "bottom"]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View style={[styles.header, { paddingTop: insets.top + 8, borderBottomColor: colors.border }]}>
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Templates</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            <Text style={[styles.sectionHeader, { color: colors.textTertiary }]}>My Templates</Text>
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onSelect={() => onLoadTemplate(template)}
                onShowOptions={() => handleShowOptions(template)}
                isRenaming={renamingId === template.id}
                renameText={renameText}
                onRenameTextChange={setRenameText}
                onRenameSubmit={handleRenameSubmit}
              />
            ))}
            {templates.length === 0 && (
              <View style={[styles.emptyStateContainer, { backgroundColor: colors.surface }]}>
                <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>Your saved templates will appear here.</Text>
              </View>
            )}
          </ScrollView>

          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            {isSaving ? (
              <View style={styles.saveInputRow}>
                <TextInput
                  style={[styles.saveInput, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
                  value={saveName}
                  onChangeText={setSaveName}
                  placeholder="Template name..."
                  placeholderTextColor={colors.textSecondary}
                  autoFocus
                  onSubmitEditing={handleSaveTemplate}
                  keyboardAppearance={theme === 'dark' ? 'dark' : 'light'}
                />
                <TouchableOpacity style={[styles.saveConfirmButton, { backgroundColor: colors.accent }]} onPress={handleSaveTemplate}>
                  <Text style={[styles.saveButtonText, { color: colors.background }]}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setIsSaving(false); setSaveName(''); }}>
                  <X size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.accent }]} onPress={() => setIsSaving(true)}>
                <Text style={[styles.saveButtonText, { color: colors.background }]}>Save Current as Template</Text>
              </TouchableOpacity>
            )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: { flex: 1 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 17, fontWeight: "600" },
  closeButton: { padding: 8 },

  content: { padding: 24, gap: 16 },

  sectionHeader: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 16,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 17, fontWeight: "600", marginBottom: 4 },
  cardSubtitle: { fontSize: 14 },
  optionsButton: { padding: 8, marginLeft: 12 },

  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    borderRadius: 12,
  },
  emptyStateText: {
    fontSize: 15,
  },

  footer: {
    padding: 24,
    borderTopWidth: 1,
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  saveButtonText: { fontSize: 16, fontWeight: "600" },
  saveInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  saveInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  saveConfirmButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
});
