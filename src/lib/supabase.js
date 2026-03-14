import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://odpmhpqyyshgftrkyjcx.supabase.co',
  'sb_publishable_zrX_YvisW3Ll1j_d2cJKSw_dlBSUr1A'
)

export const isConfigured = () => true
