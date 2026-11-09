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
  {
    id: "atom-structure", title: "ساختار اتم", subject: "شیمی", grades: "هشتم تا دوازدهم",
    keywords: ["ساختار اتم", "اتم", "پروتون", "نوترون", "الکترون", "هسته اتم", "ذرات زیراتمی"],
    caption: "اتم از هسته‌ای شامل پروتون و نوترون و الکترون‌های پیرامون آن تشکیل شده است؛ این تصویر یک مدل آموزشی ساده‌شده است.",
    attribution: "تصویر برداری اختصاصی بانک آموزشی پویا",
  },
  {
    id: "water-molecule", title: "مولکول آب", subject: "شیمی", grades: "هفتم تا دوازدهم",
    keywords: ["مولکول آب", "فرمول آب", "H2O", "پیوند آب", "ساختار آب"],
    caption: "هر مولکول آب از دو اتم هیدروژن و یک اتم اکسیژن تشکیل شده است.",
    attribution: "تصویر برداری اختصاصی بانک آموزشی پویا",
  },
  {
    id: "co2-molecule", title: "مولکول کربن‌دی‌اکسید", subject: "شیمی", grades: "هشتم تا دوازدهم",
    keywords: ["کربن دی اکسید", "کربن‌دی‌اکسید", "CO2", "دی اکسید کربن", "ساختار CO2"],
    caption: "مولکول CO₂ از یک اتم کربن و دو اتم اکسیژن با ساختار خطی تشکیل شده است.",
    attribution: "تصویر برداری اختصاصی بانک آموزشی پویا",
  },
  {
    id: "ionic-bond", title: "پیوند یونی؛ سدیم و کلر", subject: "شیمی", grades: "نهم تا دوازدهم",
    keywords: ["پیوند یونی", "سدیم کلرید", "NaCl", "نمک خوراکی", "یون مثبت", "یون منفی"],
    caption: "سدیم یک الکترون از دست می‌دهد و کلر آن را می‌گیرد؛ جاذبه الکتریکی میان یون‌ها پیوند یونی ایجاد می‌کند.",
    attribution: "تصویر برداری اختصاصی بانک آموزشی پویا",
  },
  {
    id: "covalent-bond", title: "پیوند اشتراکی", subject: "شیمی", grades: "نهم تا دوازدهم",
    keywords: ["پیوند کووالانسی", "پیوند اشتراکی", "H2", "اشتراک الکترون"],
    caption: "در پیوند کووالانسی، اتم‌ها یک یا چند جفت الکترون را به اشتراک می‌گذارند.",
    attribution: "تصویر برداری اختصاصی بانک آموزشی پویا",
  },
  {
    id: "reaction-water", title: "موازنه واکنش تشکیل آب", subject: "شیمی", grades: "دهم تا دوازدهم",
    keywords: ["موازنه واکنش", "موازنه معادله", "تشکیل آب", "واکنش هیدروژن و اکسیژن", "2H2 O2"],
    caption: "۲H₂ + O₂ → ۲H₂O؛ تعداد اتم‌های هر عنصر در دو سوی معادله برابر است.",
    attribution: "تصویر برداری اختصاصی بانک آموزشی پویا",
  },
  {
    id: "ph-scale", title: "مقیاس اسیدی و بازی", subject: "شیمی", grades: "هفتم تا دوازدهم",
    keywords: ["pH", "پی اچ", "اسید", "باز", "اسیدی", "بازی", "مقیاس اسیدی"],
    caption: "در محلول‌های آبی: pH کمتر از ۷ اسیدی، برابر ۷ خنثی و بیشتر از ۷ بازی است.",
    attribution: "تصویر برداری اختصاصی بانک آموزشی پویا",
  },
  {
    id: "states-of-matter", title: "سه حالت ماده", subject: "علوم / شیمی", grades: "چهارم تا نهم",
    keywords: ["حالت ماده", "جامد", "مایع", "گاز", "حالت های ماده", "حالت‌های ماده"],
    caption: "در جامد، ذره‌ها منظم و نزدیک‌اند؛ در مایع امکان لغزش دارند و در گاز فاصله بیشتری از هم دارند.",
    attribution: "تصویر برداری اختصاصی بانک آموزشی پویا",
  },
  {
    id: "light-reflection", title: "بازتاب نور از آینه", subject: "فیزیک", grades: "هفتم تا دهم",
    keywords: ["بازتاب نور", "انعکاس نور", "آینه", "زاویه تابش", "زاویه بازتاب"],
    caption: "در بازتاب منظم از آینه تخت، زاویه تابش با زاویه بازتاب برابر است؛ هر دو نسبت به خط عمود سنجیده می‌شوند.",
    attribution: "تصویر برداری اختصاصی بانک آموزشی پویا",
  },
  {
    id: "refraction", title: "شکست نور", subject: "فیزیک", grades: "هفتم تا یازدهم",
    keywords: ["شکست نور", "انکسار", "نور در آب", "ضریب شکست"],
    caption: "با ورود نور از یک محیط به محیطی دیگر، سرعت و معمولاً جهت انتشار آن تغییر می‌کند.",
    attribution: "تصویر برداری اختصاصی بانک آموزشی پویا",
  },
  {
    id: "magnetic-field", title: "میدان مغناطیسی آهنربا", subject: "فیزیک", grades: "هفتم تا دهم",
    keywords: ["میدان مغناطیسی", "آهنربا", "قطب شمال", "قطب جنوب", "خطوط میدان"],
    caption: "خطوط میدان مغناطیسی در بیرون آهنربا از قطب شمال به قطب جنوب رسم می‌شوند.",
    attribution: "تصویر برداری اختصاصی بانک آموزشی پویا",
  },
  // Register every map in the local geography atlas in the lesson gallery.
  ...GEO_ATLAS_MAPS.map(fromGeoAtlas),
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
