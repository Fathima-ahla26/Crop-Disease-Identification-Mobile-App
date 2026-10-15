export type DiseaseData = {
  id: string;
  cropName: { en: string; si: string };
  diseaseName: { en: string; si: string };
  confidence: string;
  imageUri: string;
  symptoms: { en: string[]; si: string[] };
  treatments: { en: string[]; si: string[] };
  organic: { en: string; si: string };
  chemical: { en: string; si: string };
};

export const CROP_DISEASES: Record<string, DiseaseData> = {
  tomato: {
    id: "tomato",
    cropName: { en: "Tomato", si: "තක්කාලි" },
    diseaseName: { en: "Early Blight (Alternaria solani)", si: "මුල් අංගමාරය" },
    confidence: "89%",
    imageUri:
      "https://images.unsplash.com/photo-1592417817098-8f3d6910985b?w=600&auto=format&fit=crop&q=80",
    symptoms: {
      en: [
        "Brown patches with concentric rings on leaves",
        "Yellowing of tissue around the spots",
        "Lower and older leaves infected first",
      ],
      si: [
        "කොළ මත කේන්ද්‍රීය වළලු සහිත දුඹුරු පැහැති ලප",
        "ලප අවට පත්‍ර පටක කහ පැහැයට හැරීම",
        "පළමුව ශාකයේ පහළ සහ පැරණි කොළ වලට බලපෑම් ඇතිවීම",
      ],
    },
    treatments: {
      en: [
        "Prune and destroy heavily infected lower leaves.",
        "Avoid overhead watering; irrigate near root base.",
        "Ensure proper airflow and spacing between plants.",
      ],
      si: [
        "දැඩි ලෙස ආසාදිත කොළ කපා වහාම විනාශ කරන්න.",
        "කොළ මතට ජලය ඉසීම නවතා මුලට පමණක් ජලය යොදන්න.",
        "පැළ අතර හොඳ වාතාශ්‍රයක් පවත්වා ගන්න.",
      ],
    },
    organic: {
      en: "Apply Neem oil (3-5 ml/L) or baking soda spray weekly.",
      si: "කොහොඹ තෙල් ද්‍රාවණය හෝ බේකින් සෝඩා මිශ්‍රණය සතියකට වරක් ඉසින්න.",
    },
    chemical: {
      en: "Foliar spray of Mancozeb or Chlorothalonil every 7-10 days.",
      si: "මැන්කොසෙබ් (Mancozeb) හෝ ක්ලෝරෝතැලොනිල් දින 7-10 කට වරක් යොදන්න.",
    },
  },
  rice: {
    id: "rice",
    cropName: { en: "Paddy / Rice", si: "ගොයම්" },
    diseaseName: {
      en: "Rice Leaf Blast (Magnaporthe oryzae)",
      si: "කොළ පාළුව",
    },
    confidence: "94%",
    imageUri:
      "https://images.unsplash.com/photo-1536657464919-892534f60d6e?w=600&auto=format&fit=crop&q=80",
    symptoms: {
      en: [
        "Spindle-shaped lesions with gray-white centers",
        "Brown-to-red margins on leaf blades",
        "Rapid drying and death of leaves in severe attacks",
      ],
      si: [
        "මැද අළු-සුදු පැහැති දඟර හැඩැති ලප හටගැනීම",
        "කොළ දාර දුඹුරු-රතු පැහැයට හැරීම",
        "දැඩි අවස්ථාවලදී ගොයම් කොළ වියළී මැරී යාම",
      ],
    },
    treatments: {
      en: [
        "Maintain balanced nitrogen fertilizer; do not overuse urea.",
        "Regulate water levels in the paddy field.",
        "Destroy infected straw before replanting.",
      ],
      si: [
        "නයිට්‍රජන් පොහොර (යූරියා) අධිකව යෙදීමෙන් වළකින්න.",
        "කුඹුරේ ජල මට්ටම මනාව පාලනය කරන්න.",
        "කලින් කන්නයේ ආසාදිත පිදුරු විනාශ කරන්න.",
      ],
    },
    organic: {
      en: "Bio-control using Trichoderma harzianum soil treatment.",
      si: "ට්‍රයිකොඩර්මා (Trichoderma) මිශ්‍රිත කාබනික ජීව පාලන ක්‍රම යොදන්න.",
    },
    chemical: {
      en: "Apply Tricyclazole 75% WP at recommended dosage.",
      si: "ට්‍රයිසයික්ලසෝල් (Tricyclazole) දිලීර නාශකය නියමිත මාත්‍රාවට යොදන්න.",
    },
  },
};
