import { useRouter } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function CaseStatusScreen() {
  const router = useRouter();

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
        <Text style={styles.headerTitle}>Case Status</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollBody}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Banner */}
        <View style={styles.successCard}>
          <Text style={styles.successIcon}>✅</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.successHeading}>Case Submitted to Officer</Text>
            <Text style={styles.successDesc}>
              Your case was sent successfully. An officer's review is pending.
            </Text>
          </View>
        </View>

        {/* Case Progress Timeline */}
        <View style={styles.progressCard}>
          <Text style={styles.sectionTitle}>Case Progress</Text>

          {/* Step 1: Completed */}
          <View style={styles.stepRow}>
            <View style={styles.dotFilled}>
              <Text style={styles.dotCheck}>✓</Text>
            </View>
            <View style={styles.stepInfo}>
              <Text style={styles.stepTitleActive}>Submitted</Text>
              <Text style={styles.stepSub}>Your case has been received.</Text>
            </View>
          </View>

          <View style={styles.verticalLineActive} />

          {/* Step 2: In Review */}
          <View style={styles.stepRow}>
            <View style={styles.dotPending}>
              <View style={styles.innerDot} />
            </View>
            <View style={styles.stepInfo}>
              <Text style={styles.stepTitlePending}>
                Under Review by Officer
              </Text>
              <Text style={styles.stepSub}>
                Pending · Awaiting officer review
              </Text>
            </View>
          </View>

          <View style={styles.verticalLineInactive} />

          {/* Step 3: Pending Advice */}
          <View style={styles.stepRow}>
            <View style={styles.dotInactive} />
            <View style={styles.stepInfo}>
              <Text style={styles.stepTitleInactive}>Advice Pending</Text>
              <Text style={styles.stepSub}>
                Advice will appear after the review.
              </Text>
            </View>
          </View>
        </View>

        {/* Submitted Summary Details */}
        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>
            Submitted Details (Sample Case)
          </Text>
          <View style={styles.detailRow}>
            <View style={styles.cropIconBox}>
              <Text style={styles.cropIcon}>🍅</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cropSub}>Tomato plant · Sample</Text>
              <Text style={styles.cropDisease}>Possible early blight</Text>
              <View style={styles.lowConfTag}>
                <Text style={styles.lowConfText}>⚠️ Low confidence - 42%</Text>
              </View>
            </View>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Location:</Text>
            <Text style={styles.metaVal}>Anuradhapura, North Central</Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Agricultural Office:</Text>
            <Text style={styles.metaVal}>Anuradhapura Agrarian Services</Text>
          </View>
        </View>
      </ScrollView>

      {/* Back to Home Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.homeBtn}
          onPress={() => router.replace("/home")}
          activeOpacity={0.88}
        >
          <Text style={styles.homeBtnText}>Back to Home</Text>
        </TouchableOpacity>
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
    paddingBottom: 20,
  },
  successCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    gap: 12,
  },
  successIcon: {
    fontSize: 26,
  },
  successHeading: {
    fontSize: 14,
    fontWeight: "800",
    color: "#065F46",
  },
  successDesc: {
    fontSize: 11,
    color: "#047857",
    marginTop: 2,
    lineHeight: 16,
  },
  progressCard: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 14,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dotFilled: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#176B3A",
    alignItems: "center",
    justifyContent: "center",
  },
  dotCheck: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  dotPending: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#D97706",
    alignItems: "center",
    justifyContent: "center",
  },
  innerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D97706",
  },
  dotInactive: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#D1D5DB",
  },
  verticalLineActive: {
    width: 2,
    height: 24,
    backgroundColor: "#176B3A",
    marginLeft: 10,
    marginVertical: 2,
  },
  verticalLineInactive: {
    width: 2,
    height: 24,
    backgroundColor: "#E5E7EB",
    marginLeft: 10,
    marginVertical: 2,
  },
  stepInfo: {
    flex: 1,
  },
  stepTitleActive: {
    fontSize: 13,
    fontWeight: "700",
    color: "#176B3A",
  },
  stepTitlePending: {
    fontSize: 13,
    fontWeight: "700",
    color: "#D97706",
  },
  stepTitleInactive: {
    fontSize: 13,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  stepSub: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 1,
  },
  summaryCard: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    marginBottom: 12,
  },
  cropIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
  },
  cropIcon: {
    fontSize: 22,
  },
  cropSub: {
    fontSize: 11,
    color: "#6B7280",
  },
  cropDisease: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1F2937",
  },
  lowConfTag: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginTop: 2,
  },
  lowConfText: {
    fontSize: 10,
    color: "#B45309",
    fontWeight: "700",
  },
  metaRow: {
    marginTop: 6,
  },
  metaLabel: {
    fontSize: 11,
    color: "#6B7280",
  },
  metaVal: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1F2937",
  },
  footer: {
    padding: 16,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  homeBtn: {
    height: 48,
    backgroundColor: "#176B3A",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  homeBtnText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
