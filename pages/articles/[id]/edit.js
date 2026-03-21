import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArticleForm } from '../new';
import supabase from '../../../lib/supabase';

export async function getServerSideProps({ params }) {
  const { data: article, error } = await supabase
    .from('articles')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error) return { notFound: true };
  return { props: { article } };
}

export default function EditArticle({ article }) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: article.title,
    body: article.body,
    status: article.status,
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    const res = await fetch(`/api/articles/${article.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      router.push(`/articles/${article.id}`);
    } else {
      const data = await res.json();
      setErrors(data.errors || { general: [data.error || '保存に失敗しました'] });
      setSubmitting(false);
    }
  }

  return (
    <div className="container">
      <h1>記事の編集</h1>
      <ArticleForm
        form={form}
        setForm={setForm}
        errors={errors}
        onSubmit={handleSubmit}
        submitting={submitting}
        submitLabel="更新する"
      />
      <div style={{ marginTop: '12px' }}>
        <Link href={`/articles/${article.id}`} className="action-button back-button">
          戻る
        </Link>
      </div>
    </div>
  );
}
