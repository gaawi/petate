import type { ComponentType } from 'react'
import {
  PiCoatHanger, PiHoodie, PiTShirt, PiShirtFolded, PiPants, PiDress,
  PiSneaker, PiSneakerMove, PiBoot, PiSock, PiMoon, PiWaves,
  PiHandbag, PiBaseballCap, PiScribbleLoop, PiHandPalm, PiDiamond, PiTag,
  PiConfetti, PiHouse, PiBriefcase, PiPersonSimpleRun, PiPaintBrush, PiSunHorizon,
  PiHeart, PiTrashSimple, PiCalendarBlank, PiSun, PiSnowflake, PiFlower, PiLeaf,
} from 'react-icons/pi'
import { Check, ArrowUp, ArrowDown, User, Baby, UsersRound } from 'lucide-react'

type IconType = ComponentType<{ className?: string }>

// --- Tipos de prenda ---
const CATEGORY_ICONS: Record<string, IconType> = {
  abrigo: PiCoatHanger,
  chaqueta: PiHoodie,
  camiseta: PiTShirt,
  camisa: PiShirtFolded,
  pantalon: PiPants,
  vaqueros: PiPants,
  vestido: PiDress,
  falda: PiDress,
  zapatos: PiSneaker,
  zapatillas: PiSneakerMove,
  botas: PiBoot,
  ropa_interior: PiShirtFolded,
  calcetines: PiSock,
  jersey: PiHoodie,
  pijama: PiMoon,
  banador: PiWaves,
  traje: PiCoatHanger,
  bolso: PiHandbag,
  gorro: PiBaseballCap,
  bufanda: PiScribbleLoop,
  guantes: PiHandPalm,
  accesorio: PiDiamond,
  otros: PiTag,
}

// --- Usos ---
const USE_TYPE_ICONS: Record<string, IconType> = {
  salir: PiConfetti,
  casa: PiHouse,
  trabajo: PiBriefcase,
  deporte: PiPersonSimpleRun,
  ensuciar: PiPaintBrush,
  playa: PiSunHorizon,
  pijama: PiMoon,
  donar: PiHeart,
  tirar: PiTrashSimple,
}

// --- Temporadas ---
const SEASON_ICONS: Record<string, IconType> = {
  todo: PiCalendarBlank,
  verano: PiSun,
  invierno: PiSnowflake,
  primavera: PiFlower,
  otono: PiLeaf,
}

// --- Talla / ajuste ---
const FIT_ICONS: Record<string, IconType> = {
  bien: Check,
  grande: ArrowUp,
  pequena: ArrowDown,
}

// --- Roles familiares ---
const ROLE_ICONS: Record<string, IconType> = {
  padre: User,
  madre: User,
  hijo: Baby,
  otro: UsersRound,
}

function make(map: Record<string, IconType>, fallback: IconType) {
  return function Icon({ value, className }: { value: string; className?: string }) {
    const Comp = map[value] ?? fallback
    return <Comp className={className} />
  }
}

export const CategoryIcon = make(CATEGORY_ICONS, PiTag)
export const UseTypeIcon = make(USE_TYPE_ICONS, PiTShirt)
export const SeasonIcon = make(SEASON_ICONS, PiCalendarBlank)
export const FitIcon = make(FIT_ICONS, Check)
export const RoleIcon = make(ROLE_ICONS, User)
