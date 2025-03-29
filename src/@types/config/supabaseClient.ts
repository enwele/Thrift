import { createClient, SupabaseClient } from '@supabase/supabase-js';

// If running in Node.js, load environment variables using dotenv
// Uncomment the next two lines if you're in a Node environment:
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl: string = process.env.SUPABASE_URL as string;
const supabaseAnonKey: string = process.env.SUPABASE_ANON_KEY as string;

const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;