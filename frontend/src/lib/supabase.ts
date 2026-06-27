import { createClient } from '@supabase/supabase-js'

// ============================================================================
// CONFIGURACIÓN DE SUPABASE
// ----------------------------------------------------------------------------
// Pega aquí los datos de tu proyecto de Supabase.
// Los encuentras en:  Supabase → (tu proyecto) → Settings → API
//   - "Project URL"        →  VITE_SUPABASE_URL
//   - "Project API keys" → "anon" / "public"  →  VITE_SUPABASE_ANON_KEY
//
// La clave "anon" es PÚBLICA por diseño: no pasa nada porque esté aquí, porque
// el acceso real está protegido por el login y las reglas de seguridad (RLS).
// ============================================================================

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://fkirpxcizfezxrsjfafo.supabase.co'
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Y-PjD_VVHe3QtuzTHAVXyg_AqUkJ2j9'

export const isSupabaseConfigured =
  !SUPABASE_URL.startsWith('PEGA_AQUI') && !SUPABASE_ANON_KEY.startsWith('PEGA_AQUI')

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export const PHOTO_BUCKET = 'photos'
