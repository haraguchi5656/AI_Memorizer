import supabase from '../../../../../lib/supabase';

const VALID_STATUSES = ['public', 'private', 'archived'];

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'POST') {
    const { commenter, body, status } = req.body;

    if (!commenter || !commenter.trim()) {
      return res.status(422).json({ errors: { commenter: ['投稿者名を入力してください'] } });
    }
    if (!body || !body.trim()) {
      return res.status(422).json({ errors: { body: ['コメントを入力してください'] } });
    }
    if (!VALID_STATUSES.includes(status)) {
      return res.status(422).json({ errors: { status: ['ステータスが無効です'] } });
    }

    const { data, error } = await supabase
      .from('comments')
      .insert([{ commenter: commenter.trim(), body: body.trim(), status, article_id: Number(id) }])
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  }

  res.setHeader('Allow', ['POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
