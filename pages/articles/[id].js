import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export async function getServerSideProps({ params }) {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000';

  const res = await fetch(`${baseUrl}/api/articles/${params.id}`);
  if (!res.ok) return { notFound: true };
  const article = await res.json();

  return { props: { article } };
}

export default function ShowArticle({ article }) {
  const router = useRouter();
  const [comments, setComments] = useState(article.comments || []);
  const [commentForm, setCommentForm] = useState({ commenter: '', body: '', status: 'public' });
  const [commentErrors, setCommentErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  async function handleDelete() {
    if (!confirm('本当に削除しますか？')) return;
    const res = await fetch(`/api/articles/${article.id}`, { method: 'DELETE' });
    if (res.ok) {
      router.push('/');
    } else {
      alert('削除に失敗しました');
    }
  }

  async function handleCommentSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setCommentErrors({});

    const res = await fetch(`/api/articles/${article.id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(commentForm),
    });

    if (res.status === 201) {
      const newComment = await res.json();
      setComments([...comments, newComment]);
      setCommentForm({ commenter: '', body: '', status: 'public' });
    } else {
      const data = await res.json();
      setCommentErrors(data.errors || { general: [data.error || '保存に失敗しました'] });
    }
    setSubmitting(false);
  }

  async function handleCommentDelete(commentId) {
    if (!confirm('Are you sure?')) return;
    const res = await fetch(`/api/articles/${article.id}/comments/${commentId}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      setComments(comments.filter((c) => c.id !== commentId));
    } else {
      alert('削除に失敗しました');
    }
  }

  return (
    <div className="container">
      {/* 記事詳細 */}
      <div className="article">
        <h1>{article.title}</h1>
        <div className="article-content">{article.body}</div>
      </div>

      {/* コメント一覧 */}
      <div className="comments">
        <h2>Comments</h2>
        <div className="comment-list">
          {comments.length === 0 && <p>コメントはまだありません。</p>}
          {comments.map((comment) => (
            <div key={comment.id} className="comment-item">
              <p>
                <strong>Commenter:</strong> {comment.commenter}
              </p>
              <p>
                <strong>Comment:</strong> {comment.body}
              </p>
              <button
                className="comment-delete-link"
                onClick={() => handleCommentDelete(comment.id)}
              >
                コメントを削除
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* コメント投稿フォーム */}
      <div className="comment-form">
        <h2>Add a comment:</h2>
        {commentErrors.general && (
          <div className="flash flash-error">{commentErrors.general.join(', ')}</div>
        )}
        <form onSubmit={handleCommentSubmit}>
          <p>
            <label htmlFor="commenter">Commenter</label>
            <br />
            <input
              id="commenter"
              type="text"
              className="form-control"
              value={commentForm.commenter}
              onChange={(e) => setCommentForm({ ...commentForm, commenter: e.target.value })}
            />
            {commentErrors.commenter?.map((msg) => (
              <span key={msg} className="error-message">{msg}</span>
            ))}
          </p>
          <p>
            <label htmlFor="comment-body">Comment</label>
            <br />
            <textarea
              id="comment-body"
              className="form-control"
              value={commentForm.body}
              onChange={(e) => setCommentForm({ ...commentForm, body: e.target.value })}
            />
            {commentErrors.body?.map((msg) => (
              <span key={msg} className="error-message">{msg}</span>
            ))}
          </p>
          <p>
            <label htmlFor="comment-status">Status</label>
            <br />
            <select
              id="comment-status"
              className="form-control"
              value={commentForm.status}
              onChange={(e) => setCommentForm({ ...commentForm, status: e.target.value })}
            >
              <option value="public">public</option>
              <option value="private">private</option>
              <option value="archived">archived</option>
            </select>
          </p>
          <p>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? '送信中...' : 'Create Comment'}
            </button>
          </p>
        </form>
      </div>

      {/* アクションボタン */}
      <div className="article-actions">
        <ul>
          <li>
            <Link href={`/articles/${article.id}/edit`} className="action-button edit-button">
              編集
            </Link>
          </li>
          <li>
            <button className="action-button delete-button" onClick={handleDelete}>
              削除
            </button>
          </li>
          <li>
            <Link href="/" className="action-button back-button">
              戻る
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
