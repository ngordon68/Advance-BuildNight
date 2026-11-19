export type CategoryId = 'history' | 'art' | 'nature'
export type Vibe = 'quiet' | 'lively' | 'any'

export type Preferences = {
  categories: CategoryId[]
  vibe: Vibe
}
