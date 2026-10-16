import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { api, loadProfile, signOut, type Profile } from "../lib/api";

type ExpertCase = {
  id: number;
  crop?: string;
  disease?: string;
  farmer_name?: string;
  location?: string;
  urgency?: string;
  status?: string;
  created_at?: string;
};

type Filter = "all" | "high" | "moderate";

export default function OfficerDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [cases, setCases] = useState<ExpertCase[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");

  useFocusEffect(
    useCallback(() => {
      let active = true;
      const load = async () => {
        setBusy(true);
        setError("");
        try {
          const user = await loadProfile();
          if (!active) return;
          if (!user) {
            router.replace("/secure-auth");
            return;
          }
          if (user.role !== "officer" && user.role !== "admin") {
            router.replace(
              user.role === "researcher" ? "/researcher-dashboard" : "/home",
            );
            return;
          }
          setProfile(user);
          const data = await api<ExpertCase[]>("/cases");
          if (active) setCases(Array.isArray(data) ? data : []);
        } catch (e: any) {
          if (active) setError(e?.message || "Unable to load expert cases.");
        } finally {
          if (active) setBusy(false);
        }
      };
      void load();
      return () => {
        active = false;
      };
    }, [router]),
  );

  const visible = useMemo(
    () =>
      cases.filter((c) => {
        const matchesText =
          `${c.farmer_name || ""} ${c.crop || ""} ${c.disease || ""} ${c.location || ""}`
            .toLowerCase()
            .includes(search.trim().toLowerCase());
        const matchesUrgency =
          filter === "all" ||
          (filter === "high" && c.urgency === "high") ||
          (filter === "moderate" && c.urgency === "moderate");
        return matchesText && matchesUrgency;
      }),
    [cases, search, filter],
  );

  const activeCases = cases.filter((c) => c.status !== "reviewed").length;
  const highUrgency = cases.filter(
    (c) => c.urgency === "high" && c.status !== "reviewed",
  ).length;

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.brand}>🌿 CropCare / Agricultural Officer</Text>
        <Text style={styles.title}>Pending Case Reviews</Text>
        <Text style={styles.subtitle}>
          Welcome, {profile?.name || "Officer"}
        </Text>
      </View>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.summaryRow}>
          <View style={styles.summary}>
            <Text style={styles.summaryNumber}>{activeCases}</Text>
            <Text style={styles.summaryCaption}>Awaiting review</Text>
          </View>
          <View style={styles.summary}>
            <Text style={styles.summaryNumber}>{highUrgency}</Text>
            <Text style={styles.summaryCaption}>High urgency</Text>
          </View>
        </View>
        <TextInput
          style={styles.search}
          value={search}
          onChangeText={setSearch}
          placeholder="Search farmer, crop or disease"
          placeholderTextColor="#7A8F80"
        />
        <View style={styles.filters}>
          {(
            [
              ["all", "All cases"],
              ["high", "High urgency"],
              ["moderate", "Moderate"],
            ] as const
          ).map(([value, label]) => (
            <TouchableOpacity
              key={value}
              onPress={() => setFilter(value)}
              style={[styles.filter, filter === value && styles.selectedFilter]}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === value && styles.selectedFilterText,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity
          style={styles.analyticsLink}
          onPress={() => router.push("/outbreak-analytics")}
        >
          <Text style={styles.analyticsText}>▥ View outbreak analytics →</Text>
        </TouchableOpacity>
        <Text style={styles.section}>{visible.length} matching cases</Text>
        {busy && (
          <ActivityIndicator
            color="#166638"
            size="large"
            style={{ marginTop: 25 }}
          />
        )}
        {!!error && <Text style={styles.error}>{error}</Text>}
        {!busy && !error && visible.length === 0 && (
          <Text style={styles.empty}>No matching cases found.</Text>
        )}
        {!busy &&
          visible.map((c) => (
            <View key={c.id} style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.person}>
                  {c.farmer_name || "Farmer"} · #{c.id}
                </Text>
                <Text
                  style={[
                    styles.urgency,
                    c.urgency === "high" ? styles.high : styles.normal,
                  ]}
                >
                  {c.urgency || "moderate"}
                </Text>
              </View>
              <Text style={styles.crop}>
                {c.crop || "Unspecified crop"} ·{" "}
                {c.disease || "Assessment pending"}
              </Text>
              <Text style={styles.meta}>
                {c.location || "Location not provided"} ·{" "}
                {c.status || "submitted"}
              </Text>
              <Text style={styles.meta}>
                {c.created_at
                  ? new Date(c.created_at).toLocaleDateString()
                  : ""}
              </Text>
              <TouchableOpacity
                style={styles.reviewButton}
                onPress={() =>
                  router.push({
                    pathname: "/case-detail",
                    params: { id: String(c.id) },
                  })
                }
              >
                <Text style={styles.reviewText}>
                  {c.status === "reviewed" ? "View Case" : "Review Case"} →
                </Text>
              </TouchableOpacity>
            </View>
          ))}
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity onPress={() => router.replace("/officer-dashboard")}>
          <Text style={styles.footerText}>⌂ Home</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/case-board")}>
          <Text style={styles.footerText}>☷ Cases</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/outbreak-analytics")}>
          <Text style={styles.footerText}>▥ Analytics</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={async () => {
            await signOut();
            router.replace("/secure-auth");
          }}
        >
          <Text style={styles.footerText}>⇥ Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F6FAF7" },
  header: {
    backgroundColor: "#145F39",
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 24,
  },
  brand: { fontSize: 12, fontWeight: "800", color: "#D9EEE0" },
  title: { color: "#FFFFFF", fontSize: 24, fontWeight: "900", marginTop: 13 },
  subtitle: { color: "#D6E9DC", fontSize: 12, marginTop: 6 },
  content: { padding: 16, paddingBottom: 90 },
  summaryRow: { flexDirection: "row", gap: 10, marginBottom: 15 },
  summary: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DCEAE0",
    borderRadius: 13,
    padding: 14,
  },
  summaryNumber: { color: "#145F39", fontSize: 26, fontWeight: "900" },
  summaryCaption: { color: "#607C67", fontSize: 11, marginTop: 3 },
  search: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D7E7DB",
    color: "#204B31",
  },
  filters: { flexDirection: "row", gap: 7, marginTop: 12, marginBottom: 14 },
  filter: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DCE8DF",
    borderRadius: 11,
  },
  selectedFilter: { backgroundColor: "#DFF1E5", borderColor: "#145F39" },
  filterText: { fontSize: 10, color: "#63746A", fontWeight: "700" },
  selectedFilterText: { color: "#145F39" },
  analyticsLink: { padding: 15, backgroundColor: "#E5F2E9", borderRadius: 12 },
  analyticsText: { color: "#145F39", fontWeight: "800" },
  section: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1F4C30",
    marginVertical: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DCE9E0",
    borderRadius: 14,
    padding: 15,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  person: { fontSize: 14, fontWeight: "900", color: "#1C5032", flex: 1 },
  urgency: {
    overflow: "hidden",
    paddingVertical: 4,
    paddingHorizontal: 7,
    borderRadius: 6,
    fontSize: 10,
    fontWeight: "800",
    textTransform: "capitalize",
  },
  high: { color: "#A73535", backgroundColor: "#FFE5E5" },
  normal: { color: "#A27629", backgroundColor: "#FFF2D7" },
  crop: { color: "#365D43", fontSize: 12, marginTop: 9 },
  meta: {
    color: "#708577",
    fontSize: 11,
    marginTop: 5,
    textTransform: "capitalize",
  },
  reviewButton: {
    backgroundColor: "#176B3A",
    borderRadius: 10,
    marginTop: 15,
    padding: 12,
    alignItems: "center",
  },
  reviewText: { color: "#FFFFFF", fontWeight: "800" },
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 16,
    backgroundColor: "#145F39",
  },
  footerText: { color: "#FFFFFF", fontWeight: "700", fontSize: 11 },
  error: { color: "#B32F2F", padding: 12 },
  empty: { textAlign: "center", color: "#6B8270", marginTop: 25 },
});
