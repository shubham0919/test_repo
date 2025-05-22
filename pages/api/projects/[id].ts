import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabaseClient'; // Assuming supabase client is configured

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user_id = 'user_123'; // Placeholder for actual user ID from auth
  const { id } = req.query;

  if (req.method === 'DELETE') {
    try {
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Project ID is required' });
      }

      // Verify the project belongs to the user before deleting
      const { data: project, error: selectError } = await supabase
        .from('projects')
        .select('id')
        .eq('id', id)
        .eq('user_id', user_id)
        .single();

      if (selectError || !project) {
        return res.status(404).json({ error: 'Project not found or access denied' });
      }

      const { error: deleteError } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)
        .eq('user_id', user_id); // Ensure user owns the project

      if (deleteError) throw deleteError;
      res.status(200).json({ message: 'Project deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
