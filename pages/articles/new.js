import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function NewArticle() {
  const router = useRouter();
  const [form, setForm] = useState({ title: '', body: '', status: 'public' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    const res = await fetch('/api/articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    if (res.status === 201) {
      const article = await res.json();
      router.push(`/articles/${article.id}`);
    } else {
      const data = await res.json();
      setErrors(data.errors || { general: [data.error || '保存に失敗しました'] });
      setSubmitting(false);
    }
  }

  return (
    <div className="container">
      <h1>新規記事</h1>
      <ArticleForm
        form={form}
        setForm={setForm}
        errors={errors}
        onSubmit={handleSubmit}
        submitting={submitting}
        submitLabel="記事を作成"
      />
      <div style={{ marginTop: '12px' }}>
        <Link href="/" className="action-button back-button">
          戻る
        </Link>
      </div>
    </div>
  );
}

export function ArticleForm({ form, setForm, errors, onSubmit, submitting, submitLabel }) {
  return (
    <div className="form-container">
      {errors.general && (
        <div className="flash flash-error">{errors.general.join(', ')}</div>
      )}
      <form className="article-form" onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="title">タイトル</label>
          <input
            id="title"
            type="text"
            className="form-control"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          {errors.title?.map((msg) => (
            <div key={msg} className="error-message">{msg}</div>
          ))}
        </div>

        <div className="form-group">
          <label htmlFor="body">本文</label>
          <textarea
            id="body"
            rows={10}
            className="form-control"
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
          />
          {errors.body?.map((msg) => (
            <div key={msg} className="error-message">{msg}</div>
          ))}
        </div>

        <div className="form-group">
          <label htmlFor="status">ステータス</label>
          <select
            id="status"
            className="form-control"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="public">public</option>
            <option value="private">private</option>
            <option value="archived">archived</option>
          </select>
          {errors.status?.map((msg) => (
            <div key={msg} className="error-message">{msg}</div>
          ))}
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? '保存中...' : submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
