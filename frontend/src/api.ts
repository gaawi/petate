import type { FamilyMember, Location, Wardrobe, Suitcase, Trip, Garment } from './types'
import { supabase, PHOTO_BUCKET } from './lib/supabase'

// ============================================================================
// Capa de datos sobre Supabase (Postgres en la nube + almacenamiento de fotos).
// La app habla directamente con Supabase, sin servidor propio. Así funciona
// como sitio estático (GitHub Pages) pero con los datos sincronizados.
// ============================================================================

function check<T>(data: T | null, error: { message: string } | null): T {
  if (error) throw new Error(error.message)
  return data as T
}

// ---- decoradores: aplanan los datos anidados que devuelve Supabase ----
/* eslint-disable @typescript-eslint/no-explicit-any */
function flatGarment(g: any): Garment {
  return {
    ...g,
    owner_name: g.owner?.name ?? undefined,
    owner_color: g.owner?.color ?? undefined,
    owner_role: g.owner?.role ?? undefined,
    wardrobe_name: g.wardrobe?.name ?? undefined,
    wardrobe_location_name: g.wardrobe?.location?.name ?? undefined,
    wardrobe_location_city: g.wardrobe?.location?.city ?? undefined,
    suitcase_name: g.suitcase?.name ?? undefined,
    suitcase_location_name: g.suitcase?.location?.name ?? undefined,
    suitcase_location_city: g.suitcase?.location?.city ?? undefined,
  }
}

function flatSuitcase(s: any): Suitcase {
  return {
    ...s,
    location_name: s.location?.name ?? undefined,
    city: s.location?.city ?? undefined,
    country: s.location?.country ?? undefined,
    garment_count: s.garments?.[0]?.count ?? 0,
  }
}

function flatWardrobe(w: any): Wardrobe {
  return {
    ...w,
    location_name: w.location?.name ?? undefined,
    city: w.location?.city ?? undefined,
    country: w.location?.country ?? undefined,
    garment_count: w.garments?.[0]?.count ?? 0,
  }
}

const GARMENT_SELECT = `
  *,
  owner:family_members(id,name,color,role),
  wardrobe:wardrobes(id,name,location:locations(id,name,city)),
  suitcase:suitcases(id,name,location:locations(id,name,city))
`

export const api = {
  members: {
    list: async (): Promise<FamilyMember[]> => {
      const { data, error } = await supabase
        .from('family_members')
        .select('*, garments(count)')
        .order('id')
      return check(data, error).map((m: any) => ({ ...m, garment_count: m.garments?.[0]?.count ?? 0 }))
    },
    create: async (d: Partial<FamilyMember>): Promise<FamilyMember> => {
      const { data, error } = await supabase
        .from('family_members')
        .insert({ name: d.name, role: d.role, color: d.color || '#6366f1' })
        .select().single()
      return { ...check(data, error), garment_count: 0 }
    },
    update: async (id: number, d: Partial<FamilyMember>): Promise<FamilyMember> => {
      const { data, error } = await supabase
        .from('family_members')
        .update({ name: d.name, role: d.role, color: d.color })
        .eq('id', id).select().single()
      return check(data, error)
    },
    delete: async (id: number) => {
      const { error } = await supabase.from('family_members').delete().eq('id', id)
      if (error) throw new Error(error.message)
      return { success: true }
    },
  },

  locations: {
    list: async (): Promise<Location[]> => {
      const { data, error } = await supabase
        .from('locations')
        .select('*, wardrobes(count), suitcases(count)')
        .order('id')
      return check(data, error).map((l: any) => ({
        ...l,
        wardrobe_count: l.wardrobes?.[0]?.count ?? 0,
        suitcase_count: l.suitcases?.[0]?.count ?? 0,
      }))
    },
    create: async (d: Partial<Location>): Promise<Location> => {
      const { data, error } = await supabase
        .from('locations')
        .insert({ name: d.name, city: d.city, country: d.country })
        .select().single()
      return { ...check(data, error), wardrobe_count: 0, suitcase_count: 0 }
    },
    update: async (id: number, d: Partial<Location>): Promise<Location> => {
      const { data, error } = await supabase
        .from('locations')
        .update({ name: d.name, city: d.city, country: d.country })
        .eq('id', id).select().single()
      return check(data, error)
    },
    delete: async (id: number) => {
      const { error } = await supabase.from('locations').delete().eq('id', id)
      if (error) throw new Error(error.message)
      return { success: true }
    },
  },

  wardrobes: {
    list: async (): Promise<Wardrobe[]> => {
      const { data, error } = await supabase
        .from('wardrobes')
        .select('*, location:locations(id,name,city,country), garments(count)')
        .order('name')
      return check(data, error).map(flatWardrobe)
    },
    create: async (d: Partial<Wardrobe>): Promise<Wardrobe> => {
      const { data, error } = await supabase
        .from('wardrobes')
        .insert({ name: d.name, location_id: d.location_id ?? null })
        .select('*, location:locations(id,name,city,country), garments(count)').single()
      return flatWardrobe(check(data, error))
    },
    update: async (id: number, d: Partial<Wardrobe>): Promise<Wardrobe> => {
      const { data, error } = await supabase
        .from('wardrobes')
        .update({ name: d.name, location_id: d.location_id ?? null })
        .eq('id', id)
        .select('*, location:locations(id,name,city,country), garments(count)').single()
      return flatWardrobe(check(data, error))
    },
    delete: async (id: number) => {
      const { error } = await supabase.from('wardrobes').delete().eq('id', id)
      if (error) throw new Error(error.message)
      return { success: true }
    },
  },

  suitcases: {
    list: async (): Promise<Suitcase[]> => {
      const { data, error } = await supabase
        .from('suitcases')
        .select('*, location:locations(id,name,city,country), garments(count)')
        .order('name')
      return check(data, error).map(flatSuitcase)
    },
    create: async (d: Partial<Suitcase>): Promise<Suitcase> => {
      const { data, error } = await supabase
        .from('suitcases')
        .insert({ name: d.name, current_location_id: d.current_location_id ?? null })
        .select('*, location:locations(id,name,city,country), garments(count)').single()
      return flatSuitcase(check(data, error))
    },
    update: async (id: number, d: Partial<Suitcase>): Promise<Suitcase> => {
      const { data, error } = await supabase
        .from('suitcases')
        .update({ name: d.name, current_location_id: d.current_location_id ?? null })
        .eq('id', id)
        .select('*, location:locations(id,name,city,country), garments(count)').single()
      return flatSuitcase(check(data, error))
    },
    move: async (id: number, location_id: number | null): Promise<Suitcase> => {
      const { data, error } = await supabase
        .from('suitcases')
        .update({ current_location_id: location_id })
        .eq('id', id)
        .select('*, location:locations(id,name,city,country), garments(count)').single()
      return flatSuitcase(check(data, error))
    },
    delete: async (id: number) => {
      const { error } = await supabase.from('suitcases').delete().eq('id', id)
      if (error) throw new Error(error.message)
      return { success: true }
    },
  },

  trips: {
    list: async (): Promise<Trip[]> => {
      const { data, error } = await supabase
        .from('trips')
        .select('*, trip_suitcases(suitcase:suitcases(*, location:locations(id,name,city), garments(count)))')
        .order('start_date', { ascending: false })
        .order('id', { ascending: false })
      return check(data, error).map((t: any) => ({
        ...t,
        suitcases: (t.trip_suitcases || [])
          .map((ts: any) => ts.suitcase)
          .filter(Boolean)
          .map(flatSuitcase),
      }))
    },
    create: async (d: Partial<Trip>): Promise<Trip> => {
      const { data, error } = await supabase
        .from('trips')
        .insert({
          name: d.name, destination: d.destination || null,
          start_date: d.start_date || null, end_date: d.end_date || null, notes: d.notes || null,
        })
        .select().single()
      return { ...check(data, error), suitcases: [] }
    },
    update: async (id: number, d: Partial<Trip>): Promise<Trip> => {
      const { error: upErr } = await supabase
        .from('trips')
        .update({
          name: d.name, destination: d.destination || null,
          start_date: d.start_date || null, end_date: d.end_date || null, notes: d.notes || null,
        })
        .eq('id', id)
      if (upErr) throw new Error(upErr.message)
      return api.trips._get(id)
    },
    addSuitcase: async (tripId: number, suitcaseId: number): Promise<Trip> => {
      await supabase.from('trip_suitcases').insert({ trip_id: tripId, suitcase_id: suitcaseId })
      return api.trips._get(tripId)
    },
    removeSuitcase: async (tripId: number, suitcaseId: number): Promise<Trip> => {
      await supabase.from('trip_suitcases').delete().eq('trip_id', tripId).eq('suitcase_id', suitcaseId)
      return api.trips._get(tripId)
    },
    delete: async (id: number) => {
      const { error } = await supabase.from('trips').delete().eq('id', id)
      if (error) throw new Error(error.message)
      return { success: true }
    },
    _get: async (id: number): Promise<Trip> => {
      const { data, error } = await supabase
        .from('trips')
        .select('*, trip_suitcases(suitcase:suitcases(*, location:locations(id,name,city), garments(count)))')
        .eq('id', id).single()
      const t: any = check(data, error)
      return {
        ...t,
        suitcases: (t.trip_suitcases || []).map((ts: any) => ts.suitcase).filter(Boolean).map(flatSuitcase),
      }
    },
  },

  garments: {
    list: async (filters?: Record<string, string>): Promise<Garment[]> => {
      let q = supabase.from('garments').select(GARMENT_SELECT)
      if (filters) {
        if (filters.owner_id) q = q.eq('owner_id', filters.owner_id)
        if (filters.category) q = q.eq('category', filters.category)
        if (filters.season && filters.season !== 'todo') q = q.or(`season.eq.${filters.season},season.eq.todo`)
        if (filters.use_type) q = q.eq('use_type', filters.use_type)
        if (filters.condition) q = q.eq('condition', filters.condition)
        if (filters.fit) q = q.eq('fit', filters.fit)
        if (filters.wardrobe_id) q = q.eq('wardrobe_id', filters.wardrobe_id)
        if (filters.suitcase_id) q = q.eq('suitcase_id', filters.suitcase_id)
        if (filters.search) {
          const s = filters.search.replace(/[%,]/g, '')
          q = q.or(`name.ilike.%${s}%,brand.ilike.%${s}%,notes.ilike.%${s}%`)
        }
      }
      q = q.order('created_at', { ascending: false })
      const { data, error } = await q
      return check(data, error).map(flatGarment)
    },
    stats: async () => {
      const [{ data: members }, { data: garments }] = await Promise.all([
        supabase.from('family_members').select('id,name,color').order('id'),
        supabase.from('garments').select('owner_id,category,use_type,season'),
      ])
      const gs = (garments || []) as any[]
      const total = gs.length
      const byOwner = (members || []).map((m: any) => ({
        id: m.id, name: m.name, color: m.color,
        count: gs.filter(g => g.owner_id === m.id).length,
      }))
      const groupCount = (key: string) => {
        const map = new Map<string, number>()
        gs.forEach(g => map.set(g[key], (map.get(g[key]) || 0) + 1))
        return [...map.entries()]
      }
      const byCategory = groupCount('category').map(([category, count]) => ({ category, count })).sort((a, b) => b.count - a.count)
      const byUseType = groupCount('use_type').map(([use_type, count]) => ({ use_type, count })).sort((a, b) => b.count - a.count)
      const bySeason = groupCount('season').map(([season, count]) => ({ season, count }))
      return { total, byOwner, byCategory, byUseType, bySeason }
    },
    get: async (id: number): Promise<Garment> => {
      const { data, error } = await supabase.from('garments').select(GARMENT_SELECT).eq('id', id).single()
      return flatGarment(check(data, error))
    },
    create: async (d: Partial<Garment>): Promise<Garment> => {
      const { data, error } = await supabase
        .from('garments')
        .insert({
          name: d.name, category: d.category || 'otros', owner_id: d.owner_id ?? null,
          wardrobe_id: d.wardrobe_id ?? null, suitcase_id: d.suitcase_id ?? null,
          photo_path: d.photo_path ?? null, condition: d.condition || 'buena',
          use_type: d.use_type || 'salir', fit: d.fit || 'bien', season: d.season || 'todo',
          rating: d.rating ?? 3, brand: d.brand ?? null, color: d.color ?? null, notes: d.notes ?? null,
        })
        .select(GARMENT_SELECT).single()
      return flatGarment(check(data, error))
    },
    update: async (id: number, d: Partial<Garment>): Promise<Garment> => {
      const { data, error } = await supabase
        .from('garments')
        .update({
          name: d.name, category: d.category, owner_id: d.owner_id ?? null,
          wardrobe_id: d.wardrobe_id ?? null, suitcase_id: d.suitcase_id ?? null,
          photo_path: d.photo_path ?? null, condition: d.condition, use_type: d.use_type,
          fit: d.fit, season: d.season, rating: d.rating, brand: d.brand ?? null,
          color: d.color ?? null, notes: d.notes ?? null,
        })
        .eq('id', id).select(GARMENT_SELECT).single()
      return flatGarment(check(data, error))
    },
    delete: async (id: number) => {
      const { error } = await supabase.from('garments').delete().eq('id', id)
      if (error) throw new Error(error.message)
      return { success: true }
    },
    // Mueve varias prendas a la vez a una maleta o un armario (o las saca: null).
    // Una prenda está o en armario o en maleta, nunca en ambos.
    move: async (ids: number[], target: { suitcase_id?: number | null; wardrobe_id?: number | null }) => {
      if (ids.length === 0) return { success: true }
      const patch: Record<string, number | null> = {}
      if ('suitcase_id' in target) { patch.suitcase_id = target.suitcase_id ?? null; patch.wardrobe_id = null }
      if ('wardrobe_id' in target) { patch.wardrobe_id = target.wardrobe_id ?? null; patch.suitcase_id = null }
      const { error } = await supabase.from('garments').update(patch).in('id', ids)
      if (error) throw new Error(error.message)
      return { success: true }
    },
  },

  // Sube la foto al almacenamiento de Supabase y devuelve su URL pública.
  upload: async (file: File): Promise<string> => {
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`
    const { error } = await supabase.storage.from(PHOTO_BUCKET).upload(name, file, {
      cacheControl: '3600', upsert: false,
    })
    if (error) throw new Error(error.message)
    const { data } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(name)
    return data.publicUrl
  },
}
