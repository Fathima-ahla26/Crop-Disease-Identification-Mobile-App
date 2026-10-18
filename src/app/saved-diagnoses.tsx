import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function SavedDiagnosesScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "pending" | "resolved">("all");
  const [search, setSearch] = useState("");
  const [records, setRecords] = useState<any[]>([]);

  // Default initial records (පළමු වර load වන විට)
  const defaultRecords = [
    {
      id: "1",
      crop: "Tomato",
      disease: "Early blight",
      date: "08 Oct 2026",
      status: "pending",
      icon: "🍅",
    },
    {
      id: "2",
      crop: "Rice",
      disease: "Leaf blast",
      date: "05 Oct 2026",
      status: "resolved",
      icon: "🌾",
    },
    {
      id: "3",
      crop: "Chilli",
      disease: "Leaf curl disease",
      date: "02 Oct 2026",
      status: "pending",
      icon: "🌶️",
    },
    {
      id: "4",
      crop: "Brinjal",
      disease: "Leaf spot",
      date: "28 Sep 2026",
      status: "resolved",
      icon: "🍆",
    },
  ];

  // CRUD: READ (AsyncStorage එකෙන් කියවීම)
  const loadRecords = async () => {
    try {
      const data = await AsyncStorage.getItem("@cropcare_diagnoses");
      if (data) {
        setRecords(JSON.parse(data));
      } else {
        // storage හි data නැතිනම් default data save කර පෙන්වීම
        await AsyncStorage.setItem(
          "@cropcare_diagnoses",
          JSON.stringify(defaultRecords),
        );
        setRecords(defaultRecords);
      }
    } catch (e) {
      setRecords(defaultRecords);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  // CRUD: UPDATE (Pending/Resolved status එක update කිරීම)
  const handleToggleStatus = async (id: string) => {
    const updated = records.map((r) => {
      if (r.id === id) {
        return {
          ...r,
          status: r.status === "pending" ? "resolved" : "pending",
        };
      }
      return r;
    });
    setRecords(updated);
    await AsyncStorage.setItem("@cropcare_diagnoses", JSON.stringify(updated));
  };

  // CRUD: DELETE (Record එක delete කර දැමීම)
  const handleDeleteRecord = (id: string) => {
    Alert.alert(
      "Delete Record",
      "Are you sure you want to remove this diagnosis record?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const filtered = records.filter((r) => r.id !== id);
            setRecords(filtered);
            await AsyncStorage.setItem(
              "@cropcare_diagnoses",
              JSON.stringify(filtered),
            );
          },
        },
      ],
    );
  };

  const filteredRecords = records.filter((item) => {
    const matchesFilter = filter === "all" || item.status === filter;
    const matchesSearch =
      item.crop.toLowerCase().includes(search.toLowerCase()) ||
      item.disease.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.replace("/home")}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.backIcon}>❮</Text>
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Saved Diagnoses</Text>
          <Text style={styles.headerSub}>
            Plant health · Farmer history ({records.length} records)
          </Text>
        </View>
        <Text style={styles.badgeHeader}>🔖</Text>
      </View>

      <View style={styles.body}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search crop or disease..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[
              styles.filterPill,
              filter === "all" && styles.filterPillActive,
            ]}
            onPress={() => setFilter("all")}
          >
            <Text
              style={[
                styles.filterText,
                filter === "all" && styles.filterTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterPill,
              filter === "pending" && styles.filterPillActive,
            ]}
            onPress={() => setFilter("pending")}
          >
            <Text
              style={[
                styles.filterText,
                filter === "pending" && styles.filterTextActive,
              ]}
            >
              Pending
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterPill,
              filter === "resolved" && styles.filterPillActive,
            ]}
            onPress={() => setFilter("resolved")}
          >
            <Text
              style={[
                styles.filterText,
                filter === "resolved" && styles.filterTextActive,
              ]}
            >
              Resolved
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
        >
          {filteredRecords.length === 0 ? (
            <Text style={styles.emptyText}>No diagnosis records found.</Text>
          ) : (
            filteredRecords.map((item) => (
              <View key={item.id} style={styles.recordCard}>
                <View style={styles.cropIconBox}>
                  <Text style={styles.cropIcon}>{item.icon}</Text>
                </View>
                <TouchableOpacity
                  style={styles.recordDetails}
                  onPress={() =>
                    router.push({
                      pathname: "/diagnosis-result",
                      params: { crop: item.crop.toLowerCase() },
                    } as any)
                  }
                >
                  <Text style={styles.cropTitle}>{item.crop}</Text>
                  <Text style={styles.diseaseName}>{item.disease}</Text>
                  <Text style={styles.dateText}>{item.date}</Text>
                </TouchableOpacity>

                <View style={styles.actionColumn}>
                  {/* Status Toggle Button (Update) */}
                  <TouchableOpacity
                    style={[
                      styles.statusBadge,
                      item.status === "resolved"
                        ? styles.statusResolved
                        : styles.statusPending,
                    ]}
                    onPress={() => handleToggleStatus(item.id)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        item.status === "resolved"
                          ? styles.textResolved
                          : styles.textPending,
                      ]}
                    >
                      {item.status === "resolved" ? "✓ Resolved" : "⏳ Pending"}
                    </Text>
                  </TouchableOpacity>

                  {/* Delete Button (Delete) */}
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDeleteRecord(item.id)}
                  >
                    <Text style={styles.deleteIcon}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.replace("/home")}
          activeOpacity={0.8}
        >
          <Text style={styles.tabEmoji}>🏠</Text>
          <Text style={styles.tabLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push("/scan" as any)}
          activeOpacity={0.8}
        >
          <Text style={styles.tabEmoji}>📷</Text>
          <Text style={styles.tabLabel}>Diagnose</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} activeOpacity={0.8}>
          <Text style={styles.tabEmoji}>🔖</Text>
          <Text style={[styles.tabLabel, styles.tabActiveText]}>Saved</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push("/treatment-plan" as any)}
          activeOpacity={0.8}
        >
          <Text style={styles.tabEmoji}>📋</Text>
          <Text style={styles.tabLabel}>Treatment</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAF8" },
  header: {
    backgroundColor: "#176B3A",
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  backBtn: { padding: 6, marginRight: 8 },
  backIcon: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
  headerTextContainer: { flex: 1 },
  headerTitle: { fontSize: 16, fontWeight: "800", color: "#FFF" },
  headerSub: { fontSize: 11, color: "#D1E7DD" },
  badgeHeader: { fontSize: 20 },
  body: { flex: 1, padding: 16 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 12,
  },
  searchIcon: { fontSize: 14, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 13, color: "#1F2937" },
  filterRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
  },
  filterPillActive: { backgroundColor: "#176B3A" },
  filterText: { fontSize: 12, fontWeight: "600", color: "#4B5563" },
  filterTextActive: { color: "#FFF" },
  list: { gap: 10, paddingBottom: 16 },
  emptyText: {
    textAlign: "center",
    color: "#9CA3AF",
    marginTop: 30,
    fontSize: 13,
  },
  recordCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    elevation: 2,
  },
  cropIconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  cropIcon: { fontSize: 20 },
  recordDetails: { flex: 1 },
  cropTitle: { fontSize: 13, fontWeight: "700", color: "#1F2937" },
  diseaseName: { fontSize: 11, color: "#6B7280", marginTop: 1 },
  dateText: { fontSize: 10, color: "#9CA3AF", marginTop: 2 },
  actionColumn: { alignItems: "flex-end", gap: 6 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusPending: { backgroundColor: "#FEF3C7" },
  statusResolved: { backgroundColor: "#DEF7EC" },
  statusBadgeText: { fontSize: 10, fontWeight: "700" },
  textPending: { color: "#D97706" },
  textResolved: { color: "#059669" },
  deleteBtn: { padding: 4 },
  deleteIcon: { fontSize: 14 },
  bottomBar: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingVertical: 10,
    justifyContent: "space-around",
  },
  tabItem: { alignItems: "center" },
  tabEmoji: { fontSize: 18 },
  tabLabel: { fontSize: 10, color: "#6B7280", marginTop: 2 },
  tabActiveText: { color: "#176B3A", fontWeight: "700" },
});
