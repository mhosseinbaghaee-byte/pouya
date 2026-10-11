-- دانش مشترک پویا: آنچه از گفتگوهای آموزشی یاد گرفته برای همه کاربران
CREATE TABLE IF NOT EXISTS pouya_shared_brain (
  q_key TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  level TEXT,
  hits INTEGER NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS pouya_shared_brain_updated_idx
  ON pouya_shared_brain (updated_at DESC);
