import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Rect, Defs, Pattern, Path, G, Circle } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';

// Grid spacing for seamless tiling - matches Figma's dotted grid aesthetic
const GRID_SIZE = 24;
const STAR_SIZE = 1.5; // 2px stars for ultra-minimal feel

export const BackgroundPattern = () => {
  const { theme } = useTheme();

  /**
   * Curved 4-point star path - soft, rounded, symmetrical
   * Inspired by Figma's minimal dotted grid
   * Shape: soft star/flower hybrid with rounded points
   */
  const curvedStarPath =
    "M0,-1.5 Q-0.4,-1 -0.7,-0.7 Q-1,-0.4 -1.5,0 Q-1,0.4 -0.7,0.7 Q-0.4,1 0,1.5 Q0.4,1 0.7,0.7 Q1,0.4 1.5,0 Q1,-0.4 0.7,-0.7 Q0.4,-1 0,-1.5 Z";

  /** 🌤 LIGHT MODE - Figma-inspired minimal dotted grid */
  const renderLightPattern = () => {
    // Light mode: #D1D5DB stars on #FFFFFF background
    const starColor = "#D1D5DB";

    return (
      <Svg height="100%" width="100%" style={StyleSheet.absoluteFillObject}>
        <Defs>
          {/* Seamless repeating pattern with curved 4-point stars */}
          <Pattern
            id="lightStarGrid"
            patternUnits="userSpaceOnUse"
            width={GRID_SIZE}
            height={GRID_SIZE}
          >
            {/* Center the star for perfect tiling */}
            <G transform={`translate(${GRID_SIZE / 2}, ${GRID_SIZE / 2}) scale(${STAR_SIZE})`}>
              <Path d={curvedStarPath} fill={starColor} />
            </G>
          </Pattern>
        </Defs>

        <Rect width="100%" height="100%" fill="url(#lightStarGrid)" />
      </Svg>
    );
  };

  /** DARK MODE - Celestial stars only (no grid) */
  const renderDarkPattern = () => {
    // Dark mode: Scattered celestial stars on #0B0B0C background
    const starBright = "rgba(255,255,255,0.35)"; // Bright accent stars
    const starMedium = "rgba(255,255,255,0.28)"; // Medium brightness
    const starBlue = "rgba(200,220,255,0.32)"; // Blue-tinted celestial stars
    const starDim = "rgba(255,255,255,0.22)"; // Dim accent stars

    return (
      <Svg height="100%" width="100%" style={StyleSheet.absoluteFillObject}>
        <Defs>
          {/* Celestial sprinkle stars - scattered accent stars only */}
          <Pattern id="darkStars" patternUnits="userSpaceOnUse" width={GRID_SIZE * 12} height={GRID_SIZE * 12}>
            {/* Larger bright stars */}
            <Circle cx="22" cy="32" r="1.8" fill={starBright} />
            <Circle cx="62" cy="18" r="1.6" fill={starMedium} />
            <Circle cx="95" cy="75" r="2.0" fill={starBright} />
            <Circle cx="35" cy="98" r="1.5" fill={starBlue} />
            <Circle cx="78" cy="118" r="1.7" fill={starMedium} />
            <Circle cx="125" cy="48" r="1.6" fill={starBlue} />

            {/* Additional medium stars */}
            <Circle cx="145" cy="85" r="1.4" fill={starMedium} />
            <Circle cx="50" cy="155" r="1.5" fill={starBright} />
            <Circle cx="180" cy="125" r="1.3" fill={starBlue} />
            <Circle cx="110" cy="165" r="1.6" fill={starMedium} />
            <Circle cx="210" cy="55" r="1.4" fill={starBright} />

            {/* Small accent stars */}
            <Circle cx="8" cy="65" r="1.0" fill={starDim} />
            <Circle cx="135" cy="25" r="1.1" fill={starDim} />
            <Circle cx="175" cy="145" r="0.9" fill={starDim} />
            <Circle cx="45" cy="185" r="1.0" fill={starDim} />
            <Circle cx="195" cy="95" r="1.1" fill={starDim} />
            <Circle cx="85" cy="8" r="0.9" fill={starDim} />
            <Circle cx="165" cy="200" r="1.0" fill={starDim} />
            <Circle cx="225" cy="175" r="0.9" fill={starDim} />
          </Pattern>
        </Defs>

        {/* Dark background with scattered stars only - no grid */}
        <Rect width="100%" height="100%" fill="#0B0B0C" />
        <Rect width="100%" height="100%" fill="url(#darkStars)" />
      </Svg>
    );
  };

  return (
    <View style={styles.container} pointerEvents="none">
      {theme === "light" ? renderLightPattern() : renderDarkPattern()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { ...StyleSheet.absoluteFillObject, zIndex: 0 },
});
