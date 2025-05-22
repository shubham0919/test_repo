import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../../../lib/supabaseClient'; // Adjust path as needed

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user_id = 'user_123'; // Placeholder for actual user ID from auth
  const { id: project_id } = req.query;

  if (typeof project_id !== 'string') {
    return res.status(400).json({ error: 'Project ID is required and must be a string.' });
  }

  if (req.method === 'GET') {
    try {
      // First, verify the project exists and belongs to the user (optional but good practice)
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('id')
        .eq('id', project_id)
        .eq('user_id', user_id) // Ensure the project belongs to the authenticated user
        .single();

      if (projectError || !project) {
        return res.status(404).json({ error: 'Project not found or access denied.' });
      }

      // Fetch versions for the project, ordered by creation date or version number
      const { data: versions, error: versionsError } = await supabase
        .from('versions')
        .select('id, project_id, version, created_at') // Exclude changes_json for list view to keep it light
        .eq('project_id', project_id)
        .order('created_at', { ascending: false }); // Or order by version::integer if it's an integer

      if (versionsError) {
        console.error('Error fetching versions:', versionsError);
        return res.status(500).json({ error: `Error fetching versions: ${versionsError.message}` });
      }

      res.status(200).json(versions);
    } catch (error: any) {
      console.error('Unexpected error in GET /versions:', error);
      res.status(500).json({ error: `An unexpected error occurred: ${error.message}` });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
