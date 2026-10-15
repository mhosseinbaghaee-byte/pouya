/**
 * اطلس جغرافیای فارسی پویا
 * تصاویر در public/atlas/
 */

export type GeoAtlasMap = {
  id: string;
  title: string;
  keywords: string[];
  caption: string;
  imageUrl: string;
};

export const GEO_ATLAS_MAPS: GeoAtlasMap[] = [
  {
    id: "world-political",
    title: "نقشه سیاسی جهان",
    keywords: [
      "نقشه جهان", "نقشه سیاسی جهان", "قاره", "اقیانوس", "کره زمین",
      "world map", "نقشه کره زمین", "نقشه دنیا",
    ],
    caption: "نقشه سیاسی جهان — قاره‌ها، کشورها و اقیانوس‌ها.",
    imageUrl: "/atlas/world-political.jpg",
  },
  {
    id: "asia-political",
    title: "آسیا (سیاسی)",
    keywords: ["آسیا", "نقشه آسیا", "قاره آسیا", "آسیای سیاسی"],
    caption: "نقشه سیاسی قاره آسیا.",
    imageUrl: "/atlas/asia-political.jpg",
  },
  {
    id: "middle-east",
    title: "خاورمیانه",
    keywords: [
      "خاورمیانه", "خاور میانه", "نقشه خاورمیانه", "خلیج فارس",
      "عربستان", "عراق", "افغانستان", "پاکستان",
    ],
    caption: "نقشه خاورمیانه و کشورهای همسایه.",
    imageUrl: "/atlas/middle-east.jpg",
  },
  {
    id: "iran-political",
    title: "ایران — سیاسی (استان‌ها)",
    keywords: [
      "نقشه ایران", "ایران سیاسی", "استانهای ایران", "استان‌های ایران",
      "نقشه استان", "استان ایران", "همسایه های ایران", "همسایه‌های ایران",
      "مرز ایران", "جمهوری اسلامی ایران",
    ],
    caption: "نقشه سیاسی ایران با استان‌ها و همسایگان.",
    imageUrl: "/atlas/iran-political.jpg",
  },
  {
    id: "iran-physical",
    title: "ایران — طبیعی",
    keywords: [
      "ایران طبیعی", "نقشه طبیعی ایران", "کوههای ایران", "کوه‌های ایران",
      "البرز", "زاگرس", "دشت کویر", "دشت لوت", "دریای خزر",
    ],
    caption: "نقشه طبیعی ایران — کوه، دشت و پستی‌وبلندی.",
    imageUrl: "/atlas/iran-physical.jpg",
  },
  {
    id: "europe",
    title: "اروپا",
    keywords: ["اروپا", "نقشه اروپا", "قاره اروپا", "کشورهای اروپا"],
    caption: "نقشه سیاسی اروپا.",
    imageUrl: "/atlas/europe.jpg",
  },
  {
    id: "africa",
    title: "آفریقا",
    keywords: ["آفریقا", "نقشه آفریقا", "قاره آفریقا"],
    caption: "نقشه سیاسی آفریقا.",
    imageUrl: "/atlas/africa.jpg",
  },
  {
    id: "americas",
    title: "آمریکای شمالی و جنوبی",
    keywords: [
      "آمریکای جنوبی", "آمریکای شمالی", "نقشه آمریکا", "قاره آمریکا",
      "برزیل", "آرژانتین", "کانادا",
    ],
    caption: "نقشه آمریکای شمالی و جنوبی.",
    imageUrl: "/atlas/americas.jpg",
  },
  {
    id: "north-america",
    title: "آمریکای شمالی",
    keywords: [
      "آمریکای شمالی", "ایالات متحده", "نقشه آمریکا شمالی", "نقشه کانادا", "مکزیک",
    ],
    caption: "نقشه آمریکای شمالی.",
    imageUrl: "/atlas/north-america.jpg",
  },
  {
    id: "south-america",
    title: "آمریکای جنوبی",
    keywords: ["آمریکای جنوبی", "نقشه آمریکای جنوبی"],
    caption: "نقشه آمریکای جنوبی.",
    imageUrl: "/atlas/south-america.jpg",
  },
  {
    id: "oceania",
    title: "استرالیا و اقیانوسیه",
    keywords: [
      "استرالیا", "اقیانوسیه", "نقشه استرالیا", "نیوزیلند", "اقیانوس آرام",
    ],
    caption: "استرالیا، نیوزیلند و جزایر اقیانوسیه.",
    imageUrl: "/atlas/oceania.jpg",
  },
  {
    id: "arctic",
    title: "قطب شمال",
    keywords: [
      "قطب شمال", "اقیانوس منجمد شمالی", "نقشه قطب شمال", "گرینلند",
    ],
    caption: "اقیانوس منجمد شمالی و مناطق قطبی شمال.",
    imageUrl: "/atlas/arctic.jpg",
  },
  {
    id: "antarctica",
    title: "قطب جنوب",
    keywords: [
      "قطب جنوب", "قطب جنوبی", "آنتارکتیکا", "نقشه قطب جنوب",
      "اقیانوس منجمد جنوبی",
    ],
    caption: "قاره قطب جنوب (آنتارکتیکا).",
    imageUrl: "/atlas/antarctica.jpg",
  },
];

function norm(s: string) {
  return s
    .toLowerCase()
    .replace(/\u200c/g, "")
    .replace(/[ي]/g, "ی")
    .replace(/[ك]/g, "ک")
    .replace(/\s+/g, " ")
    .trim();
}

/** تطبیق سؤال با نقشه اطلس */
export function matchGeoAtlas(text: string): GeoAtlasMap | null {
  const t = norm(text);
  if (t.length < 2) return null;
  let best: GeoAtlasMap | null = null;
  let score = 0;
  for (const m of GEO_ATLAS_MAPS) {
    let hits = 0;
    for (const k of m.keywords) {
      const key = norm(k);
      if (!key || key.length < 2) continue;
      const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re = new RegExp(`(^|[^\\p{L}\\p{N}])${escaped}([^\\p{L}\\p{N}]|$)`, "u");
      if (re.test(t)) {
        hits += key.length >= 6 ? 4 : key.length >= 4 ? 3 : 2;
      }
    }
    if (hits > score) {
      score = hits;
      best = m;
    }
  }
  return score >= 2 ? best : null;
}

export function geoAtlasMarkdown(map: GeoAtlasMap): string {
  return `![${map.title}](${map.imageUrl})\n*${map.caption}*`;
}
