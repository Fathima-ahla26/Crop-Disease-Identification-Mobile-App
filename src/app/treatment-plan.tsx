import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { api, loadProfile } from "../lib/api";

type Lang = "en" | "si";
const copy = {
  en: {
    title: "Treatment & Prevention",
    subtitle: "Care guidance for your plant",
    disclaimer:
      "AI screening is preliminary. The disease and treatment must be verified by an agricultural officer before using pesticides.",
    immediate: "Immediate Actions",
    organic: "Organic Solutions",
    chemical: "Chemical Solutions",
    prevention: "Prevention Tips",
    nextSteps: "AI-recommended next steps",
    organicAdvice: [
      "Remove heavily affected leaves using clean tools when appropriate.",
      "Ask an agricultural officer which biological or non-chemical options suit this crop and disease.",
    ],
    chemicalAdvice: [
      "Do not apply a pesticide based only on an AI image result.",
      "Ask a licensed agricultural adviser for locally registered crop-specific products, dosage, precautions and harvest intervals. Follow the product label.",
    ],
    preventionAdvice: [
      "Keep tools clean and monitor nearby plants for similar symptoms.",
      "Improve spacing and airflow where suitable for this crop.",
      "Avoid unnecessary wetting of foliage; dispose of severely infected plant material safely.",
    ],
    generic:
      "No disease-specific care steps were returned. Seek an agricultural officer’s advice.",
    expert: "Consult agricultural officer →",
    back: "Back to diagnosis",
    translating: "Loading Sinhala guidance…",
  },
  si: {
    title: "ප්‍රතිකාර සහ වැළැක්වීම",
    subtitle: "ඔබේ ශාකය සඳහා රැකවරණ උපදෙස්",
    disclaimer:
      "AI ප්‍රතිඵලය මූලික අනුමානයකි. පළිබෝධනාශක භාවිතයට පෙර රෝගය සහ ප්‍රතිකාරය කෘෂිකර්ම නිලධාරියෙකුගෙන් තහවුරු කරගන්න.",
    immediate: "හදිසි පියවර",
    organic: "කාබනික විසඳුම්",
    chemical: "රසායනික විසඳුම්",
    prevention: "වැළැක්වීමේ උපදෙස්",
    nextSteps: "AI නිර්දේශිත ඉදිරි පියවර",
    organicAdvice: [
      "සුදුසු අවස්ථාවල පිරිසිදු මෙවලම් භාවිත කර දැඩි ලෙස හානි වූ කොළ ඉවත් කරන්න.",
      "මෙම බෝගයට සහ රෝගයට සුදුසු ජෛව හෝ රසායනික නොවන ක්‍රම පිළිබඳ කෘෂිකර්ම නිලධාරියෙකුගෙන් විමසන්න.",
    ],
    chemicalAdvice: [
      "AI ඡායාරූප ප්‍රතිඵලයක් මත පමණක් පළිබෝධනාශක යොදන්න එපා.",
      "මෙම බෝගයට අනුමත නිෂ්පාදන, මාත්‍රා, ආරක්ෂක පියවර සහ අස්වැන්න නෙළීමට පෙර කාලය ගැන බලයලත් කෘෂිකර්ම උපදේශකයෙකුගෙන් විමසන්න. ලේබලය අනුගමනය කරන්න.",
    ],
    preventionAdvice: [
      "මෙවලම් පිරිසිදුව තබා අසල ශාකවල ද මෙවැනි ලක්ෂණ තිබේද බලන්න.",
      "බෝගයට සුදුසු පරිදි ශාක අතර ඉඩ සහ වාතාශ්‍රය වැඩි දියුණු කරන්න.",
      "කොළ අනවශ්‍ය ලෙස තෙමීම අවම කර දැඩි ලෙස රෝගී කොටස් ආරක්ෂිතව ඉවත් කරන්න.",
    ],
    generic:
      "මෙම රෝගයට විශේෂ උපදෙස් නොලැබුණි. කෘෂිකර්ම නිලධාරියෙකුගෙන් විමසන්න.",
    expert: "කෘෂිකර්ම නිලධාරියෙකුගෙන් විමසන්න →",
    back: "රෝග විනිශ්චයට ආපසු",
    translating: "සිංහල උපදෙස් ලබාගනිමින්…",
  },
};
function list(v: unknown): string[] {
  if (Array.isArray(v))
    return v.filter((x): x is string => typeof x === "string");
  if (typeof v === "string") {
    try {
      const parsed = JSON.parse(v);
      return list(parsed);
    } catch {
      return [];
    }
  }
  return [];
}
export default function TreatmentPlan() {
  const router = useRouter();
  const { diagnosisId } = useLocalSearchParams<{ diagnosisId?: string }>();
  const [lang, setLang] = useState<Lang>("en");
  const [record, setRecord] = useState<any>();
  const [translation, setTranslation] = useState<any>();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [translating, setTranslating] = useState(false);
  useEffect(() => {
    let active = true;
    Promise.all([
      loadProfile(),
      diagnosisId ? api(`/diagnoses/${diagnosisId}`) : Promise.resolve(null),
    ])
      .then(([profile, diagnosis]) => {
        if (!active) return;
        setLang(profile?.preferred_language === "si" ? "si" : "en");
        setRecord(diagnosis);
      })
      .catch((e: Error) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [diagnosisId]);
  useEffect(() => {
    if (!diagnosisId || !record || lang !== "si" || translation) return;
    let active = true;
    setTranslating(true);
    api(`/diagnoses/${diagnosisId}/translate`, {
      method: "POST",
      body: JSON.stringify({ language: "si" }),
    })
      .then((res) => {
        if (active) setTranslation(res);
      })
      .catch((e: Error) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setTranslating(false);
      });
    return () => {
      active = false;
    };
  }, [diagnosisId, record?.id, lang, translation]);
  const changeLang = async (next: Lang) => {
    if (next === lang) return;
    try {
      await api("/me/language", {
        method: "PATCH",
        body: JSON.stringify({ language: next }),
      });
      setLang(next);
      setError("");
    } catch (e: any) {
      setError(e.message);
    }
  };
  const w = copy[lang];
  const steps = list(
    lang === "si" && translation
      ? translation.recommendations
      : record?.recommendations,
  );
  const diagnosisText =
    (lang === "si" && translation?.disease) || record?.disease;
  function section(title: string, entries: string[]) {
    return (
      <View style={s.card}>
        <Text style={s.heading}>{title}</Text>
        {entries.map((entry, index) => (
          <Text style={s.item} key={index}>
            • {entry}
          </Text>
        ))}
      </View>
    );
  }
  return (
    <View style={s.root}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={s.headerText}>‹</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>{w.title}</Text>
        <View style={s.switch}>
          <TouchableOpacity onPress={() => changeLang("en")}>
            <Text style={[s.switchText, lang === "en" && s.active]}>EN</Text>
          </TouchableOpacity>
          <Text style={s.switchText}>│</Text>
          <TouchableOpacity onPress={() => changeLang("si")}>
            <Text style={[s.switchText, lang === "si" && s.active]}>සිං</Text>
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView contentContainerStyle={s.body}>
        <Text style={s.subtitle}>{w.subtitle}</Text>
        {!!diagnosisText && <Text style={s.disease}>{diagnosisText}</Text>}
        <Text style={s.warning}>{w.disclaimer}</Text>
        {loading && <ActivityIndicator color="#176B3A" />}
        {translating && <Text style={s.muted}>{w.translating}</Text>}
        {!!error && <Text style={s.error}>{error}</Text>}
        {section(w.immediate, steps.length ? steps : [w.generic])}
        {section(w.organic, w.organicAdvice)}
        {section(w.chemical, w.chemicalAdvice)}
        {section(w.prevention, w.preventionAdvice)}
        {!!diagnosisId && (
          <TouchableOpacity
            style={s.primary}
            onPress={() =>
              router.push({ pathname: "/submit-case", params: { diagnosisId } })
            }
          >
            <Text style={s.primaryText}>{w.expert}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={s.secondary} onPress={() => router.back()}>
          <Text style={s.secondaryText}>{w.back}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F8FAF7" },
  header: {
    backgroundColor: "#176B3A",
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerText: { color: "white", fontSize: 28 },
  headerTitle: {
    color: "white",
    fontSize: 15,
    fontWeight: "800",
    flexShrink: 1,
  },
  switch: { flexDirection: "row", gap: 5, alignItems: "center" },
  switchText: { color: "white", fontSize: 12 },
  active: { fontWeight: "900", textDecorationLine: "underline" },
  body: { padding: 18, paddingBottom: 48 },
  subtitle: { color: "#486653", fontSize: 15 },
  disease: { fontWeight: "800", fontSize: 22, color: "#176B3A", marginTop: 10 },
  warning: {
    backgroundColor: "#FFF3DC",
    color: "#7E5D1D",
    padding: 13,
    borderRadius: 12,
    marginVertical: 16,
    lineHeight: 21,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginTop: 13,
    borderWidth: 1,
    borderColor: "#E1ECE3",
  },
  heading: {
    fontWeight: "800",
    fontSize: 17,
    color: "#1F5837",
    marginBottom: 9,
  },
  item: { color: "#405647", lineHeight: 22, marginTop: 8 },
  muted: { color: "#617766", marginVertical: 9 },
  error: { color: "#B3261E", marginVertical: 8 },
  primary: {
    backgroundColor: "#176B3A",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 23,
  },
  primaryText: { color: "white", fontWeight: "800" },
  secondary: {
    borderColor: "#BAD6C2",
    borderWidth: 1,
    padding: 14,
    alignItems: "center",
    borderRadius: 12,
    marginTop: 10,
  },
  secondaryText: { color: "#176B3A", fontWeight: "700" },
});
