import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../../lib/supabaseClient'; // Adjust path to supabaseClient

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user_id = 'user_123'; // Placeholder for actual user ID from auth
  const { id: project_id } = req.query; // Project ID from the URL path

  if (typeof project_id !== 'string') {
    return res.status(400).json({ error: 'Project ID is required and must be a string.' });
  }

  // First, verify the project exists and belongs to the user
  try {
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', project_id)
      .eq('user_id', user_id)
      .single();

    if (projectError || !project) {
      return res.status(404).json({ error: 'Project not found or access denied.' });
    }
  } catch (error: any) {
    return res.status(500).json({ error: `Error verifying project: ${error.message}` });
  }

  // Now handle token operations
  if (req.method === 'GET') {
    try {
      const { data: tokens, error } = await supabase
        .from('tokens')
        .select('*')
        .eq('project_id', project_id);

      if (error) throw error;
      res.status(200).json(tokens);
    } catch (error: any) {
      res.status(500).json({ error: `Error fetching tokens: ${error.message}` });
    }
  } else if (req.method === 'POST') {
    try {
      const { name, type, value } = req.body;
      if (!name || !type || !value) {
        return res.status(400).json({ error: 'Token name, type, and value are required' });
      }

      const { name, type, value } = req.body;
      if (!name || !type || !value) {
        return res.status(400).json({ error: 'Token name, type, and value are required' });
      }

      // Start a transaction
      const { data: newToken, error: tokenInsertError } = await supabase.rpc('add_token_and_create_version', {
        p_project_id: project_id,
        p_token_name: name,
        p_token_type: type,
        p_token_value: value,
        p_user_id: user_id // Pass user_id for project ownership check within the function if needed
      }).single();


      if (tokenInsertError) {
        console.error('Error in add_token_and_create_version RPC:', tokenInsertError);
        // Check for specific error messages if you have custom errors in your PG function
        if (tokenInsertError.message.includes('Project not found or access denied')) {
            return res.status(404).json({ error: 'Project not found or access denied.' });
        }
        return res.status(500).json({ error: `Error creating token and version: ${tokenInsertError.message}` });
      }
      
      // The RPC function now returns the new token, or you might adjust it to return version info
      // For simplicity, let's assume it returns the newly created token as part of a successful operation.
      // If you need the new token data, ensure your RPC function returns it.
      // For now, we'll just return the input data or a success message,
      // as the primary goal is the versioning.
      // A more robust solution would have the RPC return the newly created token.
      // The current RPC structure in the next step will return the new token.
      
      res.status(201).json(newToken); // Assuming RPC returns the new token

    } catch (error: any) {
      // This catch block might be redundant if the RPC call handles errors well,
      // but good for unexpected issues.
      console.error('Unexpected error in POST /tokens:', error);
      res.status(500).json({ error: `Error creating token: ${error.message}` });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
