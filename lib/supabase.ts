import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bzjncsibbvhwvptfndne.supabase.co';
const supabaseAnonKey = 'sb_publishable_S8Z8-A202hgeLp1gBQvSKQ_nncdaewG';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
