import type { CategoryId, Vibe } from '../types'

/** An OpenStreetMap tag filter, e.g. `historic=memorial`. */
export type OsmTag = { key: string; value: string }

export type Category = {
  id: CategoryId
  label: string
  description: string
  emoji: string
  /** Marker / accent color. */
  color: string
  tags: { quiet: OsmTag[]; lively: OsmTag[] }
}

const tag = (key: string, value: string): OsmTag => ({ key, value })

export const CATEGORIES: Category[] = [
  {
    id: 'history',
    label: 'History & monuments',
    description: 'Memorials, monuments and historic sites',
    emoji: '🏛️',
    color: '#c2410c',
    tags: {
      quiet: [tag('historic', 'memorial')],
      lively: [tag('historic', 'monument')],
    },
  },
  {
    id: 'art',
    label: 'Art & culture',
    description: 'Museums, galleries, public art and theatres',
    emoji: '🎨',
    color: '#9333ea',
    tags: {
      quiet: [tag('tourism', 'museum')],
      lively: [tag('tourism', 'artwork'), tag('tourism', 'gallery'), tag('amenity', 'theatre')],
    },
  },
  {
    id: 'nature',
    label: 'Nature & parks',
    description: 'Parks, gardens, nature reserves and viewpoints',
    emoji: '🌿',
    color: '#16a34a',
    tags: {
      quiet: [tag('leisure', 'garden'), tag('leisure', 'nature_reserve'), tag('tourism', 'viewpoint')],
      lively: [tag('leisure', 'park')],
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

/** OSM tags to search for, given the user's preferences. */
export function tagsFor(categories: CategoryId[], vibe: Vibe): OsmTag[] {
  return CATEGORIES.filter((c) => categories.includes(c.id)).flatMap((c) =>
    vibe === 'any' ? [...c.tags.quiet, ...c.tags.lively] : c.tags[vibe],
  )
}
