import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Rect, Defs, Pattern, Circle, Path, G } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';

// Texture pattern settings for subtle noise effect
const TEXTURE_SIZE = 4;
const GRID_SIZE = 24;

export const BackgroundPattern = () => {
  const { theme } = useTheme();

  /**
   * Curved 4-point star path - soft, rounded, symmetrical
   * Shape: soft star/flower hybrid with rounded points
   */
  const curvedStarPath =
    "M0,-1.5 Q-0.4,-1 -0.7,-0.7 Q-1,-0.4 -1.5,0 Q-1,0.4 -0.7,0.7 Q-0.4,1 0,1.5 Q0.4,1 0.7,0.7 Q1,0.4 1.5,0 Q1,-0.4 0.7,-0.7 Q0.4,-1 0,-1.5 Z";

  /** 🌤 LIGHT MODE - Subtle textured grain pattern with curved stars */
  const renderLightPattern = () => {
    // Light mode: subtle gray stars on white background
    const textureColor1 = "rgba(0,0,0,0.08)";
    const textureColor2 = "rgba(0,0,0,0.06)";
    const textureColor3 = "rgba(0,0,0,0.10)";

    return (
      <Svg height="100%" width="100%" style={StyleSheet.absoluteFillObject}>
        <Defs>
          {/* Organic noise texture pattern with curved stars */}
          <Pattern
            id="lightTexture"
            patternUnits="userSpaceOnUse"
            width={TEXTURE_SIZE}
            height={TEXTURE_SIZE}
          >
            {/* Random scattered texture stars for organic grain effect */}
            <G transform="translate(0.5, 0.8) scale(0.25)">
              <Path d={curvedStarPath} fill={textureColor1} />
            </G>
            <G transform="translate(2.1, 1.5) scale(0.22)">
              <Path d={curvedStarPath} fill={textureColor2} />
            </G>
            <G transform="translate(3.2, 0.3) scale(0.20)">
              <Path d={curvedStarPath} fill={textureColor3} />
            </G>
            <G transform="translate(1.5, 2.9) scale(0.28)">
              <Path d={curvedStarPath} fill={textureColor1} />
            </G>
            <G transform="translate(3.7, 2.2) scale(0.25)">
              <Path d={curvedStarPath} fill={textureColor2} />
            </G>
            <G transform="translate(0.2, 3.5) scale(0.22)">
              <Path d={curvedStarPath} fill={textureColor3} />
            </G>
            <G transform="translate(2.8, 3.8) scale(0.20)">
              <Path d={curvedStarPath} fill={textureColor1} />
            </G>
          </Pattern>
        </Defs>

        <Rect width="100%" height="100%" fill="url(#lightTexture)" />
      </Svg>
    );
  };

  /** 🌙 DARK MODE - Celestial stars only (no grid) */
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
