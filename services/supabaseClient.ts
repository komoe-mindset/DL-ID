
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ebxcirakgqzefjfdxvao.supabase.co';
const supabaseAnonKey = 'sb_publishable_gdqjrCOPmseQiTPXE8jDMw_V1dn1qiR';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
