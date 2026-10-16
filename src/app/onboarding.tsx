import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function OnboardingScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Bakgrawnd Shɛp dɛn fɔ mek i fayn */}
      <View style={styles.topCurveBackground}>
        <View style={styles.decorCircleLarge} />
        <View style={styles.decorCircleSmall} />
      </View>

      {/* Skip bɔtin */}
      <TouchableOpacity
        style={styles.skipBtn}
        onPress={() => router.replace("/login" as any)}
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Di bɔdi pat wit di fama pikchɔ */}
      <View style={styles.content}>
        <View style={styles.avatarGlow}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>👨‍🌾</Text>
          </View>
        </View>

        <Text style={styles.heading}>Identify Plant Diseases in Seconds</Text>
        <Text style={styles.description}>
          Take or upload a clear photo of your crop leaf to get instant
          analysis, symptoms, and treatment guidelines.
        </Text>

        {/* Slide dɔt dɛn */}
        <View style={styles.dotsRow}>
          <View style={[styles.dot, styles.activeDot]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </View>

      {/* Bɔtin na bɔtɔm */}
      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={() => router.replace("/login" as any)}
        activeOpacity={0.88}
      >
        <Text style={styles.primaryBtnText}>Get Started ➔</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FAF7",
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: "space-between",
    position: "relative",
    overflow: "hidden",
  },
  topCurveBackground: {
    position: "absolute",
    top: -90,
    width: 440,
    height: 260,
    backgroundColor: "#E8F5EB",
    borderRadius: 220,
    zIndex: 0,
  },
  decorCircleLarge: {
    position: "absolute",
    top: 50,
    right: 40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(23, 107, 58, 0.08)",
  },
  decorCircleSmall: {
    position: "absolute",
    bottom: 20,
    left: 40,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(23, 107, 58, 0.06)",
  },
  skipBtn: {
    alignSelf: "flex-end",
    paddingVertical: 6,
    paddingHorizontal: 12,
    zIndex: 1,
  },
  skipText: {
    color: "#65776B",
    fontSize: 13,
    fontWeight: "700",
  },
  content: {
    alignItems: "center",
    paddingHorizontal: 10,
    zIndex: 1,
  },
  avatarGlow: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#D7EFE0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    shadowColor: "#176B3A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 4,
  },
  avatarCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#CBE7D4",
  },
  avatarEmoji: {
    fontSize: 54,
  },
  heading: {
    fontSize: 22,
    fontWeight: "800",
    color: "#13582F",
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 28,
  },
  description: {
    fontSize: 13,
    color: "#55665B",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  dotsRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D3DFD6",
  },
  activeDot: {
    width: 24,
    backgroundColor: "#176B3A",
  },
  primaryBtn: {
    backgroundColor: "#176B3A",
    width: "100%",
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#176B3A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 4,
    zIndex: 1,
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
