/**
 * اطلس جغرافیای فارسی پویا — نسخه کامل
 * تصاویر در public/atlas/
 * اولویت: ایران → خاورمیانه → قاره‌ها → نقشه‌های منطقه‌ای
 */

export type GeoAtlasMap = {
  id: string;
  title: string;
  keywords: string[];
  caption: string;
  imageUrl: string;
};

export const GEO_ATLAS_MAPS: GeoAtlasMap[] = [
  // ========== هسته اصلی (اولویت بالا) ==========
  {
    id: "world-political",
    title: "نقشه سیاسی جهان",
    keywords: [
      "نقشه جهان", "نقشه سیاسی جهان", "قاره", "اقیانوس", "کره زمین",
      "world map", "نقشه کره زمین", "نقشه دنیا", "نقشه زمین",
    ],
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
    keywords: [
      "خاورمیانه", "خاور میانه", "نقشه خاورمیانه", "خلیج فارس",
      "عربستان", "عراق", "افغانستان", "پاکستان", "سوریه", "لبنان",
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
      "مرز ایران", "جمهوری اسلامی ایران", "نقشه استان‌ها",
    ],
    caption: "نقشه سیاسی ایران با استان‌ها و همسایگان.",
    imageUrl: "/atlas/iran-political.jpg",
  },
  {
    id: "iran-physical",
    title: "ایران — طبیعی",
    keywords: [
      "ایران طبیعی", "نقشه طبیعی ایران", "کوههای ایران", "کوه‌های ایران",
      "البرز", "زاگرس", "دشت کویر", "دشت لوت", "دریای خزر", "نقشه طبیعی",
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
    keywords: ["آفریقا", "نقشه آفریقا", "قاره آفریقا", "کشورهای آفریقا"],
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
      "آمریکا", "ایالات متحده آمریکا",
    ],
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
    keywords: [
      "استرالیا", "اقیانوسیه", "نقشه استرالیا", "نیوزیلند", "اقیانوس آرام",
      "قاره اقیانوسیه",
    ],
    caption: "استرالیا، نیوزیلند و جزایر اقیانوسیه.",
    imageUrl: "/atlas/oceania.jpg",
  },
  {
    id: "arctic",
    title: "قطب شمال",
    keywords: [
      "قطب شمال", "اقیانوس منجمد شمالی", "نقشه قطب شمال", "گرینلند",
      "منطقه قطبی شمال",
    ],
    caption: "اقیانوس منجمد شمالی و مناطق قطبی شمال.",
    imageUrl: "/atlas/arctic.jpg",
  },
  {
    id: "antarctica",
    title: "قطب جنوب",
    keywords: [
      "قطب جنوب", "قطب جنوبی", "آنتارکتیکا", "نقشه قطب جنوب",
      "اقیانوس منجمد جنوبی", "قاره قطب جنوب",
    ],
    caption: "قاره قطب جنوب (آنتارکتیکا).",
    imageUrl: "/atlas/antarctica.jpg",
  },

  // ========== نقشه‌های منطقه‌ای جدید ==========
  {
    id: "pg-008",
    title: "پرچم کشورهای جهان (۱)",
    keywords: ["پرچم", "پرچم کشورها", "پرچم جهان", "پرچم‌های جهان", "نماد کشورها"],
    caption: "پرچم کشورهای جهان — بخش اول.",
    imageUrl: "/atlas/pg-008-006.jpg",
  },
  {
    id: "pg-009",
    title: "پرچم کشورهای جهان (۲)",
    keywords: ["پرچم قاره", "پرچم اروپا", "پرچم آسیا", "پرچم آفریقا"],
    caption: "پرچم کشورهای جهان — بخش دوم.",
    imageUrl: "/atlas/pg-009-007.jpg",
  },
  {
    id: "pg-010",
    title: "نقشه طبیعی و پستی‌وبلندی جهان",
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
    id: "pg-014",
    title: "جریان‌های اقیانوسی",
    keywords: ["جریان اقیانوسی", "جریان‌های اقیانوس", "جریان گرم", "جریان سرد", "اقیانوس"],
    caption: "نقشه جریان‌های اقیانوسی گرم و سرد.",
    imageUrl: "/atlas/pg-014-012.jpg",
  },
  {
    id: "pg-016",
    title: "پوشش گیاهی و بیوم‌های جهان",
    keywords: ["پوشش گیاهی", "بیوم", "جنگل", "بیابان", "توندرا", "ساوانا", "استپ"],
    caption: "نقشه پوشش گیاهی و بیوم‌های جهان.",
    imageUrl: "/atlas/pg-016-014.jpg",
  },
  {
    id: "pg-018",
    title: "جمعیت و شهرهای جهان",
    keywords: ["جمعیت جهان", "تراکم جمعیت", "شهرهای بزرگ", "نقشه جمعیت"],
    caption: "نقشه جمعیت و مراکز شهری جهان.",
    imageUrl: "/atlas/pg-018-016.jpg",
  },
  {
    id: "pg-043",
    title: "ایالات متحده — شمال شرق",
    keywords: ["نیویورک", "واشنگتن", "بوستون", "فیلادلفیا", "شمال شرق آمریکا"],
    caption: "نقشه شمال شرق ایالات متحده.",
    imageUrl: "/atlas/pg-043-041.jpg",
  },
  {
    id: "pg-045",
    title: "ایالات متحده — فلوریدا و جنوب",
    keywords: ["فلوریدا", "میامی", "تگزاس", "جنوب آمریکا"],
    caption: "نقشه فلوریدا و مناطق جنوبی آمریکا.",
    imageUrl: "/atlas/pg-045-043.jpg",
  },
  {
    id: "pg-047",
    title: "ایالات متحده — غرب و کالیفرنیا",
    keywords: ["کالیفرنیا", "لس آنجلس", "سان فرانسیسکو", "غرب آمریکا", "سیاتل"],
    caption: "نقشه غرب ایالات متحده و کالیفرنیا.",
    imageUrl: "/atlas/pg-047-045.jpg",
  },
  {
    id: "pg-050",
    title: "مکزیک و آمریکای مرکزی",
    keywords: ["مکزیک", "آمریکای مرکزی", "پاناما", "کاستاریکا", "گواتمالا", "کوبا"],
    caption: "نقشه مکزیک، آمریکای مرکزی و کارائیب.",
    imageUrl: "/atlas/pg-050-048.jpg",
  },
  {
    id: "pg-058",
    title: "آمریکای جنوبی — کلی",
    keywords: ["برزیل", "آرژانتین", "شیلی", "پرو", "کلمبیا", "ونزوئلا"],
    caption: "نقشه کلی آمریکای جنوبی.",
    imageUrl: "/atlas/pg-058-056.jpg",
  },
  {
    id: "pg-062",
    title: "پرو و شیلی",
    keywords: ["پرو", "شیلی", "لیما", "سانتیاگو", "آند"],
    caption: "نقشه پرو و شیلی.",
    imageUrl: "/atlas/pg-062-060.jpg",
  },
  {
    id: "pg-065",
    title: "برزیل",
    keywords: ["برزیل", "ریو دو ژانیرو", "سائوپائولو", "آمازون"],
    caption: "نقشه برزیل.",
    imageUrl: "/atlas/pg-065-063.jpg",
  },
  {
    id: "pg-067",
    title: "آرژانتین و پاتاگونیا",
    keywords: ["آرژانتین", "بوئنوس آیرس", "پاتاگونیا", "فالکلند"],
    caption: "نقشه آرژانتین و منطقه پاتاگونیا.",
    imageUrl: "/atlas/pg-067-065.jpg",
  },
  {
    id: "pg-072",
    title: "شمال آفریقا — مراکش و الجزایر",
    keywords: ["مراکش", "الجزایر", "تونس", "شمال آفریقا", "مغرب"],
    caption: "نقشه شمال آفریقا (مراکش، الجزایر، تونس).",
    imageUrl: "/atlas/pg-072-070.jpg",
  },
  {
    id: "pg-074",
    title: "مصر و سودان",
    keywords: ["مصر", "قاهره", "رود نیل", "سودان", "اسوان"],
    caption: "نقشه مصر و سودان.",
    imageUrl: "/atlas/pg-074-072.jpg",
  },
  {
    id: "pg-076",
    title: "غرب آفریقا",
    keywords: ["نیجریه", "غنا", "سنگال", "غرب آفریقا", "ساحل عاج"],
    caption: "نقشه غرب آفریقا.",
    imageUrl: "/atlas/pg-076-074.jpg",
  },
  {
    id: "pg-079",
    title: "مرکز و غرب آفریقا",
    keywords: ["کنگو", "کامرون", "گابن", "مرکز آفریقا"],
    caption: "نقشه مرکز و غرب آفریقا.",
    imageUrl: "/atlas/pg-079-077.jpg",
  },
  {
    id: "pg-080",
    title: "جنوب آفریقا",
    keywords: ["آفریقای جنوبی", "کیپ‌تاون", "ژوهانسبورگ", "نامیبیا", "بوتسوانا", "زیمبابوه"],
    caption: "نقشه جنوب آفریقا.",
    imageUrl: "/atlas/pg-080-078.jpg",
  },
  {
    id: "pg-081",
    title: "شرق آفریقا و ماداگاسکار",
    keywords: ["کنیا", "تانزانیا", "اتیوپی", "ماداگاسکار", "سومالی", "اوگاندا"],
    caption: "نقشه شرق آفریقا و ماداگاسکار.",
    imageUrl: "/atlas/pg-081-079.jpg",
  },
  {
    id: "pg-082",
    title: "اروپا — کلی و غرب",
    keywords: ["نقشه اروپا", "اروپای غربی"],
    caption: "نقشه اروپا با جزئیات غرب.",
    imageUrl: "/atlas/pg-082-080.jpg",
  },
  {
    id: "pg-083",
    title: "روسیه و شمال اوراسیا",
    keywords: ["روسیه", "مسکو", "سیبری", "نقشه روسیه", "اوراسیا"],
    caption: "نقشه روسیه و شمال اوراسیا.",
    imageUrl: "/atlas/pg-083-081.jpg",
  },
  {
    id: "pg-084",
    title: "اسکاندیناوی و قطب شمال اروپا",
    keywords: ["نروژ", "سوئد", "فنلاند", "دانمارک", "اسکاندیناوی", "گرینلند"],
    caption: "نقشه اسکاندیناوی و مناطق قطبی اروپا.",
    imageUrl: "/atlas/pg-084-082.jpg",
  },
  {
    id: "pg-085",
    title: "ایسلند و شمال اروپا",
    keywords: ["ایسلند", "ریکیاویک", "شمال اروپا"],
    caption: "نقشه ایسلند و شمال اروپا.",
    imageUrl: "/atlas/pg-085-083.jpg",
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
    id: "pg-103",
    title: "بالکان",
    keywords: ["بالکان", "صربستان", "کرواسی", "بوسنی", "آلبانی", "بلغارستان", "رومانی"],
    caption: "نقشه شبه جزیره بالکان.",
    imageUrl: "/atlas/pg-103-101.jpg",
  },
  {
    id: "pg-110",
    title: "اوکراین و اروپای شرقی",
    keywords: ["اوکراین", "کی‌یف", "کریمه", "بلاروس", "مولداوی"],
    caption: "نقشه اوکراین و اروپای شرقی.",
    imageUrl: "/atlas/pg-110-108.jpg",
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
  {
    id: "pg-121",
    title: "ترکیه (جزئیات و استانبول)",
    keywords: ["استانبول", "تنگه بسفر", "آناتولی"],
    caption: "نقشه دقیق ترکیه با جزئیات استانبول.",
    imageUrl: "/atlas/pg-121-119.jpg",
  },
  {
    id: "pg-152",
    title: "نیوزیلند — جزیره شمالی",
    keywords: ["نیوزیلند", "اوکلند", "جزیره شمالی", "ولینگتون"],
    caption: "نقشه جزیره شمالی نیوزیلند.",
    imageUrl: "/atlas/pg-152-150.jpg",
  },
  {
    id: "pg-153",
    title: "نیوزیلند — جزیره جنوبی",
    keywords: ["جزیره جنوبی", "کرایست‌چرچ", "نیوزیلند جنوبی"],
    caption: "نقشه جزیره جنوبی نیوزیلند.",
    imageUrl: "/atlas/pg-153-151.jpg",
  },
  {
    id: "pg-154",
    title: "اقیانوسیه و اقیانوس آرام",
    keywords: ["اقیانوس آرام", "جزایر اقیانوس آرام", "پلی‌نزی", "میکرونزی"],
    caption: "نقشه اقیانوسیه و جزایر اقیانوس آرام.",
    imageUrl: "/atlas/pg-154-152.jpg",
  },
  {
    id: "pg-156",
    title: "قطب جنوب (جزئیات)",
    keywords: ["آنتارکتیکا", "ایستگاه‌های تحقیقاتی", "نقشه قطب جنوب دقیق"],
    caption: "نقشه دقیق قطب جنوب با ایستگاه‌ها.",
    imageUrl: "/atlas/pg-156-154.jpg",
  },
  {
    id: "pg-157",
    title: "قطب شمال (جزئیات)",
    keywords: ["اقیانوس منجمد شمالی", "نقشه قطب شمال دقیق", "گرینلند دقیق"],
    caption: "نقشه دقیق قطب شمال.",
    imageUrl: "/atlas/pg-157-155.jpg",
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

/** تطبیق سؤال با نقشه اطلس — اولویت با نقشه‌های اصلی */
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
        const isCore = [
          "world-political", "iran-political", "iran-physical", "middle-east",
          "asia-political", "europe", "africa", "americas", "north-america",
          "south-america", "oceania", "arctic", "antarctica",
        ].includes(m.id);
        hits += isCore
          ? (key.length >= 6 ? 5 : key.length >= 4 ? 4 : 3)
          : (key.length >= 6 ? 4 : key.length >= 4 ? 3 : 2);
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
