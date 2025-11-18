import React from "react";
import { View, Text, StyleSheet, Linking, TouchableOpacity, Switch } from "react-native";
import { Moon, Sun } from "lucide-react-native";

import BottomNav from "../components/BottomNav";
import { BackgroundPattern } from "../components/common/BackgroundPattern";
import { useTheme } from "../context/ThemeContext";

export default function Settings() {
  const { theme, colors, toggleTheme } = useTheme();

  const handleEmailPress = () => {
    Linking.openURL("mailto:mooreli@robinandlamb.com");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <BackgroundPattern />
      <View style={styles.mainContent}>
        {/* Dark Mode Toggle */}
        <View style={[styles.themeToggleContainer, { borderColor: colors.border }]}>
          <View style={styles.themeToggleLeft}>
            {theme === 'dark' ? (
              <Moon size={20} color={colors.textPrimary} strokeWidth={1.5} />
            ) : (
              <Sun size={20} color={colors.textPrimary} strokeWidth={1.5} />
            )}
            <Text style={[styles.themeToggleText, { color: colors.textPrimary }]}>
              {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
            </Text>
          </View>
          <Switch
            value={theme === 'dark'}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor={theme === 'dark' ? colors.background : '#FFFFFF'}
            ios_backgroundColor={colors.border}
          />
        </View>

        <Text style={[styles.mainText, { color: colors.textPrimary }]}>More features coming soon.</Text>
        <Text style={[styles.subText, { color: colors.textSecondary }]}>Questions or suggestions? Contact</Text>
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
  },
  mainContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  themeToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    width: '100%',
    maxWidth: 340,
    marginBottom: 32,
  },
  themeToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  themeToggleText: {
    fontSize: 16,
    fontWeight: '600',
  },
  mainText: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 12,
  },
  subText: {
    fontSize: 14,
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