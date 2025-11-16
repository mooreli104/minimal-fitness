import React from "react";
import { View, Text, Switch, StyleSheet } from "react-native";

interface SettingToggleProps {
  label: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export default function SettingToggle({
  label,
  description,
  value,
  onValueChange,
}: SettingToggleProps) {
  return (
    <View style={styles.container}>
      <View style={styles.textWrapper}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <Switch
        trackColor={{ false: "#e5e5e5", true: "#d4d4d4" }}
        thumbColor={value ? "#000000" : "#f4f3f4"}
        ios_backgroundColor="#e5e5e5"
        onValueChange={onValueChange}
        value={value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  textWrapper: {
    flex: 1,
    paddingRight: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: "#999",
  },
});