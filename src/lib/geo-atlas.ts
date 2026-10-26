/**
 * اطلس جغرافیای فارسی پویا — همه تصاویر public/atlas
 */
import { EXTRA_ATLAS_MAPS } from "./geo-atlas-extra";

export type GeoAtlasMap = {
  id: string;
  title: string;
  keywords: string[];
  caption: string;
  imageUrl: string;
  gallery?: string[];
};

const CORE_ATLAS_MAPS: GeoAtlasMap[] = [
  {
    id: "world-political",
    title: "نقشه سیاسی جهان",
    keywords: ["نقشه جهان", "نقشه سیاسی جهان", "کره زمین", "world map", "نقشه کره زمین", "نقشه دنیا", "نقشه زمین", "نقشه کل جهان"],
    caption: "نقشه سیاسی جهان — قاره‌ها، کشورها و اقیانوس‌ها.",
    imageUrl: "/atlas/world-political.jpg",
  },
  {
    id: "asia-political",
    title: "آسیا (سیاسی)",
    keywords: ["آسیا", "نقشه آسیا", "قاره آسیا", "آسیای سیاسی", "کشورهای آسیا"],
    caption: "نقشه سیاسی قاره آسیا.",
    imageUrl: "/atlas/asia-political.jpg",
  },
  {
    id: "middle-east",
    title: "خاورمیانه",
    keywords: ["خاورمیانه", "خاور میانه", "نقشه خاورمیانه", "خلیج فارس", "عربستان", "عراق", "افغانستان", "پاکستان", "سوریه", "لبنان"],
    caption: "نقشه خاورمیانه و کشورهای همسایه.",
    imageUrl: "/atlas/middle-east.jpg",
  },
  {
    id: "iran-political",
    title: "ایران — سیاسی (استان‌ها)",
    keywords: ["ایران", "نقشه ایران", "ایران سیاسی", "استانهای ایران", "استان‌های ایران", "نقشه استان", "استان ایران", "همسایه های ایران", "همسایه‌های ایران", "مرز ایران", "جمهوری اسلامی ایران", "نقشه استان‌ها", "کشور ایران"],
    caption: "نقشه سیاسی ایران با استان‌ها و همسایگان.",
    imageUrl: "/atlas/iran-political.jpg",
  },
  {
    id: "iran-physical",
    title: "ایران — طبیعی",
    keywords: ["ایران طبیعی", "نقشه طبیعی ایران", "کوههای ایران", "کوه‌های ایران", "البرز", "زاگرس", "دشت کویر", "دشت لوت", "دریای خزر", "نقشه طبیعی"],
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
    keywords: ["آفریقا", "نقشه آفریقا", "قاره آفریقا", "کشورهای آفریقا"],
    caption: "نقشه سیاسی آفریقا.",
    imageUrl: "/atlas/africa.jpg",
  },
  {
    id: "americas",
    title: "آمریکای شمالی و جنوبی",
    keywords: ["آمریکای جنوبی", "آمریکای شمالی", "نقشه آمریکا", "قاره آمریکا", "برزیل", "آرژانتین", "کانادا"],
    caption: "نقشه آمریکای شمالی و جنوبی.",
    imageUrl: "/atlas/americas.jpg",
  },
  {
    id: "north-america",
    title: "آمریکای شمالی",
    keywords: ["آمریکای شمالی", "ایالات متحده", "نقشه آمریکا شمالی", "نقشه کانادا", "مکزیک", "آمریکا", "ایالات متحده آمریکا"],
    caption: "نقشه آمریکای شمالی.",
    imageUrl: "/atlas/north-america.jpg",
  },
  {
    id: "south-america",
    title: "آمریکای جنوبی",
    keywords: ["آمریکای جنوبی", "نقشه آمریکای جنوبی", "آمریکای لاتین"],
    caption: "نقشه آمریکای جنوبی.",
    imageUrl: "/atlas/south-america.jpg",
  },
  {
    id: "oceania",
    title: "استرالیا و اقیانوسیه",
    keywords: ["استرالیا", "اقیانوسیه", "نقشه استرالیا", "نیوزیلند", "اقیانوس آرام", "قاره اقیانوسیه"],
    caption: "استرالیا، نیوزیلند و جزایر اقیانوسیه.",
    imageUrl: "/atlas/oceania.jpg",
  },
  {
    id: "arctic",
    title: "قطب شمال",
    keywords: ["قطب شمال", "اقیانوس منجمد شمالی", "نقشه قطب شمال", "گرینلند", "منطقه قطبی شمال"],
    caption: "اقیانوس منجمد شمالی و مناطق قطبی شمال.",
    imageUrl: "/atlas/arctic.jpg",
  },
  {
    id: "antarctica",
    title: "قطب جنوب",
    keywords: ["قطب جنوب", "قطب جنوبی", "آنتارکتیکا", "نقشه قطب جنوب", "اقیانوس منجمد جنوبی", "قاره قطب جنوب"],
    caption: "قاره قطب جنوب (آنتارکتیکا).",
    imageUrl: "/atlas/antarctica.jpg",
  },
  {
    id: "pg-008",
    title: "پرچم کشورهای جهان",
    keywords: ["پرچم", "پرچم کشورها", "پرچم جهان", "پرچم‌های جهان", "نماد کشورها", "همه پرچم‌ها"],
    caption: "پرچم کشورهای جهان — چند صفحه.",
    imageUrl: "/atlas/pg-008-006.jpg",
    gallery: ["/atlas/pg-008-006.jpg", "/atlas/pg-009-007.jpg", "/atlas/pg-011-009.jpg"],
  },
  {
    id: "pg-009",
    title: "پرچم کشورهای جهان (۲)",
    keywords: ["پرچم", "پرچم کشورها", "صفحه دوم پرچم", "پرچم قاره", "پرچم اروپا", "پرچم آسیا", "پرچم آفریقا"],
    caption: "پرچم کشورهای جهان — بخش دوم.",
    imageUrl: "/atlas/pg-009-007.jpg",
  },
  {
    id: "pg-010",
    title: "نقشه طبیعی جهان",
    keywords: ["نقشه طبیعی جهان", "پستی و بلندی", "نقشه فیزیکی جهان", "رلیف"],
    caption: "نقشه طبیعی جهان با نمایش پستی‌وبلندی.",
    imageUrl: "/atlas/pg-010-008.jpg",
  },
  {
    id: "pg-012",
    title: "مناطق زمانی جهان",
    keywords: ["مناطق زمانی", "ساعت جهانی", "منطقه زمانی", "time zone", "ساعت کشورها"],
    caption: "نقشه مناطق زمانی جهان.",
    imageUrl: "/atlas/pg-012-010.jpg",
  },
  {
    id: "pg-050",
    title: "مکزیک و آمریکای مرکزی",
    keywords: ["مکزیک", "آمریکای مرکزی", "پاناما", "کاستاریکا", "گواتمالا", "کوبا"],
    caption: "نقشه مکزیک، آمریکای مرکزی و کارائیب.",
    imageUrl: "/atlas/pg-050-048.jpg",
  },
  {
    id: "pg-065",
    title: "برزیل",
    keywords: ["برزیل", "ریو دو ژانیرو", "سائوپائولو", "آمازون"],
    caption: "نقشه برزیل.",
    imageUrl: "/atlas/pg-065-063.jpg",
  },
  {
    id: "pg-074",
    title: "مصر و سودان",
    keywords: ["مصر", "قاهره", "رود نیل", "سودان", "اسوان"],
    caption: "نقشه مصر و سودان.",
    imageUrl: "/atlas/pg-074-072.jpg",
  },
  {
    id: "pg-083",
    title: "روسیه و شمال اوراسیا",
    keywords: ["روسیه", "مسکو", "سیبری", "نقشه روسیه", "اوراسیا"],
    caption: "نقشه روسیه و شمال اوراسیا.",
    imageUrl: "/atlas/pg-083-081.jpg",
  },
  {
    id: "pg-092",
    title: "اسپانیا و پرتغال",
    keywords: ["اسپانیا", "پرتغال", "مادرید", "لیسبون", "بارسلونا", "ایبری"],
    caption: "نقشه اسپانیا و پرتغال.",
    imageUrl: "/atlas/pg-092-090.jpg",
  },
  {
    id: "pg-093",
    title: "ایتالیا",
    keywords: ["ایتالیا", "رم", "میلان", "ونیز", "فلورانس", "ناپل", "سیسیل"],
    caption: "نقشه ایتالیا.",
    imageUrl: "/atlas/pg-093-091.jpg",
  },
  {
    id: "pg-096",
    title: "آلمان و اروپای مرکزی",
    keywords: ["آلمان", "برلین", "مونیخ", "فرانکفورت", "اتریش", "سوئیس", "لهستان"],
    caption: "نقشه آلمان و اروپای مرکزی.",
    imageUrl: "/atlas/pg-096-094.jpg",
  },
  {
    id: "pg-097",
    title: "فرانسه و اروپای غربی",
    keywords: ["فرانسه", "پاریس", "لیون", "مارسی", "بلژیک", "هلند", "لوکزامبورگ"],
    caption: "نقشه فرانسه و اروپای غربی.",
    imageUrl: "/atlas/pg-097-095.jpg",
  },
  {
    id: "pg-099",
    title: "یونان و دریای اژه",
    keywords: ["یونان", "آتن", "جزایر یونان", "کرت", "اژه", "مقدونیه"],
    caption: "نقشه یونان و جزایر اژه.",
    imageUrl: "/atlas/pg-099-097.jpg",
  },
  {
    id: "pg-118",
    title: "ترکیه",
    keywords: ["ترکیه", "استانبول", "آنکارا", "ازمیر", "آنتالیا", "نقشه ترکیه"],
    caption: "نقشه ترکیه.",
    imageUrl: "/atlas/pg-118-116.jpg",
  },
  {
    id: "pg-119",
    title: "قفقاز",
    keywords: ["قفقاز", "گرجستان", "ارمنستان", "آذربایجان", "تفلیس", "باکو", "ایروان"],
    caption: "نقشه منطقه قفقاز.",
    imageUrl: "/atlas/pg-119-117.jpg",
  },
];

export const GEO_ATLAS_MAPS: GeoAtlasMap[] = [...CORE_ATLAS_MAPS, ...EXTRA_ATLAS_MAPS];

function norm(s: string) {
  return s
    .toLowerCase()
    .replace(/\u200c/g, "")
    .replace(/[ي]/g, "ی")
    .replace(/[ك]/g, "ک")
    .replace(/\s+/g, " ")
    .trim();
}

const BROAD_IDS = new Set([
  "world-political", "asia-political", "europe", "africa", "americas",
  "north-america", "south-america", "oceania", "arctic", "antarctica",
]);

export function matchGeoAtlas(text: string): GeoAtlasMap | null {
  const t = norm(text);
  if (t.length < 2) return null;
  type Cand = { map: GeoAtlasMap; score: number; specific: boolean };
  const cands: Cand[] = [];
  for (const m of GEO_ATLAS_MAPS) {
    let hits = 0;
    let longest = 0;
    for (const k of m.keywords) {
      const key = norm(k);
      if (!key || key.length < 2) continue;
      const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re = new RegExp(`(^|[^\\p{L}\\p{N}])${escaped}([^\\p{L}\\p{N}]|$)`, "u");
      if (re.test(t)) {
        hits += key.length >= 6 ? 5 : key.length >= 4 ? 3 : 2;
        if (key.length > longest) longest = key.length;
      }
    }
    if (hits > 0) {
      const specific = !BROAD_IDS.has(m.id);
      const score = hits + (specific ? 10 : 0) + Math.min(longest, 12);
      cands.push({ map: m, score, specific });
    }
  }
  if (!cands.length) return null;
  cands.sort((a, b) => b.score - a.score);
  const top = cands[0];
  if (top.specific) return top.map;
  if (top.score >= 6) return top.map;
  return null;
}

export function geoAtlasMarkdown(map: GeoAtlasMap): string {
  const imgs = map.gallery && map.gallery.length ? map.gallery : [map.imageUrl];
  const blocks = imgs.map((u, i) => `![${map.title}${imgs.length > 1 ? ` (${i + 1})` : ""}](${u})`);
  return `${blocks.join("\n")}\n*${map.caption}*`;
}
