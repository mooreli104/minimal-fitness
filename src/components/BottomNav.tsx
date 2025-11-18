import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Home, Menu, Dumbbell, ForkKnifeCrossed, ChartColumnIncreasing } from "lucide-react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";

export default function BottomNav() {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors } = useTheme();

  const navItems = [
    { icon: Home, route: "Dashboard", name: "home" },
    { icon: Dumbbell, route: "Workout", name: "workout" },
    { icon: ForkKnifeCrossed, route: "FoodLog", name: "foodlog" },
    { icon: ChartColumnIncreasing, route: "Heart", name: "add" },
    { icon: Menu, route: "More", name: "More" },
  ];

  const isActive = (r: string) => route.name === r;

  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
      <View style={styles.inner}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.route);

          return (
            <TouchableOpacity
              key={item.name}
              onPress={() => navigation.navigate(item.route as never)}
              style={styles.navButton}
              activeOpacity={0.7}
            >
              <View style={styles.iconWrapper}>
                <Icon
                  size={26}
                  strokeWidth={1.5}
                  color={colors.textPrimary}
                />
              </View>

              {/* Active Indicator */}
              {active && (
                <View style={[styles.activeDot, { backgroundColor: colors.textPrimary }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    paddingBottom: 24,
    paddingTop: 12,
    paddingHorizontal: 24,
  },
  inner: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    maxWidth: 390,
    alignSelf: "center",
    width: "100%",
  },
  navButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapper: {
    alignItems: "center",
    justifyContent: "center",
    width: 48,
    height: 48,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    marginTop: 4,
  },
});
