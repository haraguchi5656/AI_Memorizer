# セットアップ手順書

Next.js + Supabase 版 AI_Memorizer を公開するまでの手順です。

---

## 1. Node.js のインストール

https://nodejs.org/ja/ から LTS 版をダウンロードしてインストール。

---

## 2. Supabase プロジェクトの作成

1. https://supabase.com でアカウント作成 → **「New project」**
2. Project name・Password・Region（Tokyo）を設定して作成

---

## 3. データベースの作成

**「SQL Editor」** に以下を貼り付けて実行。

```sql
create table articles (
  id bigint generated always as identity primary key,
  title text not null,
  body text not null,
  status text not null check (status in ('public', 'private', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table comments (
  id bigint generated always as identity primary key,
  commenter text not null,
  body text not null,
  status text not null check (status in ('public', 'private', 'archived')),
  article_id bigint not null references articles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger articles_updated_at before update on articles
  for each row execute function update_updated_at();
create trigger comments_updated_at before update on comments
  for each row execute function update_updated_at();

alter table articles enable row level security;
alter table comments enable row level security;
```

---

## 4. 接続情報を控える

**「Project Settings」→「API Keys」** を開く。

| 環境変数名 | 場所 |
|-----------|------|
| `SUPABASE_URL` | ページ上部の `https://xxxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret key（「Reveal」で表示） |

> Secret key は絶対に公開しないでください。

---

## 5. ローカル動作確認

```bash
cd AI_Memorizer
npm install

# .env.local を作成
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...

npm run dev
# → http://localhost:3000
```

---

## 6. GitHub へのプッシュ

```bash
git add .
git commit -m "初回コミット"
git push origin main
```

---

## 7. Vercel へのデプロイ

1. https://vercel.com で GitHub アカウントでサインイン
2. **「Add New > Project」** → `AI_Memorizer` を選択
3. Framework Preset が `Next.js` になっていることを確認（Root Directory は空欄）
4. **「Environment Variables」** に `SUPABASE_URL` と `SUPABASE_SERVICE_ROLE_KEY` を追加
5. **「Deploy」** をクリック

デプロイ後、発行された URL にアクセスして動作確認。

### 以後の更新

```bash
git add .
git commit -m "変更内容"
git push origin main
```

push するたびに Vercel が自動デプロイします。

---

## 8. UptimeRobot で死活監視

Supabase 無料プランは 7 日間アクセスがないと停止します。

1. https://uptimerobot.com で無料アカウントを作成
2. **「Add New Monitor」** で以下を設定して保存

| 項目 | 設定値 |
|------|--------|
| Monitor Type | `HTTP(s)` |
| Friendly Name | `AI Memorizer` |
| URL | Vercel の公開 URL |
| Monitoring Interval | `Every 3 days` |
