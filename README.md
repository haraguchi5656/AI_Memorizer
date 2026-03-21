# AI_Memorizer

Next.js + Supabase で構築されたブログ形式のメモ管理アプリです。記事の投稿・編集・削除とコメント機能を備えています。

## 機能

- 記事の一覧表示・詳細表示・新規作成・編集・削除
- 公開ステータス管理（`public` / `private` / `archived`）
- 記事に対するコメントの投稿・削除

## 技術スタック

| カテゴリ | 技術 |
|----------|------|
| フレームワーク | Next.js 14（Pages Router） |
| ホスティング | Vercel |
| データベース | Supabase (PostgreSQL) |

## アーキテクチャ

```
ブラウザ → Vercel (Next.js API Routes) → Supabase (PostgreSQL)
```

`SUPABASE_SERVICE_ROLE_KEY` はサーバーサイド（API Routes）のみで使用し、ブラウザには渡しません。

## セットアップ

前提条件: Node.js 18+、Supabase アカウント

```bash
git clone <repository-url>
cd AI_Memorizer
npm install

# .env.local を作成し、以下を記入
# SUPABASE_URL=...
# SUPABASE_SERVICE_ROLE_KEY=...

npm run dev
# → http://localhost:3000
```

詳細は [SETUP_GUIDE.md](./SETUP_GUIDE.md) を参照してください。

## ディレクトリ構成

```
pages/
  index.js                        # 記事一覧
  articles/
    new.js                        # 新規作成
    [id].js                       # 記事詳細 + コメント
    [id]/edit.js                  # 記事編集
  api/articles/
    index.js                      # GET 一覧 / POST 作成
    [id].js                       # GET 詳細 / PUT 更新 / DELETE 削除
    [id]/comments/
      index.js                    # POST コメント作成
      [commentId].js              # DELETE コメント削除
lib/
  supabase.js                     # Supabase クライアント（サーバーサイド専用）
styles/
  globals.css
```

## ライセンス

[LICENSE](./LICENSE) を参照してください。
