import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function SplashScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Siapiau Addurniadol yn y Cefndir */}
      <View style={styles.topCurveBackground}>
        <View style={styles.decorCircleLarge} />
        <View style={styles.decorCircleSmall} />
      </View>

      {/* Rhan Ganolog: Brand a Darlun */}
      <View style={styles.centerSection}>
        <View style={styles.logoOuterGlow}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoIcon}>🌱</Text>
          </View>
        </View>

        <Text style={styles.appName}>CropCare</Text>
        <Text style={styles.appTagline}>Healthy Crops · Brighter Harvests</Text>

        <View style={styles.badgePill}>
          <Text style={styles.badgeLeaf}>🍃</Text>
          <Text style={styles.badgeText}>AI Plant Health Advisory</Text>
        </View>

        <Text style={styles.subtext}>
          Protect your crops with fast diagnosis and expert guidance.
        </Text>
      </View>

      {/* Rhan Isaf: Botwm a Chydnabyddiaeth */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => router.push("/onboarding" as any)}
          activeOpacity={0.88}
        >
          <Text style={styles.continueButtonText}>Get Started ➔</Text>
        </TouchableOpacity>

        <View style={styles.footerRow}>
          <Text style={styles.sliitLabel}>Powered by</Text>
          <Text style={styles.sliitBrand}>SLIIT · Group WE_178</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FAF7",
    justifyContent: "space-between",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  topCurveBackground: {
    position: "absolute",
    top: -90,
    width: 440,
    height: 280,
    backgroundColor: "#E8F5EB",
    borderRadius: 220,
    zIndex: 0,
  },
  decorCircleLarge: {
    position: "absolute",
    top: 60,
    right: 40,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "rgba(23, 107, 58, 0.08)",
  },
  decorCircleSmall: {
    position: "absolute",
    bottom: 20,
    left: 50,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(23, 107, 58, 0.06)",
  },
  centerSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
    width: "100%",
    marginTop: 40,
  },
  logoOuterGlow: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#D7EFE0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#176B3A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 6,
  },
  logoCircle: {
    width: 106,
    height: 106,
    borderRadius: 53,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#CBE7D4",
  },
  logoIcon: {
    fontSize: 52,
  },
  appName: {
    fontSize: 34,
    fontWeight: "900",
    color: "#13582F",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  appTagline: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3C4D41",
    marginBottom: 16,
  },
  badgePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E4F4E8",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#BDDFC6",
    marginBottom: 16,
  },
  badgeLeaf: {
    fontSize: 13,
    marginRight: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#186838",
  },
  subtext: {
    fontSize: 13,
    color: "#65776B",
    textAlign: "center",
    maxWidth: 260,
    lineHeight: 19,
  },
  bottomSection: {
    width: "100%",
    alignItems: "center",
    zIndex: 1,
  },
  continueButton: {
    backgroundColor: "#176B3A",
    width: "100%",
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#176B3A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 14,
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  sliitLabel: {
    fontSize: 11,
    color: "#8A9A8F",
  },
  sliitBrand: {
    fontSize: 11,
    color: "#43574A",
    fontWeight: "700",
  },
});
