import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Animated, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Svg, { Circle, Line } from "react-native-svg";

export default function Welcome() {
  const navigation = useNavigation();

  const tags = [
    "calories", "workouts", "steps", "water",
    "protein", "progress", "goals", "nutrition"
  ];

  // floating animations
  const animatedValues = useRef(tags.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    animatedValues.forEach((anim, idx) => {
      const loop = () =>
        Animated.sequence([
          Animated.timing(anim, {
            toValue: -10,
            duration: 1500 + (idx % 3) * 500,
            delay: idx * 200,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 1500 + (idx % 3) * 500,
            useNativeDriver: true,
          })
        ]).start(loop);

      loop();
    });
  }, []);

  const positions = [
    { top: '5%', left: '15%' },
    { top: '15%', right: '10%' },
    { top: '30%', left: '5%' },
    { top: '45%', right: '0%' },
    { top: '60%', left: '10%' },
    { top: '75%', right: '15%' },
    { top: '85%', left: '25%' },
    { top: '70%', left: '60%' },
  ];

  return (
    <View style={styles.container}>
      {/* Illustration */}
      <View style={styles.illustrationWrapper}>
        <Svg width="200" height="200" viewBox="0 0 200 200">
          {/* Head */}
          <Circle cx="100" cy="40" r="20" stroke="black" strokeWidth="2" fill="none" />
          {/* Body */}
          <Line x1="100" y1="60" x2="100" y2="120" stroke="black" strokeWidth="2" />
          {/* Arms */}
          <Line x1="100" y1="75" x2="75" y2="100" stroke="black" strokeWidth="2" />
          <Line x1="100" y1="75" x2="125" y2="100" stroke="black" strokeWidth="2" />
          {/* Legs */}
          <Line x1="100" y1="120" x2="80" y2="160" stroke="black" strokeWidth="2" />
          <Line x1="100" y1="120" x2="120" y2="160" stroke="black" strokeWidth="2" />
          {/* Dumbbell */}
          <Line x1="70" y1="100" x2="80" y2="100" stroke="black" strokeWidth="2" />
          <Circle cx="68" cy="100" r="3" fill="black" />
          <Circle cx="82" cy="100" r="3" fill="black" />
        </Svg>

        {/* Floating tags */}
        {tags.map((tag, idx) => (
          <Animated.View
            key={tag}
            style={[
              styles.tag,
              positions[idx] as any, // Type assertion to bypass the type error
              {
                transform: [{ translateY: animatedValues[idx] }]
              }
            ]}
          >
            <Text style={styles.tagText}>{tag}</Text>
          </Animated.View>
        ))}
      </View>

      {/* Branding */}
      <View style={{ alignItems: "center", marginTop: 20 }}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 60,
  },
  illustrationWrapper: {
    width: 220,
    height: 220,
    position: "relative",
    marginBottom: 40,
  },
  tag: {
    position: "absolute",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 20,
    backgroundColor: "white",
  },
  tagText: {
    fontSize: 11,
    fontWeight: "500",
  },
  title: {
    fontSize: 40,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 12,
    color: "gray",
    marginTop: 5,
  },
  button: {
    marginTop: 40,
    backgroundColor: "black",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
});