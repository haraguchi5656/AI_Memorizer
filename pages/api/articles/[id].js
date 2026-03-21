import supabase from '../../../lib/supabase';

const VALID_STATUSES = ['public', 'private', 'archived'];

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('articles')
      .select('*, comments(*)')
      .eq('id', id)
      .single();

    if (error) return res.status(404).json({ error: '記事が見つかりません' });
    return res.status(200).json(data);
  }

  if (req.method === 'PUT') {
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
      .update({ title: title.trim(), body: body.trim(), status })
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'DELETE') {
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(204).end();
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
