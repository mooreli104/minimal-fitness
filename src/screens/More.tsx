import React from "react";
import { View, Text, StyleSheet, Linking, TouchableOpacity } from "react-native";

import BottomNav from "../components/BottonNav";

export default function Settings() {
  const handleEmailPress = () => {
    Linking.openURL("mailto:mooreli@robinandlamb.com");
  };

  return (
    <View style={styles.container}>
      <View style={styles.mainContent}>
        <Text style={styles.mainText}>More features coming soon.</Text>
        <Text style={styles.subText}>Questions or suggestions? Contact</Text>
        <View style={styles.emailContainer}>
            <TouchableOpacity onPress={handleEmailPress}>
              <Text style={styles.emailLink}>mooreli@robinandlamb.com</Text>
            </TouchableOpacity>
        </View>
      </View>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  mainContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  mainText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: 12,
  },
  subText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    lineHeight: 20,
  },
  emailContainer: {
    marginTop: 4,
    alignItems: 'center',
  },
  emailLink: {
    color: "#007AFF",
    textDecorationLine: "underline",
    fontSize: 14,
  },
});