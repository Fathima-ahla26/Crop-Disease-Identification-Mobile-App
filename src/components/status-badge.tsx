import { StyleSheet, Text, View } from "react-native";
import { COLORS } from "../constants/colors";

type StatusType = "high" | "medium" | "low";

type Props = {
  label: string;
  type?: StatusType;
};

export default function StatusBadge({ label, type = "high" }: Props) {
  const getBadgeStyle = () => {
    switch (type) {
      case "high":
        return { bg: COLORS.dangerLight, text: "#B3261E" };
      case "medium":
        return { bg: COLORS.warningLight, text: "#8D6B00" };
      case "low":
        return { bg: COLORS.successLight, text: COLORS.primaryDark };
    }
  };

  const style = getBadgeStyle();

  return (
    <View style={[styles.badge, { backgroundColor: style.bg }]}>
      <Text style={[styles.text, { color: style.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  text: {
    fontSize: 12,
    fontWeight: "600",
  },
});
