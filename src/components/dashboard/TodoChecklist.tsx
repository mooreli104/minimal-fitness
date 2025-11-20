/**
 * TodoChecklist Component
 * Editable to-do list with add, check, and delete functionality
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { CheckSquare, Square, X, Plus, ListTodo } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

interface TodoChecklistProps {
  todos: TodoItem[];
  onAdd: (text: string) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export const TodoChecklist: React.FC<TodoChecklistProps> = ({
  todos,
  onAdd,
  onToggle,
  onDelete,
}) => {
  const { colors, theme } = useTheme();
  const styles = getStyles(colors, theme);
  const [newTodoText, setNewTodoText] = useState('');

  const handleAdd = () => {
    if (newTodoText.trim()) {
      onAdd(newTodoText.trim());
      setNewTodoText('');
    }
  };

  const completedCount = todos.filter((t) => t.completed).length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconContainer, { backgroundColor: `${colors.purple}15` }]}>
            <ListTodo size={20} color={colors.purple} strokeWidth={2} />
          </View>
          <Text style={styles.title}>To-Do List</Text>
        </View>
        {todos.length > 0 && (
          <Text style={styles.counter}>
            {completedCount}/{todos.length}
          </Text>
        )}
      </View>

      {/* Add New Todo Input */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Add a new task..."
          placeholderTextColor={colors.textTertiary}
          value={newTodoText}
          onChangeText={setNewTodoText}
          onSubmitEditing={handleAdd}
          returnKeyType="done"
          keyboardAppearance={theme === 'dark' ? 'dark' : 'light'}
        />
        <TouchableOpacity
          style={[styles.addButton, !newTodoText.trim() && styles.addButtonDisabled]}
          onPress={handleAdd}
          disabled={!newTodoText.trim()}
          activeOpacity={0.7}
        >
          <Plus
            size={20}
            color={newTodoText.trim() ? colors.accent : colors.textTertiary}
            strokeWidth={2.5}
          />
        </TouchableOpacity>
      </View>

      {/* Todo List */}
      {todos.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No tasks yet</Text>
          <Text style={styles.emptySubtext}>Add your first task to get started</Text>
        </View>
      ) : (
        <FlatList
          data={todos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.todoItem}>
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => onToggle(item.id)}
                activeOpacity={0.7}
              >
                {item.completed ? (
                  <CheckSquare size={22} color={colors.accent} strokeWidth={2} />
                ) : (
                  <Square size={22} color={colors.textSecondary} strokeWidth={2} />
                )}
              </TouchableOpacity>

              <Text
                style={[
                  styles.todoText,
                  item.completed && styles.todoTextCompleted,
                ]}
                numberOfLines={2}
              >
                {item.text}
              </Text>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => onDelete(item.id)}
                activeOpacity={0.7}
              >
                <X size={18} color={colors.textTertiary} strokeWidth={2} />
              </TouchableOpacity>
            </View>
          )}
          scrollEnabled={false}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const getStyles = (colors: any, theme: 'light' | 'dark') =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 16,
      ...(theme === 'light'
        ? {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
          }
        : {}),
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    iconContainer: {
      width: 44,
      height: 44,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    counter: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
      backgroundColor: colors.surfaceAlt,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
    },
    inputRow: {
      flexDirection: 'row',
      gap: 8,
    },
    input: {
      flex: 1,
      height: 48,
      backgroundColor: colors.surfaceAlt,
      borderRadius: 12,
      paddingHorizontal: 16,
      fontSize: 15,
      color: colors.textPrimary,
      borderWidth: 1,
      borderColor: colors.border,
    },
    addButton: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: colors.surfaceAlt,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    addButtonDisabled: {
      opacity: 0.4,
    },
    listContent: {
      gap: 8,
    },
    todoItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 12,
      paddingHorizontal: 12,
      backgroundColor: colors.surfaceAlt,
      borderRadius: 12,
    },
    checkboxContainer: {
      padding: 4,
    },
    todoText: {
      flex: 1,
      fontSize: 15,
      fontWeight: '500',
      color: colors.textPrimary,
      lineHeight: 20,
    },
    todoTextCompleted: {
      textDecorationLine: 'line-through',
      color: colors.textSecondary,
      opacity: 0.6,
    },
    deleteButton: {
      padding: 4,
    },
    emptyState: {
      paddingVertical: 32,
      alignItems: 'center',
      gap: 6,
    },
    emptyText: {
      fontSize: 15,
      fontWeight: '500',
      color: colors.textSecondary,
    },
    emptySubtext: {
      fontSize: 13,
      fontWeight: '400',
      color: colors.textTertiary,
    },
  });
