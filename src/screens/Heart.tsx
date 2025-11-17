import React from "react";
import { View, Text } from "react-native";
import { styles } from "../styles/Heart.styles";

import BottomNav from "../components/BottomNav";

export default function Heart() {
  return (
    <View style={styles.container}>
      <View style={styles.main}>
        <Text style={styles.messageText}>You are loved.</Text>
        <Text style={styles.subtitleText}>keep going</Text>
      </View>
      <BottomNav />
    </View>
  );
}
