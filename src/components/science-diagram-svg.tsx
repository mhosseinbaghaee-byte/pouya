/** شکل‌های آموزشی علوم و شیمی — برچسب‌ها و توضیحات فارسی */
const frame = {
  width: "100%",
  height: 220,
  viewBox: "0 0 360 220",
  className: "my-2 w-full rounded-xl border border-border/40 bg-white",
} as const;

const title = (label: string) => (
  <text x="180" y="22" textAnchor="middle" fontSize="14" fontWeight="700" fill="#172554">{label}</text>
);
const label = (x: number, y: number, value: string, color = "#334155") => (
  <text x={x} y={y} fontSize="11" textAnchor="middle" fill={color}>{value}</text>
);

export function ScienceDiagramSvg({ id }: { id: string }) {
  if (id === "atom-structure") return (
    <svg {...frame} aria-label="مدل ساده‌شده اتم خنثی هلیم-۴">
      {title("مدل ساده‌شده اتم هلیم-۴")}
      <circle cx="180" cy="118" r="32" fill="#fee2e2" stroke="#be123c" strokeWidth="2"/>
      <circle cx="168" cy="108" r="8" fill="#ef4444"/><circle cx="190" cy="108" r="8" fill="#ef4444"/>
      <circle cx="179" cy="128" r="8" fill="#94a3b8"/><circle cx="194" cy="128" r="8" fill="#94a3b8"/>
      <ellipse cx="180" cy="118" rx="100" ry="52" fill="none" stroke="#64748b" strokeWidth="1.8"/>
      <circle cx="80" cy="118" r="7" fill="#2563eb"/><circle cx="280" cy="118" r="7" fill="#2563eb"/>
      {label(180, 175, "هسته: ۲ پروتون + ۲ نوترون (هلیم-۴)", "#7f1d1d")}
      {label(180, 195, "۲ الکترون؛ اتم خنثی هلیم", "#1d4ed8")}
    </svg>
  );
  if (id === "water-molecule") return (
    <svg {...frame} aria-label="مولکول آب">
      {title("مولکول آب — H₂O")}
      <line x1="180" y1="118" x2="110" y2="160" stroke="#64748b" strokeWidth="8" strokeLinecap="round"/>
      <line x1="180" y1="118" x2="250" y2="160" stroke="#64748b" strokeWidth="8" strokeLinecap="round"/>
      <circle cx="180" cy="112" r="34" fill="#ef4444" stroke="#991b1b" strokeWidth="2"/>
      <circle cx="105" cy="164" r="24" fill="#bfdbfe" stroke="#2563eb" strokeWidth="2"/>
      <circle cx="255" cy="164" r="24" fill="#bfdbfe" stroke="#2563eb" strokeWidth="2"/>
      {label(180, 117, "O", "#fff")}{label(105, 168, "H", "#1e3a8a")}{label(255, 168, "H", "#1e3a8a")}
      {label(180, 205, "یک اتم اکسیژن + دو اتم هیدروژن")}
    </svg>
  );
  if (id === "co2-molecule") return (
    <svg {...frame} aria-label="مولکول دی اکسید کربن">
      {title("دی‌اکسید کربن — CO₂")}
      <g stroke="#64748b" strokeWidth="4" strokeLinecap="round">
        <line x1="119" y1="113" x2="151" y2="113"/><line x1="119" y1="123" x2="151" y2="123"/>
        <line x1="209" y1="113" x2="241" y2="113"/><line x1="209" y1="123" x2="241" y2="123"/>
      </g>
      <circle cx="180" cy="118" r="29" fill="#334155"/><circle cx="95" cy="118" r="25" fill="#ef4444"/><circle cx="265" cy="118" r="25" fill="#ef4444"/>
      {label(180, 123, "C", "#fff")}{label(95, 123, "O", "#fff")}{label(265, 123, "O", "#fff")}
      {label(180, 180, "یک اتم کربن + دو اتم اکسیژن")}
      {label(180, 200, "ساختار خطی: O = C = O")}
    </svg>
  );
  if (id === "ionic-bond") return (
    <svg {...frame} aria-label="پیوند یونی سدیم و کلر">
      {title("پیوند یونی در نمک خوراکی — NaCl")}
      <circle cx="115" cy="112" r="42" fill="#dbeafe" stroke="#2563eb" strokeWidth="2"/>
      <circle cx="245" cy="112" r="42" fill="#dcfce7" stroke="#16a34a" strokeWidth="2"/>
      {label(115, 118, "Na⁺", "#1e40af")}{label(245, 118, "Cl⁻", "#166534")}
      <path d="M160 112 H200 M192 104 L200 112 L192 120" stroke="#7c3aed" strokeWidth="3" fill="none"/>
      {label(180, 172, "انتقال یک الکترون از سدیم به کلر")}
      {label(180, 194, "جاذبه میان یون‌های ناهم‌بار، پیوند یونی می‌سازد")}
    </svg>
  );
  if (id === "covalent-bond") return (
    <svg {...frame} aria-label="پیوند کووالانسی">
      {title("پیوند اشتراکی — مولکول هیدروژن H₂")}
      <circle cx="135" cy="112" r="38" fill="#bfdbfe" stroke="#2563eb" strokeWidth="2"/>
      <circle cx="225" cy="112" r="38" fill="#bfdbfe" stroke="#2563eb" strokeWidth="2"/>
      <ellipse cx="180" cy="112" rx="32" ry="18" fill="#c4b5fd" opacity=".9"/>
      {label(135, 117, "H", "#1e3a8a")}{label(225, 117, "H", "#1e3a8a")}
      {label(180, 170, "دو اتم هیدروژن یک جفت الکترون را شریک می‌شوند")}
      {label(180, 194, "اشتراک الکترون‌ها = پیوند کووالانسی")}
    </svg>
  );
  if (id === "reaction-water") return (
    <svg {...frame} aria-label="واکنش تشکیل آب">
      {title("تشکیل آب از هیدروژن و اکسیژن")}
      {label(180, 76, "۲H₂  +  O₂  →  ۲H₂O", "#0f172a")}
      <rect x="35" y="98" width="290" height="52" rx="12" fill="#eff6ff" stroke="#93c5fd"/>
      {label(180, 120, "۴ اتم هیدروژن + ۲ اتم اکسیژن")}
      {label(180, 138, "→ دو مولکول آب", "#1d4ed8")}
      {label(180, 184, "تعداد اتم‌های هر عنصر پیش و پس از واکنش برابر است")}
      {label(180, 204, "معادله موازنه‌شده")}
    </svg>
  );
  if (id === "ph-scale") return (
    <svg {...frame} aria-label="مقیاس پی اچ">
      {title("مقیاس اسیدی و بازی — pH")}
      {Array.from({length: 14}, (_, i) => (
        <g key={i}>
          <rect x={22 + i * 22.5} y="82" width="21" height="30" rx="3" fill={i < 6 ? "#fca5a5" : i === 6 ? "#86efac" : "#93c5fd"}/>
          <text x={32.5 + i * 22.5} y="101" fontSize="9" textAnchor="middle" fill="#0f172a">{i + 1}</text>
        </g>
      ))}
      {label(78, 68, "اسیدی", "#b91c1c")}{label(180, 68, "خنثی", "#166534")}{label(280, 68, "بازی", "#1d4ed8")}
      {label(180, 158, "کمتر از ۷: اسیدی   |   ۷: خنثی   |   بیشتر از ۷: بازی")}
      {label(180, 184, "این مقیاس در محلول‌های آبی کاربرد دارد")}
    </svg>
  );
  if (id === "states-of-matter") return (
    <svg {...frame} aria-label="حالت های ماده">
      {title("سه حالت رایج ماده")}
      {[
        {x:62, name:"جامد", pts:[[45,83],[65,83],[45,103],[65,103],[45,123],[65,123]]},
        {x:180, name:"مایع", pts:[[157,95],[177,88],[197,98],[165,115],[188,120],[202,112]]},
        {x:298, name:"گاز", pts:[[270,78],[305,92],[285,112],[315,128],[270,140],[302,150]]},
      ].map((g) => <g key={g.name}>{g.pts.map(([x,y],i)=><circle key={i} cx={x} cy={y} r="5" fill="#2563eb"/>)}{label(g.x, 178, g.name)}</g>)}
      {label(180, 202, "تفاوت اصلی: میزان نظم و فاصله ذره‌ها")}
    </svg>
  );
  if (id === "light-reflection") return (
    <svg {...frame} aria-label="بازتاب نور">
      {title("بازتاب نور از آینه")}
      <line x1="55" y1="150" x2="305" y2="150" stroke="#64748b" strokeWidth="5"/>
      <line x1="180" y1="48" x2="180" y2="194" stroke="#94a3b8" strokeDasharray="5 4"/>
      <line x1="95" y1="65" x2="180" y2="150" stroke="#dc2626" strokeWidth="3"/>
      <line x1="180" y1="150" x2="265" y2="65" stroke="#2563eb" strokeWidth="3"/>
      {label(105, 85, "پرتو تابش", "#b91c1c")}{label(255, 85, "پرتو بازتاب", "#1d4ed8")}
      {label(180, 202, "آینه افقی؛ خط عمود عمودی است")}
    </svg>
  );
  if (id === "refraction") return (
    <svg {...frame} aria-label="شکست نور">
      {title("شکست نور هنگام ورود به آب")}
      <rect x="30" y="112" width="300" height="80" rx="5" fill="#dbeafe" opacity=".8"/>
      <line x1="180" y1="48" x2="180" y2="192" stroke="#64748b" strokeDasharray="5 4"/>
      <line x1="95" y1="52" x2="180" y2="112" stroke="#dc2626" strokeWidth="3"/>
      <line x1="180" y1="112" x2="220" y2="190" stroke="#2563eb" strokeWidth="3"/>
      {label(90, 42, "هوا")}{label(75, 178, "آب")}
      {label(180, 210, "با تغییر محیط، مسیر نور تغییر می‌کند")}
    </svg>
  );
  if (id === "magnetic-field") return (
    <svg {...frame} aria-label="میدان مغناطیسی آهنربا">
      {title("میدان مغناطیسی آهنربا")}
      <rect x="130" y="90" width="50" height="48" rx="5" fill="#ef4444"/>
      <rect x="180" y="90" width="50" height="48" rx="5" fill="#2563eb"/>
      {label(155, 119, "N", "#fff")}{label(205, 119, "S", "#fff")}
      <path d="M130 92 C95 35 265 35 230 92 M130 138 C95 195 265 195 230 138" stroke="#7c3aed" strokeWidth="2" fill="none"/>
      {label(180, 207, "خطوط میدان بیرون آهنربا از N به S هستند")}
    </svg>
  );
  return null;
}
