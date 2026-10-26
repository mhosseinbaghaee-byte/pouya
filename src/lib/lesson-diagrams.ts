/**
 * بانک شکل‌های آموزشی پویا
 * اولویت: اطلس محلی جغرافیا → تصویر ویکی‌مدیا → SVG داخلی
 */

import { GEO_ATLAS_MAPS, matchGeoAtlas, type GeoAtlasMap } from "./geo-atlas";

export type LessonDiagram = {
  id: string;
  title: string;
  subject: string;
  grades: string;
  keywords: string[];
  caption: string;
  imageUrl?: string;
  imageGallery?: { url: string; label: string }[];
  attribution?: string;
};

const WM = (file: string, width = 700) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${file}?width=${width}`;

function fromGeoAtlas(m: GeoAtlasMap): LessonDiagram {
  const gallery =
    m.gallery && m.gallery.length > 1
      ? m.gallery.map((url, i) => ({ url, label: `${m.title} (${i + 1})` }))
      : undefined;
  return {
    id: `atlas-${m.id}`,
    title: m.title,
    subject: "جغرافیا",
    grades: "چهارم تا دوازدهم",
    keywords: m.keywords,
    caption: m.caption,
    imageUrl: m.imageUrl,
    imageGallery: gallery,
    attribution: "اطلس جغرافیای فارسی — بانک پویا",
  };
}

export const LESSON_DIAGRAMS: LessonDiagram[] = [
  {
    id: "neuron",
    title: "ساختار نورون",
    subject: "زیست‌شناسی",
    grades: "یازدهم",
    keywords: ["نورون", "neuron", "دندریت", "آکسون", "یاخته عصبی", "سلول عصبی"],
    caption: "دندریت پیام را می‌گیرد → جسم یاخته‌ای → آکسون پیام را می‌فرستد.",
    imageUrl: WM("Neuron_Hand-tuned.svg", 640),
    attribution: "ویکی‌مدیا کامنز — طرح نورون",
  },
  {
    id: "earth_map",
    title: "نقشه کره زمین",
    subject: "جغرافیا",
    grades: "چهارم تا نهم",
    keywords: [
      "نقشه جهان", "نقشه زمین", "نقشه کره", "نقشه کره زمین", "کره زمین",
      "world map", "نقشه دنیا", "نقشه کل جهان",
    ],
    caption: "نقشه جهان برای شناخت قاره‌ها و اقیانوس‌ها.",
    imageUrl: "/atlas/world-political.jpg",
    attribution: "اطلس جغرافیای فارسی — بانک پویا",
  },
  {
    id: "photosynthesis",
    title: "فتوسنتز",
    subject: "علوم / زیست",
    grades: "ششم تا دهم",
    keywords: ["فتوسنتز", "کلروفیل", "غذاسازی گیاه", "photosynthesis"],
    caption: "نور + آب + CO₂ → قند + اکسیژن (در کلروپلاست).",
    imageUrl: WM("Photosynthesis_equation.svg", 700),
    attribution: "ویکی‌مدیا کامنز — معادله فتوسنتز",
  },
  {
    id: "heart",
    title: "قلب انسان (چهار حفره)",
    subject: "زیست‌شناسی",
    grades: "هشتم / دهم",
    keywords: ["قلب", "شکل قلب", "ساختار قلب", "دهلیز", "بطن", "گردش خون", "قلب انسان", "heart"],
    caption: "دو دهلیز بالا و دو بطن پایین؛ خون را در بدن به گردش درمی‌آورد.",
    imageUrl: WM("Heart_diagram_blood_flow_en.svg", 900),
    attribution: "ویکی‌مدیا کامنز — نمودار قلب و جریان خون",
  },
  {
    id: "water_cycle",
    title: "چرخه آب",
    subject: "علوم",
    grades: "چهارم تا هفتم",
    keywords: ["چرخه آب", "تبخیر", "بارش", "میعان"],
    caption: "تبخیر → میعان → بارش → جریان روی زمین.",
    imageUrl: WM("Water_cycle.svg", 700),
    attribution: "ویکی‌مدیا کامنز — چرخه آب",
  },
  {
    id: "periodic_table",
    title: "جدول تناوبی (مندلیف)",
    subject: "شیمی",
    grades: "هشتم تا دوازدهم",
    keywords: ["جدول مندلیف", "جدول تناوبی", "جدول تناوبی عناصر", "جدول عناصر", "periodic table", "مندلیف"],
    caption: "عناصر بر اساس عدد اتمی در دوره‌ها و گروه‌ها چیده شده‌اند.",
    imageUrl: WM("Periodic_table_large.svg", 960),
    attribution: "ویکی‌مدیا کامنز — جدول تناوبی",
  },
];

export function diagramById(id: string): LessonDiagram | undefined {
  if (id.startsWith("atlas-")) {
    const geoId = id.slice("atlas-".length);
    const found = GEO_ATLAS_MAPS.find((x) => x.id === geoId);
    if (found) return fromGeoAtlas(found);
  }
  return LESSON_DIAGRAMS.find((d) => d.id === id);
}

function norm(s: string) {
  return s
    .toLowerCase()
    .replace(/\u200c/g, "")
    .replace(/[ي]/g, "ی")
    .replace(/[ك]/g, "ک")
    .replace(/\s+/g, " ")
    .trim();
}

export function matchDiagram(text: string): LessonDiagram | null {
  const geo = matchGeoAtlas(text);
  if (geo) return fromGeoAtlas(geo);

  const t = norm(text);
  if (t.length < 2) return null;
  let best: LessonDiagram | null = null;
  let score = 0;
  for (const d of LESSON_DIAGRAMS) {
    let hits = 0;
    for (const k of d.keywords) {
      const key = norm(k);
      if (!key || key.length < 2) continue;
      const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re = new RegExp(`(^|[^\\p{L}\\p{N}])${escaped}([^\\p{L}\\p{N}]|$)`, "u");
      if (re.test(t)) {
        hits += key.length >= 4 ? 3 : key.length >= 3 ? 2 : 1;
      }
    }
    if (hits > score) {
      score = hits;
      best = d;
    }
  }
  return score >= 2 ? best : null;
}

export function diagramTag(id: string) {
  return `[diagram:${id}]`;
}
