import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function DiagnosisResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [lang, setLang] = useState<"en" | "si">("en");
  const [isSaved, setIsSaved] = useState(false);

  const cropParam = Array.isArray(params.crop)
    ? params.crop[0]
    : (params.crop as string) || "tomato";

  const diagnosisDatabase: Record<string, any> = {
    tomato: {
      cropName: "Tomato",
      badgeTitle: "Analyzed Tomato Leaf",
      visualEmoji: "🍅",
      leafEmoji: "🍃",
      themeBg: "#FEF2F2",
      themeBorder: "#FCA5A5",
      accentColor: "#DC2626",
      confidenceValue: "92%",
      en: {
        disease: "Tomato Early Blight",
        pathogen: "Alternaria solani",
        confidence: "Confidence: 92%",
        symptoms: [
          "Brown spots with concentric target rings",
          "Yellow halo around affected leaf areas",
          "Starts from bottom older leaves first",
        ],
        steps: [
          "1. Keep affected plants apart.",
          "2. Avoid wetting leaves; improve airflow.",
          "3. Apply organic neem spray or Mancozeb fungicide.",
        ],
      },
      si: {
        disease: "තක්කාලි මුල් අංගමාරය",
        pathogen: "Alternaria solani",
        confidence: "විශ්වාස මට්ටම: 92%",
        symptoms: [
          "පත්‍ර මත දුඹුරු පැහැති වළලු ලප හටගැනීම",
          "හානි වූ ස්ථාන වටා කහ පැහැති පැල්ලම්",
          "පැරණි පත්‍රවලින් රෝගය ආරම්භ වීම",
        ],
        steps: [
          "1. ආසාදිත පැළ වෙන් කර තබන්න.",
          "2. පත්‍ර තෙත් වීම වළක්වා වාතාශ්‍රය දෙන්න.",
          "3. කොහොඹ තෙල් හෝ මැන්කොසෙබ් යොදන්න.",
        ],
      },
    },
    paddy: {
      cropName: "Rice",
      badgeTitle: "Analyzed Paddy Leaf",
      visualEmoji: "🌾",
      leafEmoji: "🌿",
      themeBg: "#F0FDF4",
      themeBorder: "#86EFAC",
      accentColor: "#15803D",
      confidenceValue: "89%",
      en: {
        disease: "Rice Blast Disease",
        pathogen: "Magnaporthe oryzae",
        confidence: "Confidence: 89%",
        symptoms: [
          "Spindle-shaped lesions with brown borders",
          "Greyish-white center on leaf lesions",
          "Rapid spread in damp weather",
        ],
        steps: [
          "1. Drain excessive standing water temporarily.",
          "2. Avoid excess nitrogen fertilizer.",
          "3. Apply Tricyclazole fungicide.",
        ],
      },
      si: {
        disease: "ගොයම් කොළ පාළුව (Rice Blast)",
        pathogen: "Magnaporthe oryzae",
        confidence: "විශ්වාස මට්ටම: 89%",
        symptoms: [
          "කොළ මත මැද අළු පැහැති ඉලිප්සාකාර ලප",
          "ලප වටා තද දුඹුරු දාරයක් ඇතිවීම",
          "තෙතමනය සහිත කාලගුණයකදී පැතිරීම",
        ],
        steps: [
          "1. අතිරික්ත ජලය ඉවත් කරන්න.",
          "2. යූරියා පොහොර යෙදීම සීමා කරන්න.",
          "3. ට්‍රයිසයික්ලසෝල් දිලීර නාශක යොදන්න.",
        ],
      },
    },
    chilli: {
      cropName: "Chilli",
      badgeTitle: "Analyzed Chilli Leaf",
      visualEmoji: "🌶️",
      leafEmoji: "🌱",
      themeBg: "#FFFBEB",
      themeBorder: "#FDE68A",
      accentColor: "#D97706",
      confidenceValue: "94%",
      en: {
        disease: "Chilli Leaf Curl Virus",
        pathogen: "Begomovirus (Whitefly vector)",
        confidence: "Confidence: 94%",
        symptoms: [
          "Upward curling and puckering of leaves",
          "Stunted plant growth and reduced yield",
          "Yellowing along leaf veins",
        ],
        steps: [
          "1. Control whitefly vectors using yellow sticky traps.",
          "2. Remove and destroy severely infected plants.",
          "3. Apply approved organic insecticides (Neem extract).",
        ],
      },
      si: {
        disease: "මිරිස් පත්‍ර කොළ කුඩා වීමේ වෛරසය",
        pathogen: "Begomovirus (සුදු මැස්සා මඟින්)",
        confidence: "විශ්වාස මට්ටම: 94%",
        symptoms: [
          "කොළ ඉස්මතු වී උඩට ඇඹරීම",
          "පැළයේ වර්ධනය අඩාල වීම හා අස්වැන්න අඩුවීම",
          "නහර දිගේ කහ පැහැ වීම",
        ],
        steps: [
          "1. කහ පැහැති ඇස්බැන්දුම් මඟින් කෘමීන් පාලනය කරන්න.",
          "2. දැඩි ලෙස රෝගී වූ පැළ ඉවත් කර පුළුස්සා දමන්න.",
          "3. කොහොඹ සාරය හෝ කෘමිනාශක යොදන්න.",
        ],
      },
    },
    brinjal: {
      cropName: "Brinjal",
      badgeTitle: "Analyzed Brinjal Leaf",
      visualEmoji: "🍆",
      leafEmoji: "☘️",
      themeBg: "#F5F3FF",
      themeBorder: "#DDD6FE",
      accentColor: "#7C3AED",
      confidenceValue: "90%",
      en: {
        disease: "Brinjal Phomopsis Blight",
        pathogen: "Phomopsis vexans",
        confidence: "Confidence: 90%",
        symptoms: [
          "Circular brown spots with light centers on leaves",
          "Stem lesions causing plant lodging",
          "Fruit rot with sunken black pycnidia",
        ],
        steps: [
          "1. Use certified disease-free seeds.",
          "2. Practice 3-year crop rotation.",
          "3. Spray copper-based fungicides if required.",
        ],
      },
      si: {
        disease: "වම්බටු ෆෝමොප්සිස් අංගමාරය",
        pathogen: "Phomopsis vexans",
        confidence: "විශ්වාස මට්ටම: 90%",
        symptoms: [
          "මැද ලා පැහැති රවුම් දුඹුරු ලප කොළ මත ඇතිවීම",
          "කාඳ කුණුවී පැළය නැමී යාම",
          "ගෙඩි කුණුවී කළු ලප ඇතිවීම",
        ],
        steps: [
          "1. රෝගවලින් තොර සහතික කළ බීජ භාවිත කරන්න.",
          "2. බෝග මාරු ක්‍රමය අනුගමනය කරන්න.",
          "3. තඹ අඩංගු දිලීර නාශකයක් ඉසින්න.",
        ],
      },
    },
  };

  const crop = diagnosisDatabase[cropParam] || diagnosisDatabase["tomato"];
  const t = crop[lang];

  // CREATE: Sev am na AsyncStorage dɔn naviget fayn
  const handleSaveDiagnosis = async () => {
    try {
      const existingData = await AsyncStorage.getItem("@cropcare_diagnoses");
      const diagnosesList = existingData ? JSON.parse(existingData) : [];

      const newRecord = {
        id: Date.now().toString(),
        crop: crop.cropName,
        disease: crop.en.disease,
        date: new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        status: "pending",
        icon: crop.visualEmoji,
      };

      const updatedList = [newRecord, ...diagnosesList];
      await AsyncStorage.setItem(
        "@cropcare_diagnoses",
        JSON.stringify(updatedList),
      );

      setIsSaved(true);
      setTimeout(() => {
        router.push("/saved-diagnoses" as any);
      }, 700);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.replace("/scan")}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.backText}>❮</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>
            {lang === "en" ? "Plant health" : "ශාක සෞඛ්‍යය"}
          </Text>
          <Text style={styles.headerSub}>
            {lang === "en" ? "Farmer" : "ගොවි මහතා"}
          </Text>
        </View>
        <View style={styles.langToggle}>
          <TouchableOpacity
            style={[styles.langBtn, lang === "si" && styles.langBtnActive]}
            onPress={() => setLang("si")}
          >
            <Text
              style={[styles.langText, lang === "si" && styles.langTextActive]}
            >
              Sinhala
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.langBtn, lang === "en" && styles.langBtnActive]}
            onPress={() => setLang("en")}
          >
            <Text
              style={[styles.langText, lang === "en" && styles.langTextActive]}
            >
              English
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollBody}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.mainTitle}>
          {lang === "en" ? "Diagnosis result" : "රෝග විනිශ්චය"}
        </Text>

        <View
          style={[
            styles.visualBox,
            { backgroundColor: crop.themeBg, borderColor: crop.themeBorder },
          ]}
        >
          <View style={styles.visualRow}>
            <Text style={styles.iconCrop}>{crop.visualEmoji}</Text>
            <Text style={styles.iconLeaf}>{crop.leafEmoji}</Text>
          </View>
          <View style={styles.badgePill}>
            <Text style={styles.badgePillText}>{crop.badgeTitle}</Text>
          </View>
        </View>

        <View style={styles.diseaseCard}>
          <Text style={[styles.diseaseName, { color: crop.accentColor }]}>
            {t.disease}
          </Text>
          <Text style={styles.pathogenName}>{t.pathogen}</Text>
          <View style={styles.confBarContainer}>
            <View
              style={[
                styles.confBar,
                {
                  width: crop.confidenceValue,
                  backgroundColor: crop.accentColor,
                },
              ]}
            />
          </View>
          <Text style={[styles.confText, { color: crop.accentColor }]}>
            {t.confidence}
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.cardHeader}>
            {lang === "en" ? "Common Symptoms" : "ප්‍රධාන රෝග ලක්ෂණ"}
          </Text>
          {t.symptoms.map((item: string, idx: number) => (
            <Text key={idx} style={styles.bulletItem}>
              • {item}
            </Text>
          ))}
        </View>

        <View style={styles.recCard}>
          <Text style={styles.cardHeader}>
            {lang === "en"
              ? "Recommended Treatment Steps"
              : "ප්‍රතිකාර සඳහා උපදෙස්"}
          </Text>
          {t.steps.map((st: string, idx: number) => (
            <Text key={idx} style={styles.stepItem}>
              {st}
            </Text>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.planBtn}
          onPress={() => router.push("/treatment-plan" as any)}
          activeOpacity={0.88}
        >
          <Text style={styles.planBtnText}>
            {lang === "en"
              ? "View Full Treatment Plan"
              : "සම්පූර්ණ ප්‍රතිකාර සැලැස්ම"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.saveBtn, isSaved && styles.saveBtnSuccess]}
          onPress={handleSaveDiagnosis}
          activeOpacity={0.88}
        >
          <Text style={styles.saveBtnText}>
            {isSaved ? "✓ Saved!" : lang === "en" ? "Save Result" : "සුරකින්න"}
          </Text>
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
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  backBtn: { padding: 6 },
  backText: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
  headerTitleContainer: { flex: 1, marginLeft: 10 },
  headerTitle: { fontSize: 15, fontWeight: "800", color: "#FFF" },
  headerSub: { fontSize: 10, color: "#D1E7DD" },
  langToggle: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 8,
    padding: 2,
  },
  langBtn: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  langBtnActive: { backgroundColor: "#FFF" },
  langText: { fontSize: 10, color: "#D1E7DD", fontWeight: "600" },
  langTextActive: { color: "#176B3A", fontWeight: "700" },
  scrollBody: { padding: 16, paddingBottom: 24 },
  mainTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 12,
  },
  visualBox: {
    height: 150,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    position: "relative",
  },
  visualRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  iconCrop: { fontSize: 48 },
  iconLeaf: { fontSize: 48 },
  badgePill: {
    position: "absolute",
    bottom: 10,
    backgroundColor: "#176B3A",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgePillText: { color: "#FFF", fontSize: 11, fontWeight: "700" },
  diseaseCard: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
  },
  diseaseName: { fontSize: 18, fontWeight: "800" },
  pathogenName: {
    fontSize: 12,
    fontStyle: "italic",
    color: "#6B7280",
    marginBottom: 8,
  },
  confBarContainer: {
    height: 7,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 6,
  },
  confBar: { height: "100%" },
  confText: { fontSize: 11, fontWeight: "700" },
  infoCard: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
  },
  recCard: {
    backgroundColor: "#FFFBEB",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#FDE68A",
    marginBottom: 12,
  },
  cardHeader: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
  },
  bulletItem: {
    fontSize: 12,
    color: "#4B5563",
    lineHeight: 18,
    marginBottom: 4,
  },
  stepItem: { fontSize: 12, color: "#92400E", lineHeight: 18, marginBottom: 4 },
  footer: {
    padding: 14,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    flexDirection: "row",
    gap: 8,
  },
  planBtn: {
    flex: 1,
    backgroundColor: "#176B3A",
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  planBtnText: { color: "#FFF", fontSize: 12, fontWeight: "700" },
  saveBtn: {
    paddingHorizontal: 16,
    backgroundColor: "#176B3A",
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnSuccess: { backgroundColor: "#059669" },
  saveBtnText: { color: "#FFF", fontSize: 12, fontWeight: "700" },
});
