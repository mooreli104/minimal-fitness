/**
 * Meal Category Manager Modal
 * Allows users to add, rename, and delete meal categories
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { Plus, Edit2, Trash2, X } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

interface MealCategoryManagerProps {
  isVisible: boolean;
  onClose: () => void;
  categories: string[];
  onAdd: (name: string) => boolean;
  onRename: (oldName: string, newName: string) => boolean;
  onDelete: (name: string) => boolean;
}

export const MealCategoryManager: React.FC<MealCategoryManagerProps> = ({
  isVisible,
  onClose,
  categories,
  onAdd,
  onRename,
  onDelete,
}) => {
  const { colors } = useTheme();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleAdd = () => {
    if (newCategoryName.trim()) {
      const success = onAdd(newCategoryName);
      if (success) {
        setNewCategoryName('');
      }
    }
  };

  const startEdit = (category: string) => {
    setEditingCategory(category);
    setEditName(category);
  };

  const handleSaveEdit = () => {
    if (editingCategory && editName.trim()) {
      const success = onRename(editingCategory, editName);
      if (success) {
        setEditingCategory(null);
        setEditName('');
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setEditName('');
  };

  const handleDelete = (category: string) => {
    Alert.alert(
      'Delete Meal Category',
      `Are you sure you want to delete "${category}"? All foods in this category will be removed.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(category),
        },
      ]
    );
  };

  return (
    <Modal visible={isVisible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.container, { backgroundColor: colors.cardBackground }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              Manage Meal Categories
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Add New Category */}
          <View style={styles.addSection}>
            <TextInput
              style={[
                styles.input,
                {
                  color: colors.textPrimary,
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              placeholder="New meal category name"
              placeholderTextColor={colors.textTertiary}
              onSubmitEditing={handleAdd}
            />
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.accent }]}
              onPress={handleAdd}
            >
              <Plus size={20} color={colors.cardBackground} />
            </TouchableOpacity>
          </View>

          {/* Category List */}
          <ScrollView style={styles.listContainer}>
            {categories.map((category, index) => (
              <View
                key={category}
                style={[
                  styles.categoryItem,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                {editingCategory === category ? (
                  // Editing mode
                  <View style={styles.editRow}>
                    <TextInput
                      style={[
                        styles.editInput,
                        {
                          color: colors.textPrimary,
                          borderColor: colors.accent,
                        },
                      ]}
                      value={editName}
                      onChangeText={setEditName}
                      autoFocus
                      onSubmitEditing={handleSaveEdit}
                    />
                    <View style={styles.editActions}>
                      <TouchableOpacity
                        style={[styles.editActionButton, { backgroundColor: colors.accent }]}
                        onPress={handleSaveEdit}
                      >
                        <Text style={[styles.editActionText, { color: colors.cardBackground }]}>
                          Save
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.editActionButton,
                          { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
                        ]}
                        onPress={handleCancelEdit}
                      >
                        <Text style={[styles.editActionText, { color: colors.textPrimary }]}>
                          Cancel
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  // Display mode
                  <>
                    <Text style={[styles.categoryName, { color: colors.textPrimary }]}>
                      {category}
                    </Text>
                    <View style={styles.actions}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => startEdit(category)}
                      >
                        <Edit2 size={18} color={colors.accent} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleDelete(category)}
                      >
                        <Trash2 size={18} color={colors.red} />
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            ))}
          </ScrollView>

          {/* Info Text */}
          <Text style={[styles.infoText, { color: colors.textTertiary }]}>
            Tip: You need at least one meal category. Foods in deleted categories will be removed.
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  addSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 15,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    maxHeight: 400,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 8,
  },
  editRow: {
    flex: 1,
    gap: 12,
  },
  editInput: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 2,
    fontSize: 15,
    fontWeight: '500',
  },
  editActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editActionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  editActionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 12,
    marginTop: 16,
    textAlign: 'center',
    lineHeight: 18,
  },
});
