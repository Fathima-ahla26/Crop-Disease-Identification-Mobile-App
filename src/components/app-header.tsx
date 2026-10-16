import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { COLORS } from "../constants/colors";

type Props = {
  rightElement?: React.ReactNode;
};

export default function AppHeader({ rightElement }: Props) {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.title}>Plant Health</Text>
        <Text style={styles.role}>Farmer</Text>
      </View>
      {rightElement && <View>{rightElement}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  role: {
    color: COLORS.white,
    fontSize: 11,
  },
});
