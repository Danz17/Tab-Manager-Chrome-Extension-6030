import { createClient } from '@supabase/supabase-js';

// Project ID will be auto-injected during deployment
const SUPABASE_URL = 'https://vwwtwrxrlyopqlbcstpx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3d3R3cnhybHlvcHFsYmNzdHB4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2MzY4NzMsImV4cCI6MjA2OTIxMjg3M30._mI54cUnKJ-YJZy2H1Bmwklf1082i59IyyW-BJgYAEc';

if (SUPABASE_URL === 'https://<PROJECT-ID>.supabase.co' || SUPABASE_ANON_KEY === '<ANON_KEY>') {
  throw new Error('Missing Supabase variables');
}

export default createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});