import type { ReactNode, SVGProps } from 'react'
import type { CategoryId } from '../types'

type IconProps = SVGProps<SVGSVGElement>

/** 24×24 stroke icon (Lucide-style geometry). */
function Icon({ children, className = 'size-4', ...rest }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...rest}
    >
      {children}
    </svg>
  )
}

export const GemIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 3h12l4 6-10 13L2 9Z" />
    <path d="M11 3 8 9l4 13 4-13-3-6" />
    <path d="M2 9h20" />
  </Icon>
)

export const SlidersIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M21 4h-7M10 4H3M21 12h-9M8 12H3M21 20h-5M12 20H3M14 2v4M8 10v4M16 18v4" />
  </Icon>
)

export const CloseIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M18 6 6 18M6 6l12 12" />
  </Icon>
)

export const ChevronLeftIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="m15 18-6-6 6-6" />
  </Icon>
)

export const WalkIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="13" cy="4" r="1.5" />
    <path d="m9 20 2.5-5.5L14 17v4M11.5 14.5 12.5 9l-3 1.5V13M12.5 9l2 3h2.5" />
  </Icon>
)

export const GlobeIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20" />
  </Icon>
)

export const BookIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </Icon>
)

export const MapIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3zM9 3v15M15 6v15" />
  </Icon>
)

export const ExternalIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
  </Icon>
)

export const PlusIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 12h14M12 5v14" />
  </Icon>
)

export const MinusIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 12h14" />
  </Icon>
)

export const ListIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 6h.01M3 12h.01M3 18h.01M8 6h13M8 12h13M8 18h13" />
  </Icon>
)

export const LocateIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="m3 11 19-9-9 19-2-8z" />
  </Icon>
)

const LandmarkIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 22h18M6 18v-7M10 18v-7M14 18v-7M18 18v-7M12 2l8 5H4z" />
  </Icon>
)

const PaletteIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 22a10 10 0 1 1 10-10c0 2.2-1.8 3.5-3.5 3.5H16a2 2 0 0 0-1.5 3.3A2 2 0 0 1 13 22z" />
  </Icon>
)

const TreeIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 3 7 10h3l-4 6h12l-4-6h3zM12 16v5" />
  </Icon>
)

const CATEGORY_ICONS: Record<CategoryId, (p: IconProps) => ReactNode> = {
  history: LandmarkIcon,
  art: PaletteIcon,
  nature: TreeIcon,
}

export function CategoryIcon({ id, ...p }: IconProps & { id: CategoryId }) {
  const C = CATEGORY_ICONS[id]
  return <C {...p} />
}
