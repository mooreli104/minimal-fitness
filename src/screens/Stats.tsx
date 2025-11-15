import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { TrendingUp, Flame, Footprints, Droplet } from "lucide-react-native";

import BottomNav from "../components/BottonNav";

export default function Stats() {
  const stats = [
    { label: "Avg daily calories", value: "1,935", icon: Flame, color: "#FFF7ED" },      // orange-50
    { label: "Total workouts", value: "24", icon: TrendingUp, color: "#EFF6FF" },       // blue-50
    { label: "Steps this week", value: "45,320", icon: Footprints, color: "#ECFDF5" },  // green-50
    { label: "Water intake", value: "2.1L", icon: Droplet, color: "#ECFEFF" },          // cyan-50
  ];

  return (
    <View style={styles.container}>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Statistics</Text>
        <Text style={styles.subtitle}>Your progress overview</Text>

        <View style={{ marginTop: 20 }}>
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <View key={idx} style={styles.statCard}>
                <View style={[styles.iconContainer, { backgroundColor: stat.color }]}>
                  <Icon size={24} strokeWidth={1.5} />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                  <Text style={styles.statValue}>{stat.value}</Text>
                </View>
              </View>
            );
          })}
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
    paddingTop: 24,
    paddingBottom: 120,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#9ca3af",
    marginBottom: 24,
  },
  statCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f9fafb",
    borderRadius: 24,
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  statLabel: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
  },
});
