import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { api } from "../lib/api";

type Diagnosis = {
  id: number;
  crop: string;
  disease: string;
  status: string;
  created_at: string;
};

export default function Records() {
  const router = useRouter();

  const [items, setItems] = useState<Diagnosis[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(true);

  const [selectedRecord, setSelectedRecord] = useState<Diagnosis | null>(null);

  const [deleting, setDeleting] = useState(false);

  // READ - Load saved diagnoses from MySQL
  const refresh = useCallback(async () => {
    setBusy(true);
    setError("");

    try {
      const records = await api<Diagnosis[]>("/diagnoses");
      setItems(records);
    } catch (e: any) {
      setError(e.message || "Failed to load diagnoses");
    } finally {
      setBusy(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  // Open confirmation dialog
  const requestDelete = (record: Diagnosis) => {
    setSelectedRecord(record);
  };

  // DELETE - Delete diagnosis from MySQL
  const confirmDelete = async () => {
    if (!selectedRecord || deleting) return;

    const id = selectedRecord.id;
    setDeleting(true);
    setError("");

    try {
      await api(`/diagnoses/${id}`, {
        method: "DELETE",
      });

      // Remove deleted diagnosis from the list
      setItems((previous) => previous.filter((item) => item.id !== id));

      setSelectedRecord(null);
    } catch (e: any) {
      setSelectedRecord(null);
      setError(e.message || "Failed to delete diagnosis");
    } finally {
      setDeleting(false);
    }
  };

  const filteredItems = items.filter((item) =>
    `${item.crop} ${item.disease}`.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Saved Diagnoses</Text>
        <Text style={styles.subtitle}>{items.length} saved records</Text>
      </View>

      {/* Search */}
      <TextInput
        style={styles.search}
        value={query}
        onChangeText={setQuery}
        placeholder="Search crop or disease..."
        placeholderTextColor="#89998D"
      />

      {!!error && <Text style={styles.error}>{error}</Text>}

      {/* Records */}
      {busy ? (
        <ActivityIndicator color="#176B3A" style={{ marginTop: 30 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {filteredItems.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.recordInfo}>
                <Text style={styles.crop}>{item.crop}</Text>

                <Text style={styles.disease}>{item.disease}</Text>

                <Text style={styles.date}>
                  {new Date(item.created_at).toLocaleDateString()}
                  {" · "}
                  {item.status}
                </Text>
              </View>

              {/* View Diagnosis */}
              <TouchableOpacity
                style={styles.viewButton}
                onPress={() =>
                  router.push({
                    pathname: "/live-result",
                    params: {
                      id: String(item.id),
                    },
                  })
                }
              >
                <Text style={styles.viewText}>View</Text>
              </TouchableOpacity>

              {/* Delete Diagnosis */}
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => requestDelete(item)}
                accessibilityRole="button"
                accessibilityLabel={`Delete ${item.disease}`}
              >
                <Text style={styles.deleteIcon}>🗑️</Text>
              </TouchableOpacity>
            </View>
          ))}

          {filteredItems.length === 0 && (
            <Text style={styles.empty}>
              {query
                ? "No matching diagnoses found."
                : "No diagnoses yet. Scan your first leaf."}
            </Text>
          )}
        </ScrollView>
      )}

      {/* New Diagnosis Button */}
      <TouchableOpacity
        style={styles.newButton}
        onPress={() => router.push("/smart-scan")}
      >
        <Text style={styles.newButtonText}>+ New Diagnosis</Text>
      </TouchableOpacity>

      {/* Delete Confirmation Popup */}
      <Modal
        visible={selectedRecord !== null}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!deleting) setSelectedRecord(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalIcon}>🗑️</Text>

            <Text style={styles.modalTitle}>Delete Diagnosis?</Text>

            <Text style={styles.modalMessage}>
              Are you sure you want to delete {selectedRecord?.disease}?
            </Text>

            <Text style={styles.modalWarning}>
              This action cannot be undone. Related expert cases may also be
              deleted.
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                disabled={deleting}
                onPress={() => setSelectedRecord(null)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmButton}
                disabled={deleting}
                onPress={confirmDelete}
              >
                {deleting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.confirmText}>Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F7FAF7",
  },

  header: {
    backgroundColor: "#176B3A",
    padding: 20,
  },

  title: {
    fontSize: 21,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  subtitle: {
    color: "#D2EDDA",
    marginTop: 4,
  },

  search: {
    margin: 17,
    marginBottom: 0,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D7E5D9",
    padding: 13,
    borderRadius: 12,
  },

  list: {
    padding: 17,
    paddingBottom: 95,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#E1EBE4",
    marginBottom: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  recordInfo: {
    flex: 1,
  },

  crop: {
    color: "#164B2F",
    fontWeight: "800",
    fontSize: 16,
  },

  disease: {
    color: "#435D4B",
    marginTop: 4,
  },

  date: {
    color: "#8A988E",
    fontSize: 11,
    marginTop: 9,
  },

  viewButton: {
    backgroundColor: "#E5F5E9",
    padding: 10,
    borderRadius: 9,
  },

  viewText: {
    color: "#176B3A",
    fontWeight: "700",
  },

  deleteButton: {
    backgroundColor: "#FFF0F0",
    borderRadius: 10,
    width: 38,
    height: 38,
    justifyContent: "center",
    alignItems: "center",
  },

  deleteIcon: {
    fontSize: 19,
  },

  empty: {
    textAlign: "center",
    color: "#76877C",
    marginTop: 35,
  },

  error: {
    color: "#A52323",
    marginHorizontal: 18,
    marginTop: 10,
  },

  newButton: {
    position: "absolute",
    bottom: 22,
    left: 20,
    right: 20,
    backgroundColor: "#176B3A",
    padding: 17,
    alignItems: "center",
    borderRadius: 13,
  },

  newButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.48)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  modalBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 350,
    alignItems: "center",
  },

  modalIcon: {
    fontSize: 34,
    marginBottom: 12,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#184D31",
  },

  modalMessage: {
    textAlign: "center",
    color: "#526358",
    marginTop: 12,
    fontSize: 14,
  },

  modalWarning: {
    textAlign: "center",
    color: "#A52323",
    fontSize: 12,
    marginTop: 12,
  },

  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 25,
    width: "100%",
  },

  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#CFDCD2",
    borderRadius: 10,
    padding: 13,
    alignItems: "center",
  },

  cancelText: {
    color: "#176B3A",
    fontWeight: "700",
  },

  confirmButton: {
    flex: 1,
    backgroundColor: "#D64545",
    borderRadius: 10,
    padding: 13,
    alignItems: "center",
  },

  confirmText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
});
