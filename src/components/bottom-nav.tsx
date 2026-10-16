import { usePathname, useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../constants/colors";

type Props = {
  language?: "si" | "en";
};

export default function BottomNav({ language = "en" }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    {
      id: "home",
      name: language === "en" ? "Home" : "මුල් පිටුව",
      icon: "🏠",
      route: "/home",
    },
    {
      id: "diagnose",
      name: language === "en" ? "Diagnose" : "ස්කෑන්",
      icon: "📷",
      route: "/scan",
    },
    {
      id: "saved",
      name: language === "en" ? "Saved" : "සුරැකි",
      icon: "🔖",
      route: "/saved-diagnoses",
    },
    {
      id: "treatment",
      name: language === "en" ? "Treatment" : "ප්‍රතිකාර",
      icon: "📋",
      route: "/treatment-plan",
    },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = pathname === tab.route;
        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tabItem}
            onPress={() => router.push(tab.route as any)}
            activeOpacity={0.7}
          >
            <Text style={[styles.icon, isActive && styles.activeIcon]}>
              {tab.icon}
            </Text>
            <Text style={[styles.label, isActive && styles.activeLabel]}>
              {tab.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingVertical: 10,
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingVertical: 4,
  },
  icon: {
    fontSize: 20,
    marginBottom: 4,
  },
  activeIcon: {
    transform: [{ scale: 1.15 }],
  },
  label: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  activeLabel: {
    color: COLORS.primary,
    fontWeight: "700",
  },
});
