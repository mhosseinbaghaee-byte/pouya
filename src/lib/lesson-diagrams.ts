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
    id: "anatomy-all-systems",
    title: "نمای کلی دستگاه‌های بدن انسان",
    subject: "زیست‌شناسی",
    grades: "هفتم تا دوازدهم",
    keywords: ["دستگاه های بدن", "دستگاه‌های بدن", "دستگاه بدن انسان", "همه دستگاه های بدن", "نمای کلی بدن", "systems of the human body"],
    caption: "نمای کلی دستگاه‌های اصلی بدن و ارتباط آن‌ها با یکدیگر.",
    imageUrl: "/images/anatomy/00_all_systems_overview.png",
    attribution: "بانک تصاویر آموزشی آناتومی پویا",
  },
  {
    id: "anatomy-body-systems",
    title: "دستگاه‌های بدن",
    subject: "زیست‌شناسی",
    grades: "هفتم تا دوازدهم",
    keywords: ["دستگاه های بدن انسان", "دستگاه‌های بدن انسان", "بدن انسان", "سیستم های بدن", "سیستم‌های بدن"],
    caption: "مروری بر دستگاه‌های گوناگون بدن انسان.",
    imageUrl: "/images/anatomy/01_body_systems_overview.png",
    attribution: "بانک تصاویر آموزشی آناتومی پویا",
  },
  {
    id: "skeletal-system",
    title: "دستگاه اسکلتی",
    subject: "زیست‌شناسی",
    grades: "هفتم تا دهم",
    keywords: ["اسکلت", "استخوان", "دستگاه اسکلتی", "اسکلت انسان", "استخوان بندی"],
    caption: "اسکلت از بدن پشتیبانی می‌کند، از اندام‌ها محافظت می‌کند و به حرکت کمک می‌کند.",
    imageUrl: "/images/anatomy/02_skeletal_system.png",
    attribution: "بانک تصاویر آموزشی آناتومی پویا",
  },
  {
    id: "muscular-system",
    title: "دستگاه عضلانی",
    subject: "زیست‌شناسی",
    grades: "هفتم تا دهم",
    keywords: ["عضله", "عضلات", "ماهیچه", "ماهیچه ها", "دستگاه عضلانی"],
    caption: "ماهیچه‌ها با انقباض و انبساط، حرکت بدن را ممکن می‌کنند.",
    imageUrl: "/images/anatomy/03_muscular_system.png",
    attribution: "بانک تصاویر آموزشی آناتومی پویا",
  },
  {
    id: "nervous-system",
    title: "دستگاه عصبی",
    subject: "زیست‌شناسی",
    grades: "هفتم تا یازدهم",
    keywords: ["دستگاه عصبی", "مغز", "نخاع", "اعصاب", "سیستم عصبی"],
    caption: "مغز، نخاع و عصب‌ها دریافت و پردازش پیام‌های عصبی را بر عهده دارند.",
    imageUrl: "/images/anatomy/04_nervous_system.png",
    attribution: "بانک تصاویر آموزشی آناتومی پویا",
  },
  {
    id: "respiratory-system",
    title: "دستگاه تنفسی و شُش‌ها",
    subject: "زیست‌شناسی",
    grades: "هفتم تا دهم",
    keywords: ["تنفس", "دستگاه تنفسی", "شش", "شش ها", "شُش", "شُش‌ها", "ریه", "ریه ها", "نای", "نایژه"],
    caption: "هوا از راه‌های تنفسی وارد شُش‌ها می‌شود و تبادل اکسیژن و دی‌اکسیدکربن در آن‌ها انجام می‌گیرد.",
    imageUrl: "/images/anatomy/06_respiratory_system.png",
    attribution: "بانک تصاویر آموزشی آناتومی پویا",
  },
  {
    id: "digestive-system",
    title: "دستگاه گوارش",
    subject: "زیست‌شناسی",
    grades: "هفتم تا دهم",
    keywords: ["گوارش", "دستگاه گوارش", "معده", "روده", "روده باریک", "روده بزرگ", "کبد", "مری"],
    caption: "غذا در لوله گوارش تجزیه می‌شود و مواد مغذی آن جذب بدن می‌شوند.",
    imageUrl: "/images/anatomy/07_digestive_system.png",
    attribution: "بانک تصاویر آموزشی آناتومی پویا",
  },
  {
    id: "urinary-system",
    title: "دستگاه ادراری",
    subject: "زیست‌شناسی",
    grades: "هفتم تا یازدهم",
    keywords: ["ادرار", "دستگاه ادراری", "کلیه", "کلیه ها", "میزنای", "مثانه"],
    caption: "کلیه‌ها خون را پالایش می‌کنند و در تشکیل و دفع ادرار نقش دارند.",
    imageUrl: "/images/anatomy/08_urinary_system.png",
    attribution: "بانک تصاویر آموزشی آناتومی پویا",
  },
  {
    id: "reproductive-system",
    title: "دستگاه تولیدمثل",
    subject: "زیست‌شناسی",
    grades: "نهم تا دوازدهم",
    keywords: ["تولیدمثل", "دستگاه تولید مثل", "دستگاه تولیدمثل", "تولید مثل انسان"],
    caption: "نمای آموزشی دستگاه تولیدمثل انسان.",
    imageUrl: "/images/anatomy/09_reproductive_system.png",
    attribution: "بانک تصاویر آموزشی آناتومی پویا",
  },
  {
    id: "skin",
    title: "ساختار پوست",
    subject: "زیست‌شناسی",
    grades: "هفتم تا دهم",
    keywords: ["پوست", "ساختار پوست", "لایه های پوست", "لایه‌های پوست", "اپیدرم", "درم"],
    caption: "پوست از لایه‌های مختلف تشکیل شده و سد محافظ بدن است.",
    imageUrl: "/images/anatomy/10_skin.png",
    attribution: "بانک تصاویر آموزشی آناتومی پویا",
  },
  {
    id: "eye-ear",
    title: "ساختار چشم و گوش",
    subject: "زیست‌شناسی",
    grades: "هفتم تا یازدهم",
    keywords: ["چشم", "گوش", "ساختار چشم", "ساختار گوش", "بینایی", "شنوایی"],
    caption: "چشم و گوش به‌ترتیب در دریافت محرک‌های بینایی و شنوایی نقش دارند.",
    imageUrl: "/images/anatomy/11_eye_and_ear.png",
    attribution: "بانک تصاویر آموزشی آناتومی پویا",
  },
  {
    id: "endocrine-system",
    title: "دستگاه درون‌ریز",
    subject: "زیست‌شناسی",
    grades: "دهم تا دوازدهم",
    keywords: ["غدد", "غدد درون ریز", "غدد درون‌ریز", "دستگاه درون ریز", "هورمون", "هورمون ها"],
    caption: "غدد درون‌ریز با ترشح هورمون‌ها فعالیت‌های بدن را تنظیم می‌کنند.",
    imageUrl: "/images/anatomy/12_endocrine_system.png",
    attribution: "بانک تصاویر آموزشی آناتومی پویا",
  },
  {
    id: "major-organs",
    title: "اندام‌های اصلی بدن",
    subject: "زیست‌شناسی",
    grades: "هفتم تا دهم",
    keywords: ["اندام های اصلی", "اندام‌های اصلی", "اندام های بدن", "اعضای بدن", "اندام داخلی"],
    caption: "جایگاه اندام‌های مهم بدن و نقش کلی آن‌ها.",
    imageUrl: "/images/anatomy/13_major_organs.png",
    attribution: "بانک تصاویر آموزشی آناتومی پویا",
  },
  {
    id: "internal-organs",
    title: "اندام‌های داخلی انسان",
    subject: "زیست‌شناسی",
    grades: "هفتم تا دهم",
    keywords: ["اندام های داخلی", "اندام‌های داخلی", "اعضای داخلی", "احشای بدن", "اعضای درونی"],
    caption: "نمای کلی محل قرارگیری اندام‌های داخلی در بدن انسان.",
    imageUrl: "/images/anatomy/14_whole_body_internal_organs.png",
    attribution: "بانک تصاویر آموزشی آناتومی پویا",
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
    imageUrl: "/images/anatomy/05_heart_and_circulation.png",
    attribution: "بانک تصاویر آموزشی آناتومی پویا",
    
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
