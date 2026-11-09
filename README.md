# پویا (Pouya)

اپ آموزشی فارسی‌محور با شخصیت انیمیشنی **پویا** — مربی زنده دانش و زبان برای دانش‌آموزان ایران.

**اولویت محصول:** موبایل / اسمارت‌فون  
**دیپلوی فعلی:** [prairie-pine-drift-earth.vercel.app](https://prairie-pine-drift-earth.vercel.app/)

> اسناد داخلی تیم: [`docs/TEAM-HANDOFF.md`](./docs/TEAM-HANDOFF.md) · نقش‌ها: [`docs/phase-a-roles.md`](./docs/phase-a-roles.md)  
> ریپو را بدون تصمیم عمدی Public نکنید. **هرگز کلید API را در README یا کد نگذارید.**

---

## امکانات

| بخش | توضیح |
|-----|--------|
| **گفتگو** | چت متنی، پیوست عکس/جزوه، تاریخچه محلی |
| **زبان** | تمرین مکالمه |
| **مربی‌ها** | انتخاب دستیار / شروع درس |
| **آزمون** | کوییز محلی |
| **مغز دوم** | یادداشت‌ها (Vault) |
| **حساب** | پروفایل / اسکلت نقش مربی–دانش‌آموز |
| **مکالمه صوتی** | فقط با باز کردن کله پویا — TTS پولی |
| **تصویر** | بانک شکل درسی + جستجوی ویکی‌مدیا (فقط محتوای جنسی فیلتر) |

**صدا در چت عادی خاموش است** (نه TTS سرور، نه صدای مرورگر).

---

## معماری جواب (هوش + بانک)

```
سؤال کاربر
    │
    ├─۱─ مغز محلی (pouya-brain)       → فقط در حافظه همان نمونه سرور
    ├─۲─ بانک ثابت (bank-first)       → سلام و تأییدهای کوتاه
    ├─۳─ Gemini                       → فهم و پاسخ هوشمند
    ├─۴─ ارائه‌دهنده اختیاری          → فقط اگر صریحاً تنظیم شده باشد
    └─۵─ پاسخ محلی (library-reply)    → مسیر جایگزین بدون API
         │
         └─ تصویر: بانک شکل → ویکی‌مدیا اینترنت
              └─ جواب خوب مدل در مغز ذخیره می‌شود (دفعه بعد رایگان‌تر)
```

---

## پشته فنی

| بخش | فناوری |
|-----|--------|
| فریم‌ورک | TanStack Start (React 19 + Vite) |
| استایل | Tailwind CSS v4 |
| UI | Radix UI + lucide-react |
| AI | `src/lib/ai.ts` — Gemini → لیارا → محلی |
| تصویر | `src/lib/wiki-image.ts` + `src/lib/lesson-diagrams.ts` |
| دیپلوی | Vercel |

---

## ساختار مهم کد

```
src/
  components/
    pouya-main-core.tsx   # هسته UI، تب‌ها، چت، مکالمه صوتی
    pouya-panes.tsx       # Chat / Live / Quiz / Vault
    rich-text.tsx         # رندر متن، نمودار، زوم تصویر
    pouya-voice-call.tsx  # باکس مکالمه صوتی
  lib/
    ai.ts                 # askPouya / speakPouya / makeQuiz
    pouya-brain.ts        # حافظه یادگیرنده (server warm)
    bank-first.ts         # بانک ثابت کوتاه
    wiki-image.ts         # جستجوی تصویر اینترنت
    lesson-diagrams.ts    # بانک شکل درسی
    library-*.ts          # پاسخ/داده محلی
    chat-history.ts       # تاریخچه چت (localStorage)
    learning-memory.ts    # حافظه یادگیری کاربر (کلاینت)
  routes/
    index.tsx             # ورود به اپ
docs/
  TEAM-HANDOFF.md
  phase-a-roles.md
```

---

## متغیرهای محیطی (Vercel)

| کلید | نقش |
|------|-----|
| `GEMINI_API_KEY` | Gemini (اولویت اول چت) |
| `GEMINI_MODELS` | اختیاری — `gemini-3.8-flash,gemini-3.5-flash-lite,gemini-3.7-flash` |
| `AI_PROVIDER_ORDER` | اگر فقط کلید رایگان گوگل داری: `gemini` |
| `OPENAI_API_KEY` | کلید لیارا / OpenAI-compatible |
| `OPENAI_BASE_URL` | آدرس API لیارا |
| `OPENAI_MODEL` | مدل لیارا (مثلاً `gpt-4o-mini`) |
| `OPENAI_TTS_KEY` | کلید TTS (مکالمه صوتی) |
| `OPENAI_TTS_MODEL` / `OPENAI_TTS_VOICE` | اختیاری — پیش‌فرض `tts-1` / `echo` |
| `DATABASE_URL` | برای حافظه مشترک و نشست‌های پایدار؛ در Vercel باید به DB پایدار مثل Neon وصل شود |
| `GROK_AUTH_CLIENT_ID` / `GROK_AUTH_CLIENT_SECRET` | اعتبارنامه OAuth اختصاصی برنامه؛ بدون آن ورود OAuth فعال نمی‌شود |
| `BETTER_AUTH_URL` | آدرس پایه احراز هویت در محیط Production |

کلیدها فقط در پنل Vercel (یا `.env` محلی غیرکامیت).

**مهم برای Vercel:** اگر `DATABASE_URL` تنظیم نشده باشد، PGLite عمداً در محیط سرورلس اجرا نمی‌شود؛ حافظه مشترک و نشست‌های ورود غیرفعال می‌مانند تا خطای فایل موقت یا نشست ناپایدار ایجاد نشود. برای فعال‌شدن این دو بخش، ابتدا DB پایدار و سپس اعتبارنامه OAuth اختصاصی را تنظیم کن.

---

## اجرا محلی

```bash
npm install
npm run dev
```

اسکریپت‌های مفید: `build` · `typecheck` · `preview`

---

## اصول محصول (خلاصه)

1. **هوشمند باشد** — سؤال بچه را بفهمد؛ مثل ربات کلمات کلیدی نباشد.
2. **مقرون‌به‌صرفه** — Gemini اول؛ بانک/مغز برای تکرار؛ TTS فقط در مکالمه صوتی.
3. **تصویر باز** — هر موضوع دیدنی از اینترنت (ویکی)؛ فقط جنسی فیلتر.
4. **موبایل اول** — UI برای گوشی.
5. **تمیزکاری** — مسیر جواب واحد؛ از لایه‌های متضاد پرهیز شود.

---

## وضعیت و بدهی فنی

- حساب مربی/دانش‌آموز: معماری در `docs/phase-a-roles.md` — پیاده‌سازی کامل بعداً
- مغز یادگیرنده: حافظه محلی هر نمونه؛ حافظه مشترک فقط با `DATABASE_URL` پایدار
- Auth / DB: بدون DB پایدار، ورود و نشست‌های Production عمداً fail-closed هستند

جزئیات برای اعضای تیم: **`docs/TEAM-HANDOFF.md`**
