import type { CategoryId, Vibe } from '../types'

/** An OpenStreetMap tag filter, e.g. `historic=memorial`, with a display label. */
export type OsmTag = { key: string; value: string; label: string }

export type Category = {
  id: CategoryId
  label: string
  description: string
  emoji: string
  /** Marker / accent color. */
  color: string
  tags: { quiet: OsmTag[]; lively: OsmTag[] }
}

const tag = (key: string, value: string, label: string): OsmTag => ({ key, value, label })

export const CATEGORIES: Category[] = [
  {
    id: 'history',
    label: 'History & monuments',
    description: 'Memorials, monuments and historic sites',
    emoji: '🏛️',
    color: '#c2410c',
    tags: {
      quiet: [tag('historic', 'memorial', 'Memorial')],
      lively: [tag('historic', 'monument', 'Monument')],
    },
  },
  {
    id: 'art',
    label: 'Art & culture',
    description: 'Museums, galleries, public art and theatres',
    emoji: '🎨',
    color: '#9333ea',
    tags: {
      quiet: [tag('tourism', 'museum', 'Museum')],
      lively: [tag('tourism', 'artwork', 'Public art'), tag('tourism', 'gallery', 'Gallery'), tag('amenity', 'theatre', 'Theatre')],
    },
  },
  {
    id: 'nature',
    label: 'Nature & parks',
    description: 'Parks, gardens, nature reserves and viewpoints',
    emoji: '🌿',
    color: '#16a34a',
    tags: {
      quiet: [tag('leisure', 'garden', 'Garden'), tag('leisure', 'nature_reserve', 'Nature reserve'), tag('tourism', 'viewpoint', 'Viewpoint')],
      lively: [tag('leisure', 'park', 'Park')],
    },
  },
]

export const VIBES: { id: Vibe; label: string; description: string; emoji: string }[] = [
  { id: 'quiet', label: 'Quiet', description: 'Peaceful spots to slow down and reflect', emoji: '🌙' },
  { id: 'lively', label: 'Lively', description: 'Busy, social places with energy', emoji: '✨' },
  { id: 'any', label: 'No preference', description: 'Show me everything that matches', emoji: '🎲' },
]

export const CATEGORY_IDS = CATEGORIES.map((c) => c.id)
export const VIBE_IDS = VIBES.map((v) => v.id)

export const CATEGORY_BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<CategoryId, Category>

/** A searchable tag together with the category it belongs to. */
export type SearchTag = OsmTag & { category: CategoryId }

/** OSM tags to search for, given the user's preferences. */
export function tagsFor(categories: CategoryId[], vibe: Vibe): SearchTag[] {
  return CATEGORIES.filter((c) => categories.includes(c.id)).flatMap((c) =>
    (vibe === 'any' ? [...c.tags.quiet, ...c.tags.lively] : c.tags[vibe]).map((t) => ({ ...t, category: c.id })),
  )
}

const KIND_LABELS = Object.fromEntries(
  CATEGORIES.flatMap((c) => [...c.tags.quiet, ...c.tags.lively]).map((t) => [t.value, t.label]),
)

/** Human label for an OSM tag value, e.g. "artwork" → "Public art". */
export function kindLabel(kind: string): string {
  return KIND_LABELS[kind] ?? kind.replace(/_/g, ' ')
}
