import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

export interface PresetTimer {
  label: string;
  seconds: number;
}

const PRESETS_STORAGE_KEY = '@timer_presets';

const DEFAULT_PRESET_TIMERS: PresetTimer[] = [
  { label: '30s', seconds: 30 },
  { label: '1m', seconds: 60 },
  { label: '2m', seconds: 120 },
  { label: '3m', seconds: 180 },
  { label: '5m', seconds: 300 },
];

export const useTimerPresets = () => {
  const [presets, setPresets] = useState<PresetTimer[]>(DEFAULT_PRESET_TIMERS);
  const [editingPreset, setEditingPreset] = useState<PresetTimer | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    const loadPresets = async () => {
      try {
        const stored = await AsyncStorage.getItem(PRESETS_STORAGE_KEY);
        if (stored) {
          setPresets(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Failed to load presets:', error);
      }
    };
    loadPresets();
  }, []);

  const savePresets = async (newPresets: PresetTimer[]) => {
    try {
      await AsyncStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(newPresets));
      setPresets(newPresets);
    } catch (error) {
      console.error('Failed to save presets:', error);
    }
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setEditingPreset(presets[index]);
  };

  const cancelEditing = () => {
    setEditingIndex(null);
    setEditingPreset(null);
  };

  const saveEditedPreset = (label: string, minutes: string, seconds: string) => {
    if (editingIndex === null) return;

    const mins = parseInt(minutes) || 0;
    const secs = parseInt(seconds) || 0;
    const totalSeconds = mins * 60 + secs;

    if (totalSeconds === 0) {
      Alert.alert('Invalid Time', 'Please enter a valid time greater than 0 seconds.');
      return;
    }

    const newPresets = [...presets];
    newPresets[editingIndex] = {
      label: label.trim() || `${mins}m ${secs}s`,
      seconds: totalSeconds,
    };

    savePresets(newPresets);
    cancelEditing();
  };

  return {
    presets,
    editingPreset,
    editingIndex,
    startEditing,
    cancelEditing,
    saveEditedPreset,
  };
};
