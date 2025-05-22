import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../../../../lib/supabaseClient'; // Adjust path as needed

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user_id = 'user_123'; // Placeholder for actual user ID from auth
  const { id: project_id, versionId } = req.query;

  if (typeof project_id !== 'string' || typeof versionId !== 'string') {
    return res.status(400).json({ error: 'Project ID and Version ID are required and must be strings.' });
  }

  if (req.method === 'GET') {
    try {
      // First, verify the project exists and belongs to the user
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('id')
        .eq('id', project_id)
        .eq('user_id', user_id)
        .single();

      if (projectError || !project) {
        return res.status(404).json({ error: 'Project not found or access denied.' });
      }

      // Fetch the specific version by its ID, ensuring it belongs to the correct project
      const { data: version, error: versionError } = await supabase
        .from('versions')
        .select('*') // Select all fields, including changes_json
        .eq('id', versionId)
        .eq('project_id', project_id) // Crucial: ensure version belongs to the project
        .single();

      if (versionError) {
        console.error('Error fetching version:', versionError);
        // Differentiate between not found and other errors if possible
        if (versionError.code === 'PGRST116') { // PostgREST error for " exactamente uma linha esperada, mas 0 linhas foram encontradas" (exactly one row expected, but 0 rows found)
             return res.status(404).json({ error: 'Version not found for this project.' });
        }
        return res.status(500).json({ error: `Error fetching version: ${versionError.message}` });
      }

      if (!version) {
        return res.status(404).json({ error: 'Version not found for this project.' });
      }

      res.status(200).json(version);
    } catch (error: any) {
      console.error('Unexpected error in GET /versions/[versionId]:', error);
      res.status(500).json({ error: `An unexpected error occurred: ${error.message}` });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
