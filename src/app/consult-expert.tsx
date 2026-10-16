import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ConsultExpertScreen() {
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [location, setLocation] = useState("Anuradhapura, North Central");
  const [office, setOffice] = useState("Anuradhapura Agrarian Services");

  const handleSubmit = () => {
    router.push("/case-status" as any);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.replace("/home")}
          style={styles.backBtn}
        >
          <Text style={styles.backText}>❮</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Consult Expert</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollBody}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.intro}>
          Get an agricultural officer's opinion on your plant's symptoms.
        </Text>

        {/* AI Analysis Summary Preview */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>AI Analysis (Sample Case)</Text>
          <View style={styles.sampleRow}>
            <View style={styles.sampleIconBox}>
              <Text style={styles.sampleIcon}>🍅</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.sampleCrop}>Tomato plant · Sample</Text>
              <Text style={styles.sampleDisease}>Possible early blight</Text>
              <View style={styles.confidencePill}>
                <Text style={styles.confidenceText}>
                  ⚠️ Low confidence · 42%
                </Text>
              </View>
            </View>
          </View>
          <Text style={styles.disclaimerText}>
            Diagnosis is uncertain. An officer's review is recommended to
            confirm the cause.
          </Text>
        </View>

        {/* Additional Notes Field */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            Additional notes or symptoms (Optional)
          </Text>
          <TextInput
            style={styles.textArea}
            placeholder="Describe leaf yellowing, stem spots, soil moisture, etc..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
            value={notes}
            onChangeText={setNotes}
          />
        </View>

        {/* Location Field */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Location (Auto-detected)</Text>
          <View style={styles.locationBox}>
            <Text style={styles.locationIcon}>📍</Text>
            <TextInput
              style={styles.locationInput}
              value={location}
              onChangeText={setLocation}
            />
          </View>
        </View>

        {/* Nearest Agri Office */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Nearest Agricultural Office</Text>
          <View style={styles.locationBox}>
            <Text style={styles.locationIcon}>🏛️</Text>
            <TextInput
              style={styles.locationInput}
              value={office}
              onChangeText={setOffice}
            />
          </View>
        </View>
      </ScrollView>

      {/* Footer Submit Action */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleSubmit}
          activeOpacity={0.88}
        >
          <Text style={styles.submitBtnText}>Send to Agricultural Officer</Text>
        </TouchableOpacity>
        <Text style={styles.footerCaption}>
          Your photo, AI analysis, and location will be shared.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAF8",
  },
  header: {
    backgroundColor: "#176B3A",
    paddingVertical: 14,
    paddingHorizontal: 16,
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
  scrollBody: {
    padding: 16,
    paddingBottom: 24,
  },
  intro: {
    fontSize: 12,
    color: "#4B5563",
    marginBottom: 14,
    lineHeight: 18,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 14,
  },
  cardHeader: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
    marginBottom: 10,
    textTransform: "uppercase",
  },
  sampleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  sampleIconBox: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
  },
  sampleIcon: {
    fontSize: 26,
  },
  sampleCrop: {
    fontSize: 11,
    color: "#6B7280",
  },
  sampleDisease: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
  },
  confidencePill: {
    alignSelf: "flex-start",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 3,
  },
  confidenceText: {
    fontSize: 10,
    color: "#B45309",
    fontWeight: "700",
  },
  disclaimerText: {
    fontSize: 11,
    color: "#6B7280",
    lineHeight: 16,
    marginTop: 4,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 6,
  },
  textArea: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    color: "#1F2937",
    textAlignVertical: "top",
    height: 90,
  },
  locationBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
  },
  locationIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  locationInput: {
    flex: 1,
    fontSize: 13,
    color: "#1F2937",
  },
  footer: {
    padding: 16,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    alignItems: "center",
  },
  submitBtn: {
    width: "100%",
    height: 48,
    backgroundColor: "#176B3A",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#176B3A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  submitBtnText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "700",
  },
  footerCaption: {
    fontSize: 10,
    color: "#9CA3AF",
    marginTop: 6,
  },
});
