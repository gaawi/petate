export interface FamilyMember {
  id: number
  name: string
  role: string
  color: string
  garment_count?: number
  created_at: string
}

export interface Location {
  id: number
  name: string
  city: string
  country: string
  wardrobe_count?: number
  suitcase_count?: number
  created_at: string
}

export interface Wardrobe {
  id: number
  name: string
  location_id: number | null
  location_name?: string
  city?: string
  country?: string
  garment_count?: number
  created_at: string
}

export interface Suitcase {
  id: number
  name: string
  current_location_id: number | null
  location_name?: string
  city?: string
  country?: string
  garment_count?: number
  created_at: string
}

export interface Trip {
  id: number
  name: string
  destination: string | null
  start_date: string | null
  end_date: string | null
  notes: string | null
  suitcases: Suitcase[]
  created_at: string
}

export interface Garment {
  id: number
  name: string
  category: string
  owner_id: number | null
  wardrobe_id: number | null
  suitcase_id: number | null
  photo_path: string | null
  condition: string
  use_type: string
  fit: string
  season: string
  rating: number
  quantity: number
  brand: string | null
  color: string | null
  notes: string | null
  // joined
  owner_name?: string
  owner_color?: string
  owner_role?: string
  wardrobe_name?: string
  wardrobe_location_name?: string
  wardrobe_location_city?: string
  suitcase_name?: string
  suitcase_location_name?: string
  suitcase_location_city?: string
  created_at: string
}

export const CATEGORIES = [
  { value: 'abrigo', label: 'Abrigo', emoji: '🧥' },
  { value: 'chaqueta', label: 'Chaqueta', emoji: '🧥' },
  { value: 'camiseta', label: 'Camiseta', emoji: '👕' },
  { value: 'camisa', label: 'Camisa', emoji: '👔' },
  { value: 'pantalon', label: 'Pantalón', emoji: '👖' },
  { value: 'vaqueros', label: 'Vaqueros', emoji: '👖' },
  { value: 'vestido', label: 'Vestido', emoji: '👗' },
  { value: 'falda', label: 'Falda', emoji: '👗' },
  { value: 'zapatos', label: 'Zapatos', emoji: '👞' },
  { value: 'zapatillas', label: 'Zapatillas', emoji: '👟' },
  { value: 'botas', label: 'Botas', emoji: '👢' },
  { value: 'ropa_interior', label: 'Ropa interior', emoji: '🩲' },
  { value: 'calcetines', label: 'Calcetines', emoji: '🧦' },
  { value: 'jersey', label: 'Jersey/Suéter', emoji: '🧶' },
  { value: 'pijama', label: 'Pijama', emoji: '😴' },
  { value: 'banador', label: 'Bañador', emoji: '🩱' },
  { value: 'traje', label: 'Traje', emoji: '🤵' },
  { value: 'bolso', label: 'Bolso/Mochila', emoji: '👜' },
  { value: 'gorro', label: 'Gorro/Sombrero', emoji: '🧢' },
  { value: 'bufanda', label: 'Bufanda', emoji: '🧣' },
  { value: 'guantes', label: 'Guantes', emoji: '🧤' },
  { value: 'accesorio', label: 'Accesorio', emoji: '💍' },
  { value: 'otros', label: 'Otros', emoji: '👚' },
] as const

export const USE_TYPES = [
  { value: 'salir', label: 'Para salir', emoji: '🎉' },
  { value: 'casa', label: 'Para casa', emoji: '🏠' },
  { value: 'trabajo', label: 'Trabajo/Oficina', emoji: '💼' },
  { value: 'deporte', label: 'Deporte', emoji: '🏃' },
  { value: 'ensuciar', label: 'Para ensuciar', emoji: '🎨' },
  { value: 'playa', label: 'Playa/Piscina', emoji: '🏖️' },
  { value: 'pijama', label: 'Pijama/Dormir', emoji: '😴' },
  { value: 'donar', label: 'Para donar', emoji: '💝' },
  { value: 'tirar', label: 'Para tirar', emoji: '🗑️' },
] as const

export const CONDITIONS = [
  { value: 'nueva', label: 'Nueva', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'buena', label: 'Buena', color: 'bg-blue-100 text-blue-800' },
  { value: 'regular', label: 'Regular', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'vieja', label: 'Vieja/Gastada', color: 'bg-red-100 text-red-800' },
] as const

export const FIT_OPTIONS = [
  { value: 'bien', label: 'Me queda bien', emoji: '✅' },
  { value: 'grande', label: 'Me queda grande', emoji: '⬆️' },
  { value: 'pequena', label: 'Me queda pequeña', emoji: '⬇️' },
] as const

export const SEASONS = [
  { value: 'todo', label: 'Todo el año', emoji: '🗓️' },
  { value: 'verano', label: 'Verano', emoji: '☀️' },
  { value: 'invierno', label: 'Invierno', emoji: '❄️' },
  { value: 'primavera', label: 'Primavera', emoji: '🌸' },
  { value: 'otono', label: 'Otoño', emoji: '🍂' },
] as const

export const getCategoryInfo = (val: string) =>
  CATEGORIES.find(c => c.value === val) ?? { label: val, emoji: '👚' }

export const getUseTypeInfo = (val: string) =>
  USE_TYPES.find(u => u.value === val) ?? { label: val, emoji: '👕' }

export const getConditionInfo = (val: string) =>
  CONDITIONS.find(c => c.value === val) ?? { label: val, color: 'bg-gray-100 text-gray-800' }

export const getSeasonInfo = (val: string) =>
  SEASONS.find(s => s.value === val) ?? { label: val, emoji: '🗓️' }

export const getFitInfo = (val: string) =>
  FIT_OPTIONS.find(f => f.value === val) ?? { label: val, emoji: '✅' }
