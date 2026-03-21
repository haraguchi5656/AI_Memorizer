# AI_Memorizer

Next.js + Supabase で構築されたブログ形式のメモ管理アプリケーションです。記事の投稿・編集・削除と、コメント機能を備えています。

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
| フレームワーク | Next.js 14（Pages Router） |
| ホスティング | Vercel (Hobby) |
| データベース | Supabase (PostgreSQL) |
| スタイル | CSS (globals.css) |

## アーキテクチャ

```
ブラウザ → Vercel (Next.js pages + API Routes) → Supabase (PostgreSQL)
```

- `SUPABASE_SERVICE_ROLE_KEY` は API Routes（サーバーサイド）のみで使用
- ブラウザから直接 Supabase を叩かない

## セットアップ

### 前提条件

- Node.js 18+
- Supabase アカウント

### インストール手順

```bash
git clone <repository-url>
cd AI_Memorizer
npm install

# .env.local を作成
cp .env.local.example .env.local
# .env.local に Supabase の URL と service_role キーを記入

npm run dev
# → http://localhost:3000
```

詳細は [SETUP_GUIDE.md](./SETUP_GUIDE.md) を参照してください。

## ディレクトリ構成

```
AI_Memorizer/
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

## ライセンス

[LICENSE](./LICENSE) を参照してください。
