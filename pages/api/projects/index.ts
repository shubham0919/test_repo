import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabaseClient'; // Assuming supabase client is configured

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user_id = 'user_123'; // Placeholder for actual user ID from auth

  if (req.method === 'GET') {
    try {
      const { data: projects, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user_id);

      if (error) throw error;
      res.status(200).json(projects);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ error: 'Project name is required' });
      }

      const { data: newProject, error } = await supabase
        .from('projects')
        .insert([{ name, user_id }])
        .select()
        .single();

      if (error) throw error;
      res.status(201).json(newProject);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
