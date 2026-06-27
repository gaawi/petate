import type { FamilyMember, Location, Wardrobe, Suitcase, Trip, Garment } from './types'

const BASE = '/api'

async function req<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`)
  return res.json()
}

export const api = {
  members: {
    list: () => req<FamilyMember[]>('GET', '/members'),
    create: (d: Partial<FamilyMember>) => req<FamilyMember>('POST', '/members', d),
    update: (id: number, d: Partial<FamilyMember>) => req<FamilyMember>('PUT', `/members/${id}`, d),
    delete: (id: number) => req<{ success: boolean }>('DELETE', `/members/${id}`),
  },
  locations: {
    list: () => req<Location[]>('GET', '/locations'),
    create: (d: Partial<Location>) => req<Location>('POST', '/locations', d),
    update: (id: number, d: Partial<Location>) => req<Location>('PUT', `/locations/${id}`, d),
    delete: (id: number) => req<{ success: boolean }>('DELETE', `/locations/${id}`),
  },
  wardrobes: {
    list: () => req<Wardrobe[]>('GET', '/wardrobes'),
    create: (d: Partial<Wardrobe>) => req<Wardrobe>('POST', '/wardrobes', d),
    update: (id: number, d: Partial<Wardrobe>) => req<Wardrobe>('PUT', `/wardrobes/${id}`, d),
    delete: (id: number) => req<{ success: boolean }>('DELETE', `/wardrobes/${id}`),
  },
  suitcases: {
    list: () => req<Suitcase[]>('GET', '/suitcases'),
    create: (d: Partial<Suitcase>) => req<Suitcase>('POST', '/suitcases', d),
    update: (id: number, d: Partial<Suitcase>) => req<Suitcase>('PUT', `/suitcases/${id}`, d),
    move: (id: number, location_id: number | null) => req<Suitcase>('PATCH', `/suitcases/${id}/move`, { current_location_id: location_id }),
    delete: (id: number) => req<{ success: boolean }>('DELETE', `/suitcases/${id}`),
  },
  trips: {
    list: () => req<Trip[]>('GET', '/trips'),
    create: (d: Partial<Trip>) => req<Trip>('POST', '/trips', d),
    update: (id: number, d: Partial<Trip>) => req<Trip>('PUT', `/trips/${id}`, d),
    addSuitcase: (tripId: number, suitcaseId: number) =>
      req<Trip>('PATCH', `/trips/${tripId}/suitcases`, { suitcase_id: suitcaseId, action: 'add' }),
    removeSuitcase: (tripId: number, suitcaseId: number) =>
      req<Trip>('PATCH', `/trips/${tripId}/suitcases`, { suitcase_id: suitcaseId, action: 'remove' }),
    delete: (id: number) => req<{ success: boolean }>('DELETE', `/trips/${id}`),
  },
  garments: {
    list: (filters?: Record<string, string>) => {
      const qs = filters ? '?' + new URLSearchParams(filters).toString() : ''
      return req<Garment[]>('GET', `/garments${qs}`)
    },
    stats: () => req<{
      total: number
      byOwner: Array<{ id: number; name: string; color: string; count: number }>
      byCategory: Array<{ category: string; count: number }>
      byUseType: Array<{ use_type: string; count: number }>
      bySeason: Array<{ season: string; count: number }>
    }>('GET', '/garments/stats'),
    get: (id: number) => req<Garment>('GET', `/garments/${id}`),
    create: (d: Partial<Garment>) => req<Garment>('POST', '/garments', d),
    update: (id: number, d: Partial<Garment>) => req<Garment>('PUT', `/garments/${id}`, d),
    delete: (id: number) => req<{ success: boolean }>('DELETE', `/garments/${id}`),
  },
  upload: async (file: File): Promise<string> => {
    const fd = new FormData()
    fd.append('photo', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    if (!res.ok) throw new Error('Error subiendo foto')
    const data = await res.json()
    return data.path as string
  },
}
