# AI_Memorizer — CLAUDE.md

このファイルは Claude Code がプロジェクトの文脈を把握するための情報をまとめたものです。

---

## プロジェクト概要

記事とコメントを管理するブログ形式のメモアプリ。
Next.js + Supabase でクラウド公開している。

---

## 技術スタック

| 項目 | 内容 |
|------|------|
| フレームワーク | Next.js 14（Pages Router） |
| ホスティング | Vercel (Hobby) |
| DB | Supabase (PostgreSQL) |
| 認証 | なし（現状は公開アプリ） |

---

## アーキテクチャ

```
ブラウザ → Vercel (Next.js pages + API Routes) → Supabase (PostgreSQL)
```

- `SUPABASE_SERVICE_ROLE_KEY` は API Routes（サーバーサイド）のみで使用し、ブラウザには渡らない
- 環境変数は Vercel の Environment Variables に設定する（`.env.local` はローカル専用）

---

## 主要ファイル

| ファイル | 役割 |
|---------|------|
| `lib/supabase.js` | Supabase クライアント（サーバーサイド専用） |
| `pages/index.js` | 記事一覧（archived 非表示、public カウント） |
| `pages/articles/[id].js` | 記事詳細 + コメント一覧・投稿・削除 |
| `pages/articles/new.js` | 記事新規作成フォーム（ArticleForm コンポーネントも定義） |
| `pages/articles/[id]/edit.js` | 記事編集フォーム（ArticleForm を new.js からインポート） |
| `pages/api/articles/index.js` | GET 一覧 / POST 作成 |
| `pages/api/articles/[id].js` | GET 詳細 / PUT 更新 / DELETE 削除 |
| `pages/api/articles/[id]/comments/index.js` | POST コメント作成 |
| `pages/api/articles/[id]/comments/[commentId].js` | DELETE コメント削除 |
| `styles/globals.css` | 全スタイル |
| `SETUP_GUIDE.md` | Supabase〜Vercel デプロイまでの手順書 |

---

## ビジネスロジック

- 記事・コメントのステータスは `public` / `private` / `archived` の 3 種類
- `archived` 記事は一覧に表示しない
- `public_count` は `status === 'public'` の記事数
- バリデーションは API Route 内の JS で実施

---

## 開発ルール

- **説明・返答はすべて日本語**で行う
- コードは過不足なく、必要な変更のみ行う
- `.env.local` は絶対に Git にコミットしない
- API Route は必ずサーバーサイドで Supabase に接続する（ブラウザから直接 Supabase を叩かない）

---

## Git ブランチ運用

| ブランチ | 用途 |
|---------|------|
| `main` | 安定版 |
| `feature/nextjs-supabase-migration` | 現在の作業ブランチ |

---

## ローカル開発手順

```bash
npm install
# .env.local に SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY を記入
npm run dev
# → http://localhost:3000
```

詳細は `SETUP_GUIDE.md` を参照。
