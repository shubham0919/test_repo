import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabaseClient'; // Adjust path to your Supabase client

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body.email;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 });
    }

    // Check if email already exists (optional, but good for user experience)
    const { data: existingEntry, error: selectError } = await supabase
      .from('waitlist_entries')
      .select('email')
      .eq('email', email)
      .single();

    if (selectError && selectError.code !== 'PGRST116') { // PGRST116: row not found
      console.error('Error checking existing waitlist email:', selectError);
      return NextResponse.json({ error: 'Error checking email. Please try again.' }, { status: 500 });
    }

    if (existingEntry) {
      return NextResponse.json({ message: 'You are already on the waitlist!' }, { status: 200 });
    }

    // Insert new email
    const { error: insertError } = await supabase
      .from('waitlist_entries')
      .insert({ email });

    if (insertError) {
      console.error('Error inserting email into waitlist:', insertError);
      // Could be a unique constraint violation if somehow missed by the above check, or other DB error
      if (insertError.code === '23505') { // unique_violation
         return NextResponse.json({ message: 'You are already on the waitlist! (verified on insert)' }, { status: 200 });
      }
      return NextResponse.json({ error: 'Failed to add email to waitlist. Please try again.' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Successfully joined the waitlist! We will be in touch.' }, { status: 201 });

  } catch (error: any) {
    console.error('Waitlist API error:', error);
    if (error.name === 'SyntaxError') { // From await req.json() if body is not valid JSON
        return NextResponse.json({ error: 'Invalid request format.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
