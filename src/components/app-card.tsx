import React from "react";
import { StyleSheet, View } from "react-native";
import { COLORS } from "../constants/colors";

type Props = {
  children: React.ReactNode;
};

export default function AppCard({ children }: Props) {
  return <View style={styles.card}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
});
