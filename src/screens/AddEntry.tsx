import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import BottomNav from "../components/BottonNav";
import DateSelector from "../components/DateSelector";
import Keypad from "../components/Keypad";

export default function AddEntry() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [selectedDate, setSelectedDate] = useState(14);
  const [mode, setMode] = useState<"calories" | "workout">("calories");
  const [amount, setAmount] = useState("520");
  const [itemName, setItemName] = useState("chicken bowl");

  const handleKeyPress = (key: string) => {
    if (key === "." && amount.includes(".")) return;
    if (amount === "0" && key !== ".") {
      setAmount(key);
    } else {
      setAmount((prev) => prev + key);
    }
  };

  const handleConfirm = () => {
    console.log("Entry saved:", {
      mode,
      amount,
      itemName,
      date: selectedDate,
    });

    navigation.navigate("Dashboard" as never);
  };

  return (
    <View style={styles.container}>
      <View style={{ paddingTop: insets.top }}>
      </View>

      {/* Main Content */}
      <View style={styles.main}>

        {/* Date Selector */}
        <DateSelector
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />

        {/* Toggle Buttons */}
        <View style={styles.toggleRow}>
          <TouchableOpacity
            onPress={() => setMode("calories")}
            style={[
              styles.toggleButton,
              mode === "calories" ? styles.toggleActive : styles.toggleInactive,
            ]}
          >
            <Text
              style={[
                styles.toggleText,
                mode === "calories"
                  ? styles.toggleTextActive
                  : styles.toggleTextInactive,
              ]}
            >
              calories
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setMode("workout")}
            style={[
              styles.toggleButton,
              mode === "workout" ? styles.toggleActive : styles.toggleInactive,
            ]}
          >
            <Text
              style={[
                styles.toggleText,
                mode === "workout"
                  ? styles.toggleTextActive
                  : styles.toggleTextInactive,
              ]}
            >
              workout
            </Text>
          </TouchableOpacity>
        </View>

        {/* Amount Display */}
        <View style={styles.amountWrapper}>
          <Text style={styles.amountText}>{amount}</Text>

          <Text style={styles.amountUnit}>
            {mode === "calories" ? "kcal" : "min"}
          </Text>

          <View style={styles.itemTag}>
            <Text style={styles.itemTagText}>{itemName}</Text>
          </View>
        </View>

        {/* Keypad */}
        <Keypad onKeyPress={handleKeyPress} onConfirm={handleConfirm} />
      </View>

      <View style={{ paddingBottom: insets.bottom }}>
        <BottomNav />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  main: {
    flex: 1,
    justifyContent: "space-evenly",
  },

  toggleRow: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },

  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
  },

  toggleActive: {
    backgroundColor: "black",
  },

  toggleInactive: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "black",
  },

  toggleText: {
    fontSize: 14,
    fontWeight: "600",
  },

  toggleTextActive: {
    color: "white",
  },

  toggleTextInactive: {
    color: "black",
  },

  amountWrapper: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 24,
  },

  amountText: {
    fontSize: 56,
    fontWeight: "bold",
    marginBottom: 8,
  },

  amountUnit: {
    fontSize: 18,
    color: "#999",
    marginBottom: 24,
  },

  itemTag: {
    backgroundColor: "black",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 999,
  },

  itemTagText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
});
