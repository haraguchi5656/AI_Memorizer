# AI_Memorizer

Ruby on Rails で構築されたブログ形式のメモ管理アプリケーションです。記事の投稿・編集・削除と、コメント機能を備えています。

## 機能

- **記事管理 (CRUD)**
  - 記事の一覧表示・詳細表示・新規作成・編集・削除
  - タイトルと本文のバリデーション（本文は10文字以上）
  - 公開ステータス管理（`public` / `private` / `archived`）

- **コメント機能**
  - 記事に対するコメントの投稿・削除
  - コメントにも公開ステータスあり

## 技術スタック

| カテゴリ | 技術 |
|----------|------|
| 言語 | Ruby 3.0.2 |
| フレームワーク | Rails 6.1.7 |
| データベース | SQLite3 |
| フロントエンド | Bootstrap 5.1, Webpacker, Turbolinks |
| その他 | dotenv-rails（環境変数管理） |

## セットアップ

### 前提条件

- Ruby 3.0.2
- Node.js / Yarn
- SQLite3

### インストール手順

```bash
# リポジトリのクローン
git clone <repository-url>
cd AI_Memorizer/Rubycode

# gem のインストール
bundle install

# JavaScript パッケージのインストール
yarn install

# データベースの作成とマイグレーション
rails db:create
rails db:migrate

# サーバーの起動
rails server
```

ブラウザで `http://localhost:3000` にアクセスしてください。

## 環境変数

`.ENV` ファイルをプロジェクトルートに作成し、必要な環境変数を設定してください（`dotenv-rails` を使用）。

```
BASIC_AUTH_USER=your_username
BASIC_AUTH_PASSWORD=your_password
```

## ディレクトリ構成

```
Rubycode/
├── app/
│   ├── controllers/
│   │   ├── articles_controller.rb   # 記事の CRUD
│   │   └── comments_controller.rb   # コメントの作成・削除
│   ├── models/
│   │   ├── article.rb               # 記事モデル
│   │   ├── comment.rb               # コメントモデル
│   │   └── concerns/
│   │       └── visible.rb           # 公開ステータスの共通ロジック
│   └── views/
│       ├── articles/                # 記事関連ビュー
│       └── comments/                # コメント関連ビュー
├── config/
│   └── database.yml                 # SQLite3 設定
└── Gemfile
```

---

## Next.js + Supabase 版 (memorizer-next/)

Rails をローカル専用として維持しつつ、ブラウザから誰でもアクセスできるクラウド版を `memorizer-next/` に追加しました。

### 構成

```
ブラウザ → Vercel (Next.js pages + API Routes) → Supabase (PostgreSQL)
```

| サービス | 役割 | 無料枠 |
|----------|------|--------|
| Vercel (Hobby) | Next.js ホスト + API Routes | 100GB 転送 |
| Supabase | PostgreSQL DB | 500MB / 2プロジェクト |
| GitHub | ソース管理 + 自動デプロイ | 無料 |

### セットアップ手順

#### 1. Supabase でテーブル作成

Supabase の SQL エディタで以下を実行:

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

#### 2. ローカル開発

```bash
cd memorizer-next
npm install

# .env.local を作成
cp .env.local.example .env.local
# .env.local に Supabase の URL と service_role キーを記入

npm run dev
# → http://localhost:3000
```

#### 3. Vercel デプロイ

1. GitHub にプッシュ
2. Vercel ダッシュボードでリポジトリを連携
3. 環境変数 `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` を設定
4. 以後 `git push` のたびに自動デプロイ

> **注意:** Supabase 無料プロジェクトは 7 日間非アクティブで一時停止します。
> UptimeRobot（無料）で 3 日おきに ping することで回避できます。

### ディレクトリ構成 (memorizer-next/)

```
memorizer-next/
  pages/
    index.js                      # 記事一覧
    articles/
      new.js                      # 新規作成フォーム
      [id].js                     # 記事詳細 + コメント
      [id]/edit.js                # 編集フォーム
    api/
      articles/
        index.js                  # GET(一覧) / POST(作成)
        [id].js                   # GET(詳細) / PUT(更新) / DELETE(削除)
        [id]/comments/
          index.js                # POST(コメント作成)
          [commentId].js          # DELETE(コメント削除)
  lib/
    supabase.js                   # Supabase クライアント (サーバーサイド専用)
  styles/
    globals.css
  .env.local.example              # 環境変数テンプレート
```

---

## ライセンス

[LICENSE](./LICENSE) を参照してください。
