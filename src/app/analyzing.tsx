import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function AnalyzingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const selectedCrop = (params.crop as string) || "tomato";

  const [statusText, setStatusText] = useState(
    "Extracting leaf characteristics...",
  );

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setStatusText("Matching disease patterns with AI model...");
    }, 1200);

    const timer2 = setTimeout(() => {
      setStatusText("Generating confidence and advisory...");
    }, 2200);

    const timer3 = setTimeout(() => {
      // 3 seconds baad diagnosis-result par redirect
      router.replace({
        pathname: "/diagnosis-result",
        params: { crop: selectedCrop },
      } as any);
    }, 3200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [selectedCrop]);

  return (
    <View style={styles.container}>
      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.replace("/scan")}
          style={styles.backBtn}
        >
          <Text style={styles.backText}>❮</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analyzing</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {/* Captured Photo Preview Card */}
        <View style={styles.capturedCard}>
          <Text style={styles.capturedLabel}>Captured Photo</Text>
          <View style={styles.leafBox}>
            <Text style={styles.leafIcon}>
              {selectedCrop === "tomato" ? "🍅" : "🌾"}
            </Text>
            <View style={styles.leafPill}>
              <Text style={styles.leafPillText}>Captured leaf image</Text>
            </View>
          </View>
          <Text style={styles.subProcessing}>
            Processing the selected leaf image
          </Text>
        </View>

        {/* Loading Spinner & Progress */}
        <View style={styles.loaderSection}>
          <ActivityIndicator
            size="large"
            color="#176B3A"
            style={styles.spinner}
          />
          <Text style={styles.analyzingHeading}>
            Analyzing plant disease...
          </Text>
          <Text style={styles.statusDescription}>{statusText}</Text>
          <Text style={styles.modelNote}>
            This may take a few moments while the model reviews the leaf image.
          </Text>
        </View>

        {/* Cancel Action */}
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => router.replace("/scan")}
          activeOpacity={0.8}
        >
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.cancelNote}>
          Canceling will stop the diagnosis and return you to the camera screen.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FAF7",
  },
  header: {
    backgroundColor: "#176B3A",
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  backBtn: {
    padding: 4,
  },
  backText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFF",
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "space-between",
    alignItems: "center",
  },
  capturedCard: {
    width: "100%",
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  capturedLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#374151",
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  leafBox: {
    width: "100%",
    height: 130,
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginBottom: 8,
  },
  leafIcon: {
    fontSize: 48,
  },
  leafPill: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(23, 107, 58, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  leafPillText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "700",
  },
  subProcessing: {
    fontSize: 11,
    color: "#6B7280",
  },
  loaderSection: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  spinner: {
    transform: [{ scale: 1.3 }],
    marginBottom: 16,
  },
  analyzingHeading: {
    fontSize: 18,
    fontWeight: "800",
    color: "#13582F",
    marginBottom: 8,
  },
  statusDescription: {
    fontSize: 13,
    color: "#059669",
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  modelNote: {
    fontSize: 11,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 16,
  },
  cancelBtn: {
    width: "100%",
    height: 48,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
  },
  cancelNote: {
    fontSize: 10,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: -8,
  },
});
