import supabase from '../../../../../lib/supabase';

export default async function handler(req, res) {
  const { commentId } = req.query;

  if (req.method === 'DELETE') {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(204).end();
  }

  res.setHeader('Allow', ['DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
