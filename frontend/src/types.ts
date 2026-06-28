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

export interface Shelf {
  id: number
  name: string
  wardrobe_id: number | null
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
  shelf_id: number | null
  photo_path: string | null
  photos: string[]
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
  shelf_name?: string
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

// ---- Colores (con su muestra) ----
export const COLORS: { name: string; hex: string }[] = [
  { name: 'Negro', hex: '#111827' },
  { name: 'Gris', hex: '#9ca3af' },
  { name: 'Blanco', hex: '#ffffff' },
  { name: 'Beige', hex: '#e7d8b1' },
  { name: 'Marrón', hex: '#92400e' },
  { name: 'Azul', hex: '#3b82f6' },
  { name: 'Azul marino', hex: '#1e3a8a' },
  { name: 'Celeste', hex: '#7dd3fc' },
  { name: 'Verde', hex: '#22c55e' },
  { name: 'Verde oscuro', hex: '#166534' },
  { name: 'Rojo', hex: '#ef4444' },
  { name: 'Granate', hex: '#7f1d1d' },
  { name: 'Rosa', hex: '#ec4899' },
  { name: 'Naranja', hex: '#f97316' },
  { name: 'Amarillo', hex: '#eab308' },
  { name: 'Morado', hex: '#8b5cf6' },
  { name: 'Dorado', hex: '#d4af37' },
  { name: 'Plateado', hex: '#c0c0c0' },
  { name: 'Multicolor', hex: 'multi' },
]

// ---- Marcas ----
export const DEFAULT_BRANDS = [
  'Zara', 'H&M', 'Mango', 'Uniqlo', 'Muji', 'Sfera',
  'Primark', 'Amazon', 'Hanes', 'Target', "Levi's",
]

const BRANDS_KEY = 'petate-brands'

function customBrands(): string[] {
  try { return JSON.parse(localStorage.getItem(BRANDS_KEY) || '[]') } catch { return [] }
}

// Marcas habituales + las que haya creado el usuario
export function getBrands(): string[] {
  const custom = customBrands().filter(b => !DEFAULT_BRANDS.includes(b))
  return [...DEFAULT_BRANDS, ...custom]
}

// Guarda una marca nueva para que aparezca la próxima vez
export function addBrand(name: string): void {
  const n = name.trim()
  if (!n || getBrands().some(b => b.toLowerCase() === n.toLowerCase())) return
  localStorage.setItem(BRANDS_KEY, JSON.stringify([...customBrands(), n]))
}
