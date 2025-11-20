/**
 * Todo List Hook
 * Manages todo list with persistence to AsyncStorage
 */

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { TodoItem } from '../components/dashboard/TodoChecklist';

const STORAGE_KEY = '@todo_list';

export const useTodoList = () => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load todos from storage
  const loadTodos = useCallback(async () => {
    try {
      const storedTodos = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedTodos) {
        const parsedTodos: TodoItem[] = JSON.parse(storedTodos);
        setTodos(parsedTodos);
      }
    } catch (error) {
      console.error('Failed to load todos:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save todos to storage
  const saveTodos = useCallback(async (todosToSave: TodoItem[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(todosToSave));
    } catch (error) {
      console.error('Failed to save todos:', error);
    }
  }, []);

  // Add a new todo
  const addTodo = useCallback(
    (text: string) => {
      const newTodo: TodoItem = {
        id: Date.now().toString() + Math.random().toString(36).substring(7),
        text,
        completed: false,
      };

      setTodos((prev) => {
        const updated = [...prev, newTodo];
        saveTodos(updated);
        return updated;
      });
    },
    [saveTodos]
  );

  // Toggle todo completion
  const toggleTodo = useCallback(
    (id: string) => {
      setTodos((prev) => {
        const updated = prev.map((todo) =>
          todo.id === id ? { ...todo, completed: !todo.completed } : todo
        );
        saveTodos(updated);
        return updated;
      });
    },
    [saveTodos]
  );

  // Delete a todo
  const deleteTodo = useCallback(
    (id: string) => {
      setTodos((prev) => {
        const updated = prev.filter((todo) => todo.id !== id);
        saveTodos(updated);
        return updated;
      });
    },
    [saveTodos]
  );

  // Load on mount
  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  return {
    todos,
    addTodo,
    toggleTodo,
    deleteTodo,
    isLoading,
  };
};
