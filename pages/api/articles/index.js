import supabase from '../../../lib/supabase';

const VALID_STATUSES = ['public', 'private', 'archived'];

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const { title, body, status } = req.body;

    if (!title || !title.trim()) {
      return res.status(422).json({ errors: { title: ['タイトルを入力してください'] } });
    }
    if (!body || !body.trim()) {
      return res.status(422).json({ errors: { body: ['本文を入力してください'] } });
    }
    if (!VALID_STATUSES.includes(status)) {
      return res.status(422).json({ errors: { status: ['ステータスが無効です'] } });
    }

    const { data, error } = await supabase
      .from('articles')
      .insert([{ title: title.trim(), body: body.trim(), status }])
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
