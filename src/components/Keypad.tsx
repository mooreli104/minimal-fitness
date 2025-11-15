import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Check } from "lucide-react-native";

interface KeypadProps {
  onKeyPress: (key: string) => void;
  onConfirm: () => void;
}

export default function Keypad({ onKeyPress, onConfirm }: KeypadProps) {
  const keys = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    [".", "0", "check"],
  ];

  const handlePress = (key: string) => {
    if (key === "check") onConfirm();
    else onKeyPress(key);
  };

  return (
    <View style={styles.container}>
      {keys.flat().map((key, idx) => {
        const isConfirm = key === "check";

        return (
          <TouchableOpacity
            key={idx}
            onPress={() => handlePress(key)}
            activeOpacity={0.7}
            style={[
              styles.key,
              isConfirm ? styles.keyConfirm : styles.keyNormal,
            ]}
          >
            {isConfirm ? (
              <Check size={32} strokeWidth={2.5} color="white" />
            ) : (
              <Text style={styles.keyText}>{key}</Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 32,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 16,
  },

  key: {
    width: "28%",
    aspectRatio: 1,
    borderRadius: 1000,
    alignItems: "center",
    justifyContent: "center",
  },

  keyNormal: {
    backgroundColor: "#f3f4f6", // gray-100
  },

  keyConfirm: {
    backgroundColor: "black",
  },

  keyText: {
    fontSize: 28,
    fontWeight: "600",
    color: "black",
  },
});
