import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { BackgroundPattern } from "../components/common/BackgroundPattern";

import BottomNav from "../components/BottomNav";

export default function Heart() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <BackgroundPattern />
      <View style={styles.main}>
        <Text style={[styles.messageText, { color: colors.textPrimary }]}>You are loved.</Text>
        <Text style={[styles.subtitleText, { color: colors.textTertiary }]}>keep going</Text>
      </View>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  main: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  messageText: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 0,
  },
  subtitleText: {
    fontSize: 15,
    textAlign: "center",
    fontStyle: "italic",
  },
});
