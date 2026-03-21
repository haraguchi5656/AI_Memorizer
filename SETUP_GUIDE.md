# セットアップ手順書

Next.js + Supabase 版 AI_Memorizer を公開するまでの全手順です。
上から順に進めてください。

---

## 目次

1. [Node.js のインストール](#1-nodejs-のインストール)
2. [Supabase プロジェクトの作成](#2-supabase-プロジェクトの作成)
3. [データベーステーブルの作成](#3-データベーステーブルの作成)（[3-2. RLS の設定](#3-2-rlsrow-level-securityの設定)）
4. [Supabase の接続情報を控える](#4-supabase-の接続情報を控える)（新キー / 旧キー対応）
5. [ローカル環境の準備と動作確認](#5-ローカル環境の準備と動作確認)
6. [GitHub へのプッシュ](#6-github-へのプッシュ)
7. [Vercel へのデプロイ](#7-vercel-へのデプロイ)
8. [UptimeRobot で死活監視を設定](#8-uptimerobot-で死活監視を設定)
9. [動作確認チェックリスト](#9-動作確認チェックリスト)

---

## 1. Node.js のインストール

Next.js を動かすために Node.js が必要です。

1. https://nodejs.org/ja/ を開く
2. **LTS（推奨版）** と書かれたボタンをクリックしてインストーラーをダウンロード
3. ダウンロードした `.msi` ファイルを実行し、画面の指示に従ってインストール
4. インストール完了後、**PowerShell（またはコマンドプロンプト）を新しく開き直して**から以下を実行して確認

```
node --version
npm --version
```

どちらもバージョン番号が表示されれば OK です。

---

## 2. Supabase プロジェクトの作成

1. https://supabase.com を開く
2. **「Start your project」** をクリック
3. GitHub アカウントでサインイン（持っていない場合は GitHub を先に作成）
4. ダッシュボードで **「New project」** をクリック
5. 以下の項目を入力して **「Create new project」** をクリック

   | 項目 | 入力内容 |
   |------|---------|
   | Organization | デフォルトのまま（自分のユーザー名） |
   | Project name | `memorizer`（任意） |
   | Database Password | 安全なパスワードを設定（後で使わないので何でも可） |
   | Region | `Northeast Asia (Tokyo)` を選択 |

6. プロジェクトのセットアップに **1〜2分** かかります。画面が切り替わるまで待ちます。

---

## 3. データベーステーブルの作成

1. Supabase ダッシュボードの左サイドバーから **「SQL Editor」** をクリック
2. 中央の入力欄に以下の SQL を**すべてコピー＆ペースト**する

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
```

3. **「Run」** ボタン（または `Ctrl + Enter`）をクリック
4. 画面下部に `Success. No rows returned` と表示されれば成功
5. 左サイドバーの **「Table Editor」** を開き、`articles` と `comments` の 2 テーブルが存在することを確認

### 3-2. RLS（Row Level Security）の設定

Supabase ではテーブルをデフォルトで公開状態にしないよう、RLS を有効化しておく必要があります。
**同じ SQL Editor** に以下を貼り付けて実行してください。

```sql
-- RLS を有効化（外部からの直接アクセスを遮断）
alter table articles enable row level security;
alter table comments enable row level security;
```

> **なぜ RLS が必要か？**
> Supabase では `anon`（匿名）キーや Publishable キーを使えばブラウザから直接テーブルを読み書きできます。
> RLS を有効にしておくと、ポリシーを定義しない限りすべてのアクセスが拒否されます。
> このアプリは Secret キー（または旧 `service_role` キー）を使う API Route 経由でのみ DB にアクセスするため、
> 追加のポリシー設定は不要です（Secret キー / `service_role` キーは RLS をバイパスします）。

---

## 4. Supabase の接続情報を控える

> **2025年6月以降の新規プロジェクトは「新キー方式」が適用されます。**
> 旧キー（`eyJ...` 形式）と新キー（`sb_secret_...` 形式）でタブの場所が異なります。
> 以下の手順でどちらか該当する方を確認してください。

### 4-1. 新キー方式（`sb_secret_...`）の場合 ← 2025年6月以降の新規プロジェクトはこちら

1. 左サイドバーの **「Project Settings」**（歯車アイコン）をクリック
2. **「API Keys」** タブを開く
3. **「Publishable key」** と **「Secret key」** が表示される
   - 「Secret key」は初期状態で非表示になっているので **「Reveal」** をクリックして表示
4. 以下の 2 つの値をメモ帳などに控える

   | 項目 | 場所 | 環境変数名 |
   |------|------|-----------|
   | **Project URL** | ページ上部の `https://xxxx.supabase.co` | `SUPABASE_URL` |
   | **Secret key** | `sb_secret_...` で始まる文字列 | `SUPABASE_SERVICE_ROLE_KEY` |

   > **注意:** Secret key は管理者権限を持つ秘密情報です。
   > 絶対に GitHub や SNS に公開しないでください。
   > 操作は組織の監査ログに記録され、即時失効させることも可能です。

### 4-2. 旧キー方式（`eyJ...`）の場合 ← 既存プロジェクトや Legacy タブが表示される場合

1. 左サイドバーの **「Project Settings」** をクリック
2. **「API」** タブ → **「Legacy API Keys」** タブを開く
3. 以下の 2 つの値をメモ帳などに控える

   | 項目 | 場所 | 環境変数名 |
   |------|------|-----------|
   | **Project URL** | `https://xxxx.supabase.co` の形式 | `SUPABASE_URL` |
   | **service_role キー** | `eyJ...` で始まる長い文字列 | `SUPABASE_SERVICE_ROLE_KEY` |

   > **注意:** `service_role` キーも同様に秘密情報です。公開しないでください。

---

## 5. ローカル環境の準備と動作確認

### 5-1. 依存パッケージのインストール

PowerShell（またはコマンドプロンプト）を開き、以下を実行します。

```
cd C:\Users\tokir\Desktop\AIeditFolder\AI_Memorizer\memorizer-next
npm install
```

`node_modules` フォルダが作成されれば完了です（数分かかる場合があります）。

### 5-2. 環境変数ファイルの作成

`memorizer-next` フォルダの中に `.env.local` というファイルを**新規作成**し、以下の内容を記入します。

```
SUPABASE_URL=（手順4で控えた Project URL）
SUPABASE_SERVICE_ROLE_KEY=（手順4で控えた service_role キー）
```

**記入例（新キー方式）:**
```
SUPABASE_URL=https://abcdefghijklmn.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**記入例（旧キー方式）:**
```
SUPABASE_URL=https://abcdefghijklmn.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOi...
```

> `.env.local` は `.gitignore` に登録済みのため、Git にコミットされません。

### 5-3. 開発サーバーの起動

```
npm run dev
```

起動後、ブラウザで http://localhost:3000 を開いてください。
記事一覧画面が表示されれば成功です。

### 5-4. 簡単な動作テスト

1. 「筆を執る！」ボタンから記事を 1 件作成する
2. 記事詳細画面でコメントを投稿する
3. コメントの削除・記事の編集・削除が動作することを確認する
4. Supabase の **Table Editor** を開き、データが保存されていることを確認する

確認できたら `Ctrl + C` でサーバーを停止します。

---

## 6. GitHub へのプッシュ

Vercel のデプロイは GitHub 連携で行います。コードを push しておく必要があります。

```
cd C:\Users\tokir\Desktop\AIeditFolder\AI_Memorizer
git add memorizer-next
git commit -m "Add Next.js + Supabase version"
git push origin main
```

> `.env.local` は `.gitignore` に登録済みのため、自動的に除外されます。
> push 前に `git status` を実行し、`.env.local` が含まれていないことを確認してください。

---

## 7. Vercel へのデプロイ

### 7-1. Vercel アカウントの作成

1. https://vercel.com を開く
2. **「Sign Up」** から GitHub アカウントでサインイン

### 7-2. プロジェクトのインポート

1. ダッシュボードで **「Add New > Project」** をクリック
2. **「Import Git Repository」** から `AI_Memorizer` を選択
3. 以下の設定を行う

   | 項目 | 設定値 |
   |------|--------|
   | **Root Directory** | `memorizer-next` |
   | **Framework Preset** | `Next.js`（自動検出されるはず） |
   | その他 | デフォルトのまま |

   > **Root Directory の設定が重要です。**
   > 「Edit」をクリックして `memorizer-next` と入力してください。

### 7-3. 環境変数の設定

「Environment Variables」セクションで以下の 2 つを追加します。

| NAME | VALUE |
|------|-------|
| `SUPABASE_URL` | 手順4で控えた Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | 手順4で控えた service_role キー |

### 7-4. デプロイ実行

**「Deploy」** ボタンをクリックします。
1〜2 分後にビルドが完了し、`https://memorizer-next-xxxx.vercel.app` のような URL が発行されます。

その URL をブラウザで開いて動作確認してください。

### 7-5. 以後の更新方法

```
git add .
git commit -m "変更内容"
git push origin main
```

push するたびに Vercel が自動でビルド＆デプロイします。

---

## 8. UptimeRobot で死活監視を設定

Supabase の無料プロジェクトは **7 日間アクセスがないと一時停止**されます。
UptimeRobot（無料）を使って定期的に ping することで停止を防ぎます。

1. https://uptimerobot.com を開き、無料アカウントを作成
2. **「Add New Monitor」** をクリック
3. 以下を設定して保存

   | 項目 | 設定値 |
   |------|--------|
   | Monitor Type | `HTTP(s)` |
   | Friendly Name | `AI Memorizer` |
   | URL | Vercel の公開 URL（例: `https://memorizer-next-xxxx.vercel.app`） |
   | Monitoring Interval | `Every 3 days`（3 日ごと） |

---

## 9. 動作確認チェックリスト

デプロイ完了後、以下をすべて確認してください。

- [ ] 公開 URL にブラウザからアクセスできる
- [ ] 記事が作成できる
- [ ] 記事一覧に作成した記事が表示される（`archived` は非表示）
- [ ] 記事を編集できる
- [ ] 記事を削除できる
- [ ] コメントを投稿できる
- [ ] コメントを削除できる
- [ ] Supabase の Table Editor でデータが保存されている
- [ ] UptimeRobot のモニターが `UP` 状態になっている

---

## トラブルシューティング

### `npm install` でエラーが出る

Node.js のインストール後、ターミナルを**再起動**してから再試行してください。

### `npm run dev` で `SUPABASE_URL is undefined` のようなエラーが出る

`.env.local` ファイルが `memorizer-next` フォルダ内に存在するか確認してください。
ファイル名が `.env.local.example` のままになっていないか確認してください。

### Vercel デプロイ後に API がエラーになる

Vercel ダッシュボードの **「Settings > Environment Variables」** に
`SUPABASE_URL` と `SUPABASE_SERVICE_ROLE_KEY` が正しく設定されているか確認してください。
設定後は **「Deployments」** から **「Redeploy」** を実行してください。

### Supabase にデータが保存されない

**新キー方式（`sb_secret_...`）の場合:**
Supabase の **「Project Settings > API Keys」** で Secret key を再確認してください。
「Reveal」をクリックして表示した値を `.env.local` にコピーし直してください（途中で切れていないか確認）。

**旧キー方式（`eyJ...`）の場合:**
Supabase の **「Project Settings > API > Legacy API Keys」** で `service_role` キーを再確認し、
`.env.local` にコピーし直してください（途中で切れていないか確認）。
