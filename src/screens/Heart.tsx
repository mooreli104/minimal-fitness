import React from "react";
import { View, Text, StyleSheet } from "react-native";

import BottomNav from "../components/BottonNav";

export default function Heart() {
  return (
    <View style={styles.container}>
      <View style={styles.main}>
        <Text style={styles.messageText}>You are loved.</Text>
        <Text style={styles.subtitleText}>keep going</Text>
      </View>
      <BottomNav />
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
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  messageText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000000",
    textAlign: "center",
    marginBottom: 0,
  },
  subtitleText: {
    fontSize: 15,
    color: "#999",
    textAlign: "center",
    fontStyle: "italic",
  },
});
