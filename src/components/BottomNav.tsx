import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Home, Menu, Dumbbell, ForkKnifeCrossed, Heart } from "lucide-react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

export default function BottomNav() {
  const navigation = useNavigation();
  const route = useRoute();

  const navItems = [
    { icon: Home, route: "Dashboard", name: "home" },
    { icon: Dumbbell, route: "Workout", name: "workout" },
    { icon: Heart, route: "Heart", name: "add", isCenter: true },
    { icon: ForkKnifeCrossed, route: "FoodLog", name: "foodlog" },
    { icon: Menu, route: "More", name: "More" },
  ];

  const isActive = (r: string) => route.name === r;

  return (
    <View style={styles.container}>
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
              <View
                style={[
                  styles.iconWrapper,
                  item.isCenter ? styles.centerButton : styles.sideButton,
                  item.isCenter && { backgroundColor: "black" },
                ]}
              >
                <Icon
                  size={26}
                  strokeWidth={1.5}
                  color={item.isCenter ? "white" : "black"}
                />
              </View>

              {/* Active Indicator */}
              {!item.isCenter && active && (
                <View style={styles.activeDot} />
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
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
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
  },
  sideButton: {
    width: 48,
    height: 48,
  },
  centerButton: {
    width: 56,
    height: 56,
    borderRadius: 999,
  },
  activeDot: {
    width: 6,
    height: 6,
    backgroundColor: "black",
    borderRadius: 999,
    marginTop: 4,
  },
});
