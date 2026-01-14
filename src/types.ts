/** Album data returned from NeoDB API */
export interface AlbumData {
  /** Album title */
  title: string
  /** List of artist names */
  artist: string[]
  /** Record label/company names */
  company?: string[]
  /** Release date in YYYY-MM-DD format */
  release_date?: string
  /** Track listing as multiline string */
  track_list?: string
  /** Album description/notes */
  description?: string
  /** External resource links (e.g., Spotify, Bandcamp) */
  external_resources?: { url: string }[]
  /** Cover image URL */
  cover_image_url?: string
}
