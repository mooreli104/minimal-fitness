import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Animated, Easing} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Svg, { Circle, Line } from "react-native-svg";
import { styles } from "../styles/Welcome.styles";

export default function Welcome() {
  const navigation = useNavigation();

  const tags = [
    "calories", "workouts", "steps", "water",
    "protein", "progress", "goals", "nutrition"
  ];

  // DVD-style bouncing animations
  const animatedValues = useRef(
    tags.map(() => ({
      x: new Animated.Value(Math.random() * 100),
      y: new Animated.Value(Math.random() * 100),
      directionX: useRef(Math.random() > 0.5 ? 1 : -1).current,
      directionY: useRef(Math.random() > 0.5 ? 1 : -1).current,
    }))
  ).current;

  useEffect(() => {
    const bounceAnimation = (anim: any, idx: number) => {
      const speed = 0.5 + (idx % 3) * 0.2;

      const animate = () => {
        anim.x.addListener(({ value }: { value: number }) => {
          if (value >= 85 || value <= 0) {
            anim.directionX *= -1;
          }
        });

        anim.y.addListener(({ value }: { value: number }) => {
          if (value >= 75 || value <= 0) {
            anim.directionY *= -1;
          }
        });

        Animated.parallel([
          Animated.timing(anim.x, {
            toValue: anim.directionX > 0 ? 85 : 0,
            duration: 5000 / speed,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(anim.y, {
            toValue: anim.directionY > 0 ? 75 : 0,
            duration: 5000 / speed,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ]).start(() => {
          animate();
        });
      };

      animate();
    };

    animatedValues.forEach((anim, idx) => bounceAnimation(anim, idx));

    return () => {
      animatedValues.forEach((anim) => {
        anim.x.removeAllListeners();
        anim.y.removeAllListeners();
      });
    };
  }, []);


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

        {/* Bouncing tags */}
        {tags.map((tag, idx) => (
          <Animated.View
            key={tag}
            style={[
              styles.tag,
              {
                transform: [
                  { translateX: animatedValues[idx].x.interpolate({
                    inputRange: [0, 100],
                    outputRange: [0, 200],
                  })},
                  { translateY: animatedValues[idx].y.interpolate({
                    inputRange: [0, 100],
                    outputRange: [0, 200],
                  })},
                ]
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
