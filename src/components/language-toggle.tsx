import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../constants/colors";

type Props = {
  language: "si" | "en";
  onChange: (language: "si" | "en") => void;
};

export default function LanguageToggle({ language, onChange }: Props) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.option, language === "si" && styles.activeOption]}
        onPress={() => onChange("si")}
      >
        <Text style={[styles.text, language === "si" && styles.activeText]}>
          Sinhala
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.option, language === "en" && styles.activeOption]}
        onPress={() => onChange("en")}
      >
        <Text style={[styles.text, language === "en" && styles.activeText]}>
          English
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#145C34",
    borderRadius: 8,
    padding: 2,
    alignSelf: "flex-start",
  },
  option: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  activeOption: {
    backgroundColor: COLORS.white,
  },
  text: {
    color: COLORS.white,
    fontSize: 11,
  },
  activeText: {
    color: COLORS.primary,
    fontWeight: "600",
  },
});
