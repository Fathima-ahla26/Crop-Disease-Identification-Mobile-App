import React from "react";
import { StyleSheet, View } from "react-native";
import { COLORS } from "../constants/colors";

type Props = {
  children: React.ReactNode;
};

export default function ScreenContainer({ children }: Props) {
  return (
    <View style={styles.outer}>
      <View style={styles.inner}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  inner: {
    width: "100%",
    maxWidth: 412,
    height: "100%",
    maxHeight: 890,
    backgroundColor: COLORS.background,
    borderRadius: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
});
