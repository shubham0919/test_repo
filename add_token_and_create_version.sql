CREATE OR REPLACE FUNCTION add_token_and_create_version(
    p_project_id BIGINT,
    p_token_name TEXT,
    p_token_type TEXT,
    p_token_value TEXT,
    p_user_id TEXT -- Assuming user_id is of TEXT type, adjust if it's UUID or BIGINT from your users table
)
RETURNS tokens -- Returns the newly created token record
LANGUAGE plpgsql
SECURITY DEFINER -- Important if you need to bypass RLS for internal operations, ensure function logic is secure
AS $$
DECLARE
    new_token RECORD;
    current_tokens_json JSONB;
    latest_version_number TEXT;
    next_version_number TEXT;
    project_owner_id TEXT; -- Adjust type if necessary
BEGIN
    -- Optional: Verify project ownership if p_user_id is provided and relevant
    -- This check assumes your 'projects' table has a 'user_id' column that matches p_user_id
    -- Adjust schema and types as per your actual 'users' and 'projects' table structure.
    -- If your user_id in 'projects' is BIGINT and p_user_id is the actual user's ID from auth.
    -- For this example, let's assume p_user_id is a string representation of the user's ID.
    -- This step is illustrative; adapt it to your actual auth and schema.
    /*
    SELECT user_id INTO project_owner_id FROM projects WHERE id = p_project_id;
    IF project_owner_id IS NULL THEN
        RAISE EXCEPTION 'Project not found or access denied'; -- Or handle as per your policy
    END IF;
    -- If your p_user_id is from an auth system and needs casting or comparison:
    -- IF project_owner_id::TEXT <> p_user_id THEN
    --     RAISE EXCEPTION 'Project access denied for user %', p_user_id;
    -- END IF;
    */
    
    -- Insert the new token
    INSERT INTO tokens (project_id, name, type, value)
    VALUES (p_project_id, p_token_name, p_token_type, p_token_value)
    RETURNING * INTO new_token;

    -- Determine the next version number (simple incrementing integer as string)
    SELECT MAX(version::INT) INTO latest_version_number
    FROM versions
    WHERE project_id = p_project_id;

    IF latest_version_number IS NULL THEN
        next_version_number := '1';
    ELSE
        next_version_number := (latest_version_number::INT + 1)::TEXT;
    END IF;

    -- Fetch all current tokens for the project to store in changes_json
    -- Ensure this captures all relevant fields of a token.
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', t.id,
            'name', t.name,
            'type', t.type,
            'value', t.value,
            'created_at', t.created_at 
            -- Add any other fields from your 'tokens' table that should be versioned
        ) ORDER BY t.name -- Consistent ordering can help with diffing later
    )
    INTO current_tokens_json
    FROM tokens t
    WHERE t.project_id = p_project_id;

    -- Insert new version entry
    INSERT INTO versions (project_id, version, changes_json)
    VALUES (p_project_id, next_version_number, current_tokens_json);

    RETURN new_token;
END;
$$;
