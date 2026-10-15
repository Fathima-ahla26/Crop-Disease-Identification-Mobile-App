import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ScanScreen() {
  const router = useRouter();
  const [selectedCrop, setSelectedCrop] = useState<string>("tomato");

  // Crops Database
  const cropsList = [
    {
      id: "tomato",
      name: "Tomato Leaf",
      emoji: "🍅",
      leafIcon: "🍃",
      preview: "Brown Concentric Rings Detected",
      color: "#DC2626",
      bg: "#FEF2F2",
    },
    {
      id: "paddy",
      name: "Paddy Leaf",
      emoji: "🌾",
      leafIcon: "🌿",
      preview: "Spindle Blast Lesions Detected",
      color: "#15803D",
      bg: "#F0FDF4",
    },
    {
      id: "chilli",
      name: "Chilli Leaf",
      emoji: "🌶️",
      leafIcon: "🌱",
      preview: "Leaf Curl & Mosaic Virus Detected",
      color: "#D97706",
      bg: "#FFFBEB",
    },
    {
      id: "brinjal",
      name: "Brinjal Leaf",
      emoji: "🍆",
      leafIcon: "☘️",
      preview: "Phomopsis Blight Spot Detected",
      color: "#7C3AED",
      bg: "#F5F3FF",
    },
  ];

  const current = cropsList.find((c) => c.id === selectedCrop) || cropsList[0];

  const handleAnalyze = () => {
    // Navigates directly to the Analyzing loading screen
    router.push({
      pathname: "/analyzing",
      params: { crop: selectedCrop },
    } as any);
  };

  return (
    <View style={styles.container}>
      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.replace("/home")}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.backText}>❮</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Identify Disease</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {/* Sample Leaf Selectors */}
        <View style={styles.sampleSelectorBox}>
          <Text style={styles.selectorHeading}>Select Sample Leaf / Crop</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sampleRow}
          >
            {cropsList.map((crop) => {
              const isSelected = selectedCrop === crop.id;
              return (
                <TouchableOpacity
                  key={crop.id}
                  style={[
                    styles.sampleCard,
                    isSelected && {
                      borderColor: crop.color,
                      backgroundColor: crop.bg,
                    },
                  ]}
                  onPress={() => setSelectedCrop(crop.id)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.cropVisualEmoji}>{crop.emoji}</Text>
                  <Text
                    style={[
                      styles.cardTitle,
                      isSelected && { color: crop.color, fontWeight: "800" },
                    ]}
                  >
                    {crop.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Viewfinder Camera Box */}
        <View style={styles.cameraBox}>
          <View
            style={[styles.viewfinderFrame, { backgroundColor: current.bg }]}
          >
            <View
              style={[
                styles.corner,
                styles.topLeft,
                { borderColor: current.color },
              ]}
            />
            <View
              style={[
                styles.corner,
                styles.topRight,
                { borderColor: current.color },
              ]}
            />
            <View
              style={[
                styles.corner,
                styles.bottomLeft,
                { borderColor: current.color },
              ]}
            />
            <View
              style={[
                styles.corner,
                styles.bottomRight,
                { borderColor: current.color },
              ]}
            />

            <View style={styles.visualContainer}>
              <View style={styles.leafIconCircle}>
                <Text style={styles.giantLeaf}>{current.leafIcon}</Text>
              </View>
              <View
                style={[styles.lesionTag, { backgroundColor: current.color }]}
              >
                <Text style={styles.lesionTagText}>{current.preview}</Text>
              </View>
            </View>
          </View>
          <Text style={styles.instructionNote}>
            Position the affected plant part inside the frame
          </Text>
        </View>

        {/* Action Button: triggers analyzing screen */}
        <TouchableOpacity
          style={styles.analyzeButton}
          onPress={handleAnalyze}
          activeOpacity={0.88}
        >
          <Text style={styles.analyzeText}>Analyze Photo ➔</Text>
        </TouchableOpacity>
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
    padding: 6,
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
    padding: 16,
    justifyContent: "space-between",
  },
  sampleSelectorBox: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  selectorHeading: {
    fontSize: 12,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 8,
  },
  sampleRow: {
    gap: 8,
  },
  sampleCard: {
    width: 105,
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cropVisualEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: "#4B5563",
    textAlign: "center",
  },
  cameraBox: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  viewfinderFrame: {
    width: 250,
    height: 250,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  corner: {
    position: "absolute",
    width: 26,
    height: 26,
    zIndex: 2,
  },
  topLeft: { top: 8, left: 8, borderTopWidth: 3, borderLeftWidth: 3 },
  topRight: { top: 8, right: 8, borderTopWidth: 3, borderRightWidth: 3 },
  bottomLeft: { bottom: 8, left: 8, borderBottomWidth: 3, borderLeftWidth: 3 },
  bottomRight: {
    bottom: 8,
    right: 8,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  visualContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  leafIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  giantLeaf: {
    fontSize: 48,
  },
  lesionTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  lesionTagText: {
    color: "#FFF",
    fontSize: 9,
    fontWeight: "700",
    textAlign: "center",
  },
  instructionNote: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 10,
    textAlign: "center",
  },
  analyzeButton: {
    backgroundColor: "#176B3A",
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#176B3A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  analyzeText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
