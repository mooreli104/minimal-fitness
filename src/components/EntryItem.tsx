import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface Entry {
  id: number;
  icon: string;
  name: string;
  category: string;
  source: string;
  calories: number;
  type: string;
}

interface EntryItemProps {
  entry: Entry;
}

export default function EntryItem({ entry }: EntryItemProps) {
  const isWorkout = entry.type === "workout";

  return (
    <View style={styles.container}>
      {/* Icon */}
      <View style={styles.iconWrapper}>
        <Text style={styles.iconText}>{entry.icon}</Text>
      </View>

      {/* Details */}
      <View style={styles.details}>
        <Text style={styles.name}>{entry.name}</Text>
        <Text style={styles.subtext}>
          {entry.category} • {entry.source}
        </Text>
      </View>

      {/* Amount */}
      <Text
        style={[
          styles.amount,
          { color: isWorkout ? "#9ca3af" : "#000" }, // gray-400 or black
        ]}
      >
        {isWorkout ? "-" : "+"}
        {entry.calories} kcal
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingVertical: 16,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6", // gray-100
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f9fafb", // gray-50
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  iconText: {
    fontSize: 20,
  },
  details: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
  },
  subtext: {
    marginTop: 2,
    fontSize: 12,
    color: "#9ca3af",
  },
  amount: {
    fontSize: 15,
    fontWeight: "700",
  },
});
