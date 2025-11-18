import React, { useRef, useEffect } from 'react';
import { Animated, StyleSheet } from 'react-native';

interface RollingDigitProps {
  value: string;
  colors: any;
}

export const RollingDigit: React.FC<RollingDigitProps> = ({ value, colors }) => {
  const animatedValue = useRef(new Animated.Value(1)).current;
  const prevValue = useRef(value);

  useEffect(() => {
    if (prevValue.current !== value) {
      animatedValue.setValue(0);
      Animated.spring(animatedValue, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();
      prevValue.current = value;
    }
  }, [value, animatedValue]);

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [15, 0],
  });

  const opacity = animatedValue.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0, 0.6, 1],
  });

  return (
    <Animated.Text
      style={[
        styles.timeText,
        { color: colors.textPrimary, transform: [{ translateY }], opacity }
      ]}
    >
      {value}
    </Animated.Text>
  );
};

const styles = StyleSheet.create({
  timeText: {
    fontSize: 64,
    fontWeight: '300',
    letterSpacing: -2,
  },
});
