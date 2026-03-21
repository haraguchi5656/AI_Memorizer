import Link from 'next/link';
import { useRouter } from 'next/router';

export async function getServerSideProps() {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000';

  const res = await fetch(`${baseUrl}/api/articles`);
  const articles = await res.json();

  return { props: { articles } };
}

export default function Index({ articles }) {
  const router = useRouter();
  const publicCount = articles.filter((a) => a.status === 'public').length;

  return (
    <div className="container">
      <div className="header">
        <h1>記事投稿サイト プロトタイプ</h1>
        <p>現在 {publicCount} 記事を掲載中</p>
      </div>

      <div className="article-list">
        <ul>
          {articles
            .filter((a) => a.status !== 'archived')
            .map((article) => (
              <li key={article.id}>
                <Link href={`/articles/${article.id}`} className="article-title-link">
                  {article.title}
                </Link>
              </li>
            ))}
        </ul>
      </div>

      <div className="button-container">
        <Link href="/articles/new" className="new-article-button">
          筆を執る！
        </Link>
      </div>
    </div>
  );
}
