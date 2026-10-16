import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { api, loadProfile } from "../lib/api";

type Lang = "en" | "si";
const words = {
  en: {
    title: "Diagnosis result",
    eyebrow: "PLANT HEALTH ANALYSIS",
    symptoms: "Observed symptoms",
    steps: "Recommended next steps",
    note: "Preliminary AI screening only — not a confirmed diagnosis.",
    unknown: "No calibrated confidence available",
    confidence: "estimated confidence (AI-reported)",
    expert: "Consult an agricultural officer →",
    pending: "Mark as pending",
    resolved: "Mark as resolved",
    records: "View saved records",
    saved: "✓ Result already saved to your history",
    translating: "Translating diagnosis…",
    treatment: "View treatment & prevention →",
  },
  si: {
    title: "රෝග විනිශ්චය ප්‍රතිඵලය",
    eyebrow: "ශාක සෞඛ්‍ය විශ්ලේෂණය",
    symptoms: "නිරීක්ෂණය කළ රෝග ලක්ෂණ",
    steps: "නිර්දේශිත ඉදිරි පියවර",
    note: "මෙය AI මගින් ලබාදුන් මූලික අනුමානයක් පමණි. තහවුරු කළ රෝග විනිශ්චයක් නොවේ.",
    unknown: "තහවුරු කළ විශ්වාසනීය ප්‍රතිශතයක් නොමැත",
    confidence: "AI ඇස්තමේන්තුගත විශ්වාසනීයතාව",
    expert: "කෘෂිකර්ම නිලධාරියෙකුගෙන් විමසන්න →",
    pending: "පරීක්ෂාවට නැවත යොමු කරන්න",
    resolved: "විසඳා ඇත ලෙස සලකුණු කරන්න",
    records: "සුරකින ලද වාර්තා බලන්න",
    saved: "✓ ප්‍රතිඵලය දැනටමත් ඔබේ වාර්තා අතර සුරැකී ඇත",
    translating: "සිංහලට පරිවර්තනය වෙමින්…",
    treatment: "ප්‍රතිකාර සහ වැළැක්වීම බලන්න →",
  },
};
function asArray(v: any): string[] {
  try {
    return Array.isArray(v) ? v : typeof v === "string" ? JSON.parse(v) : [];
  } catch {
    return [];
  }
}
export default function LiveResult() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [record, setRecord] = useState<any>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const [lang, setLang] = useState<Lang>("en"),
    [translated, setTranslated] = useState<any>(null),
    [translating, setTranslating] = useState(false);
  useEffect(() => {
    let active = true;
    Promise.all([api(`/diagnoses/${id}`), loadProfile()])
      .then(([r, p]) => {
        if (!active) return;
        setRecord(r);
        if (p?.preferred_language === "si") setLang("si");
      })
      .catch((e: any) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [id]);
  useEffect(() => {
    if (!record || lang !== "si") return;
    let active = true;
    setTranslating(true);
    api(`/diagnoses/${id}/translate`, {
      method: "POST",
      body: JSON.stringify({ language: "si" }),
    })
      .then((r) => {
        if (active) setTranslated(r);
      })
      .catch((e: any) => {
        if (active) setError("Sinhala translation failed: " + e.message);
      })
      .finally(() => {
        if (active) setTranslating(false);
      });
    return () => {
      active = false;
    };
  }, [id, lang, record?.id]);
  const switchLang = async (next: Lang) => {
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
  const update = async () => {
    setBusy(true);
    try {
      const status = record.status === "resolved" ? "pending" : "resolved";
      await api(`/diagnoses/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setRecord({ ...record, status });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  const w = words[lang];
  const result = lang === "si" && translated ? translated : record;
  return (
    <View style={s.root}>
      <View style={s.bar}>
        <TouchableOpacity onPress={() => router.replace("/home")}>
          <Text style={s.back}>‹</Text>
        </TouchableOpacity>
        <Text style={s.barTitle}>{w.title}</Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TouchableOpacity onPress={() => switchLang("en")}>
            <Text
              style={{
                color: "white",
                fontWeight: lang === "en" ? "900" : "400",
              }}
            >
              EN
            </Text>
          </TouchableOpacity>
          <Text style={{ color: "white" }}>│</Text>
          <TouchableOpacity onPress={() => switchLang("si")}>
            <Text
              style={{
                color: "white",
                fontWeight: lang === "si" ? "900" : "400",
              }}
            >
              සිං
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      {!record ? (
        <View style={s.center}>
          {error ? (
            <Text style={s.error}>{error}</Text>
          ) : (
            <ActivityIndicator color="#176B3A" />
          )}
        </View>
      ) : (
        <ScrollView contentContainerStyle={s.body}>
          <Text style={s.eyebrow}>{w.eyebrow}</Text>
          <View style={s.hero}>
            {record.image_data ? (
              <Image
                source={{ uri: record.image_data }}
                style={{ width: "100%", height: 190, borderRadius: 15 }}
                resizeMode="cover"
              />
            ) : (
              <Text style={{ fontSize: 42 }}>🍃</Text>
            )}
            <Text style={s.crop}>{record.crop}</Text>
            <Text style={s.disease}>{result.disease}</Text>
            <Text style={s.confidence}>
              {record.confidence == null
                ? w.unknown
                : `${Math.round(record.confidence * 100)}% ${w.confidence}`}
            </Text>
            <Text style={s.note}>{w.note}</Text>
          </View>
          {translating && <Text style={s.note}>{w.translating}</Text>}
          <Text style={s.heading}>{w.symptoms}</Text>
          {asArray(result.symptoms).map((v, i) => (
            <Text style={s.item} key={i}>
              • {v}
            </Text>
          ))}
          <Text style={s.heading}>{w.steps}</Text>
          {asArray(result.recommendations).map((v, i) => (
            <Text style={s.item} key={i}>
              {i + 1}. {v}
            </Text>
          ))}
          <TouchableOpacity
            style={s.alt}
            onPress={() =>
              router.push({
                pathname: "/treatment-plan",
                params: { diagnosisId: String(id) },
              })
            }
          >
            <Text style={s.altText}>{w.treatment}</Text>
          </TouchableOpacity>
          <Text style={[s.note, { marginTop: 18 }]}>{w.saved}</Text>
          <TouchableOpacity
            style={s.main}
            onPress={() =>
              router.push({
                pathname: "/submit-case",
                params: { diagnosisId: String(id) },
              })
            }
          >
            <Text style={s.mainText}>{w.expert}</Text>
          </TouchableOpacity>
          <TouchableOpacity disabled={busy} style={s.alt} onPress={update}>
            <Text style={s.altText}>
              {record.status === "resolved" ? w.pending : w.resolved}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/records")}>
            <Text style={s.link}>{w.records}</Text>
          </TouchableOpacity>
          {!!error && <Text style={s.error}>{error}</Text>}
        </ScrollView>
      )}
    </View>
  );
}
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F8FAF7" },
  bar: {
    backgroundColor: "#176B3A",
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  back: { color: "white", fontSize: 30 },
  barTitle: { color: "white", fontSize: 17, fontWeight: "800" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  body: { padding: 20, paddingBottom: 45 },
  eyebrow: {
    color: "#708B79",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.1,
  },
  hero: {
    backgroundColor: "white",
    borderColor: "#E1ECE3",
    borderWidth: 1,
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    marginTop: 15,
  },
  crop: { color: "#617766", marginTop: 7 },
  disease: {
    color: "#1B5534",
    fontWeight: "800",
    fontSize: 25,
    textAlign: "center",
    marginTop: 7,
  },
  confidence: {
    padding: 9,
    backgroundColor: "#FFF4D7",
    borderRadius: 9,
    color: "#8F6D1B",
    overflow: "hidden",
    marginTop: 12,
    fontSize: 12,
    fontWeight: "700",
  },
  note: {
    color: "#6C776C",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 19,
    marginTop: 15,
  },
  heading: {
    fontWeight: "800",
    fontSize: 18,
    color: "#204D32",
    marginTop: 25,
    marginBottom: 12,
  },
  item: {
    backgroundColor: "white",
    padding: 13,
    borderRadius: 11,
    marginBottom: 7,
    color: "#475C4C",
    lineHeight: 21,
  },
  main: {
    marginTop: 25,
    padding: 16,
    backgroundColor: "#176B3A",
    alignItems: "center",
    borderRadius: 13,
  },
  mainText: { color: "white", fontWeight: "800" },
  alt: {
    padding: 15,
    alignItems: "center",
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#C9DCCF",
    borderRadius: 13,
  },
  altText: { color: "#176B3A", fontWeight: "700" },
  link: {
    color: "#176B3A",
    textAlign: "center",
    marginTop: 20,
    fontWeight: "700",
  },
  error: { color: "#BB2525", marginTop: 14 },
});
