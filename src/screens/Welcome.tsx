import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import { getStyles } from "../styles/Welcome.styles";

export default function Welcome() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      {/* Branding */}
      <View style={{ alignItems: "center" }}>
        <Text style={styles.title}>calibu</Text>
        <Text style={styles.subtitle}>your minimalist calorie & workout tracker</Text>
      </View>

      {/* Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Dashboard" as never)}
      >
        <Text style={styles.buttonText}>get started</Text>
      </TouchableOpacity>
    </View>
  );
}
