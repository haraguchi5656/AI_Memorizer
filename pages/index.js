import Link from 'next/link';
import { useRouter } from 'next/router';
import supabase from '../lib/supabase';

export async function getServerSideProps() {
  const { data: articles, error } = await supabase
    .from('articles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return { props: { articles: [] } };
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
          執筆！
        </Link>
      </div>
    </div>
  );
}
