import { createRoot } from 'react-dom/client'
import SearchButton from '../src/components/SearchButton'
import CreateButton from '../src/components/CreateButton'
import NeoDBIcon from '../src/components/NeoDBIcon'
import { AlbumData } from '../src/types'
import '../src/content.css'

// Access Token
const AccessToken = import.meta.env.VITE_NEODB_ACCESS_TOKEN
  ? `Bearer ${import.meta.env.VITE_NEODB_ACCESS_TOKEN}`
  : (() => {
      console.warn(
        '[Neo2DB] Access token not configured. Please set VITE_NEODB_ACCESS_TOKEN in your environment. Get your token from https://neodb.social/developer/'
      )
      return ''
    })()

// URL patterns to exclude from NeoDB page handling
const NEODB_EXCLUDED_PATHS = ['/game/', '/performance/']

// Pre-compiled RegExp patterns for better performance
const SUBJECT_PATH_REGEX = /^\/subject\/\d+\/?$/
const CATEGORY_REGEX = /\/([a-zA-Z]+)\//

// Check if current URL is a valid NeoDB content page
function isNeoDBContentPage(): boolean {
  const href = window.location.href
  if (!href.startsWith('https://neodb.social/')) return false
  return !NEODB_EXCLUDED_PATHS.some((path) => href.includes(path))
}

// Check if current URL is a Douban subject page
function isDoubanSubjectPage(): boolean {
  const validHosts = ['music.douban.com', 'movie.douban.com', 'book.douban.com']
  return validHosts.includes(window.location.hostname) && SUBJECT_PATH_REGEX.test(window.location.pathname)
}

export default defineContentScript({
  matches: [
    'https://neodb.social/*',
    'https://music.douban.com/subject/*',
    'https://movie.douban.com/subject/*',
    'https://book.douban.com/subject/*',
  ],
  main() {
    // NeoDB Page Search Btn
    if (isNeoDBContentPage()) {
      const box = document.getElementById('item-cover')
      if (box) {
        box.classList.add('neo2db-cover-container')

        // Create a container to render React components
        const searchButtonContainer = document.createElement('div')
        box.appendChild(searchButtonContainer)

        // Render SearchButton component
        const searchButtonRoot = createRoot(searchButtonContainer)
        searchButtonRoot.render(<SearchButton onClick={handleSearchButtonClick} />)

        // If this is an album page, add CreateButton
        if (window.location.href.startsWith('https://neodb.social/album/')) {
          const createButtonContainer = document.createElement('div')
          box.appendChild(createButtonContainer)

          // Render CreateButton component
          const createButtonRoot = createRoot(createButtonContainer)
          createButtonRoot.render(<CreateButton onClick={handleCreateButtonClick} />)
        }
      }
    }

    // Douban Page Search Btn
    if (isDoubanSubjectPage()) {
      const wrapper = document.querySelector('#wrapper') as HTMLElement
      if (wrapper) {
        wrapper.classList.add('neo2db-douban-wrapper')
        const searchButton = document.createElement('a')
        searchButton.classList.add('neo2db-douban-search-btn')
        searchButton.href = '#'

        // Create a container for the React component
        const logoContainer = document.createElement('div')
        logoContainer.classList.add('neo2db-logo-container')
        searchButton.appendChild(logoContainer)
        const logoRoot = createRoot(logoContainer)
        logoRoot.render(<NeoDBIcon />)

        const openNeoDBSearch = (e: Event) => {
          e.preventDefault()
          const currentUrl = window.location.href
          const neodbSearchUrl = `https://neodb.social/search?q=${currentUrl}`
          window.open(neodbSearchUrl, '_blank')
        }

        // Handle click events
        searchButton.addEventListener('click', openNeoDBSearch)
        searchButton.addEventListener('auxclick', (e) => {
          if (e.button === 1) openNeoDBSearch(e)
        })

        wrapper.appendChild(searchButton)
      }
    }
  },
})

// Handle search button click event
function handleSearchButtonClick(e: React.MouseEvent<HTMLButtonElement>) {
  e.preventDefault()
  const h1 = document.querySelector('#item-title h1')
  const ItemTitle = h1?.firstChild?.textContent?.trim() || ''

  const artistSpan = document.querySelector('#item-metadata > section > div:nth-child(2) span span')
  const ItemArtist = artistSpan ? artistSpan.textContent?.trim() || '' : ''

  const url = window.location.href
  const match = url.match(CATEGORY_REGEX)
  if (match) {
    const Category = match[1] === 'tv' ? 'movie' : match[1] === 'album' ? 'music' : match[1]

    // Only include artist for music/album searches
    const searchQuery = match[1] === 'album' ? `${ItemTitle} ${ItemArtist}` : `${ItemTitle}`

    const doubanSearchUrl = `https://search.douban.com/${Category}/subject_search?search_text=${encodeURIComponent(
      searchQuery
    )}`
    window.open(doubanSearchUrl, '_blank')
  }
}

// Handle create button click event
async function handleCreateButtonClick() {
  const albumId = window.location.pathname.split('/').pop()

  if (!albumId) return

  if (!AccessToken) {
    console.warn('[Neo2DB] Access token not configured')
    return
  }

  try {
    const response = await fetch(`https://neodb.social/api/album/${albumId}`, {
      headers: {
        Authorization: AccessToken,
      },
    })

    if (!response.ok) {
      console.error(`[Neo2DB] API error: ${response.status}`)
      return
    }

    const albumData: AlbumData = await response.json()

    // Download cover image using fetch + blob (handles cross-origin)
    if (albumData.cover_image_url) {
      await downloadImage(albumData.cover_image_url, `${albumData.title}_cover.jpg`)
    } else {
      console.log('[Neo2DB] No cover image URL found in the album data.')
    }

    // Send album data to background script
    try {
      chrome.runtime.sendMessage({
        action: 'fillDoubanForm',
        albumData: albumData,
      })
    } catch (chromeError) {
      // Ignore "Extension context invalidated" error
      if (
        typeof chromeError === 'object' &&
        chromeError !== null &&
        !chromeError.toString().includes('Extension context invalidated')
      ) {
        console.error('[Neo2DB] Error sending message:', chromeError)
      }
    }
  } catch (error) {
    // If the error is not "Extension context invalidated", display it
    if (error instanceof Error && !error.message.includes('Extension context invalidated')) {
      console.error('[Neo2DB] Failed to fetch album data:', error)
    }
  }
}

// Download image using fetch to handle cross-origin
async function downloadImage(url: string, fileName: string): Promise<void> {
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    const blobUrl = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.style.display = 'none'
    a.href = blobUrl
    a.download = fileName
    document.body.appendChild(a)
    a.click()

    // Cleanup
    setTimeout(() => {
      URL.revokeObjectURL(blobUrl)
      a.remove()
    }, 100)
  } catch (error) {
    console.error('[Neo2DB] Failed to download image:', error)
    // Fallback: open image in new tab
    window.open(url, '_blank')
  }
}
