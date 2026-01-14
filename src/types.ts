export interface AlbumData {
  title: string
  artist: string[]
  company?: string[]
  release_date?: string
  track_list?: string
  description?: string
  external_resources?: { url: string }[]
  cover_image_url?: string
}
