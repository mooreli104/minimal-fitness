import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

import BottomNav from "../components/BottonNav";
import SettingToggle from "../components/SettingToggle";

export default function NewSettings() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>Settings</Text>

        <View style={styles.section}>
          <SettingToggle
            label="Notifications"
            description="Receive reminders and updates"
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
          />
          <View style={styles.divider} />
          <SettingToggle
            label="Dark Mode"
            description="Enable a darker color scheme"
            value={darkModeEnabled}
            onValueChange={setDarkModeEnabled}
          />
        </View>
      </ScrollView>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingTop: 24,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 48, // More top padding for a cleaner look
  },
  header: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 24,
  },
  section: {
    backgroundColor: "#f8f8f8", // Subtle background for grouping
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "#e5e5e5",
    marginHorizontal: -16, // Extends to the edge of the section
  },
});