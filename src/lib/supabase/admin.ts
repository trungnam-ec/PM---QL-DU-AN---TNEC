import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client dùng SERVICE ROLE KEY — CHỈ dùng phía server (route handler).
 * TUYỆT ĐỐI không import vào component client.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceKey) {
    throw new Error('Thiếu SUPABASE_SERVICE_ROLE_KEY trong biến môi trường.');
  }

  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
