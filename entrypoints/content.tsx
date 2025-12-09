import { createRoot } from 'react-dom/client';
import SearchButton from '../src/components/SearchButton';
import CreateButton from '../src/components/CreateButton';
import NeoDBLogo from '../src/components/NeoDBLogo';
import { AlbumData } from '../src/types';
import '../src/content.css';

// Access Token

const AccessToken = import.meta.env.VITE_NEODB_ACCESS_TOKEN
  ? `Bearer ${import.meta.env.VITE_NEODB_ACCESS_TOKEN}`
  : `Bearer YOUR_NEODB_ACCESS_TOKEN`; // Replace YOUR_NEODB_ACCESS_TOKEN with your token from https://neodb.social/developer/

export default defineContentScript({
  matches: [
    'https://neodb.social/*',
    'https://music.douban.com/subject/*',
    'https://movie.douban.com/subject/*',
    'https://book.douban.com/subject/*',
  ],
  main() {
    // NeoDB Page Search Btn
    if (
      window.location.href.startsWith('https://neodb.social/') &&
      !window.location.href.startsWith('https://neodb.social/game/') &&
      !window.location.href.startsWith('https://neodb.social/performance/')
    ) {
      const box = document.getElementById('item-cover');
      if (box) {
        box.classList.add('neo2db-cover-container');

        // Create a container to render React components
        const searchButtonContainer = document.createElement('div');
        box.appendChild(searchButtonContainer);

        // Render SearchButton component
        const searchButtonRoot = createRoot(searchButtonContainer);
        searchButtonRoot.render(
          <SearchButton onClick={handleSearchButtonClick} />
        );

        // If this is an album page, add CreateButton
        if (window.location.href.startsWith('https://neodb.social/album/')) {
          const createButtonContainer = document.createElement('div');
          box.appendChild(createButtonContainer);

          // Render CreateButton component
          const createButtonRoot = createRoot(createButtonContainer);
          createButtonRoot.render(
            <CreateButton onClick={handleCreateButtonClick} />
          );
        }
      }
    }

    // Douban Page Search Btn
    if (
      (window.location.hostname === 'music.douban.com' ||
        window.location.hostname === 'movie.douban.com' ||
        window.location.hostname === 'book.douban.com') &&
      /^\/subject\/\d+\/?$/.test(window.location.pathname)
    ) {
      const wrapper = document.querySelector('#wrapper') as HTMLElement;
      if (wrapper) {
        wrapper.classList.add('neo2db-douban-wrapper');
        const searchButton = document.createElement('a');
        searchButton.classList.add('neo2db-douban-search-btn');
        searchButton.href = '#';

        // Create a container for the React component
        const logoContainer = document.createElement('div');
        logoContainer.classList.add('neo2db-logo-container');
        searchButton.appendChild(logoContainer);
        const logoRoot = createRoot(logoContainer);
        logoRoot.render(<NeoDBLogo />);

        searchButton.addEventListener('click', (e) => {
          e.preventDefault();
          const currentUrl = window.location.href;
          const neodbSearchUrl = `https://neodb.social/search?q=${currentUrl}`;
          window.open(neodbSearchUrl, '_blank');
        });

        wrapper.appendChild(searchButton);
      }
    }
  },
});

// Handle search button click event
function handleSearchButtonClick(e: React.MouseEvent<HTMLButtonElement>) {
  e.preventDefault();
  const h1 = document.querySelector('#item-title h1');
  const ItemTitle = h1?.firstChild?.textContent?.trim() || '';

  const artistSpan = document.querySelector(
    '#item-metadata > section > div:nth-child(2) span span'
  );
  const ItemArtist = artistSpan ? artistSpan.textContent?.trim() || '' : '';

  const url = window.location.href;
  const match = url.match(/\/([a-zA-Z]+)\//);
  if (match) {
    const Category =
      match[1] === 'tv' ? 'movie' : match[1] === 'album' ? 'music' : match[1];

    // Only include artist for music/album searches
    const searchQuery =
      match[1] === 'album' ? `${ItemTitle} ${ItemArtist}` : `${ItemTitle}`;

    const doubanSearchUrl = `https://search.douban.com/${Category}/subject_search?search_text=${encodeURIComponent(
      searchQuery
    )}`;
    window.open(doubanSearchUrl, '_blank');
  }
}

// Handle create button click event
async function handleCreateButtonClick() {
  const albumId = window.location.pathname.split('/').pop();

  if (albumId) {
    try {
      const response = await fetch(
        `https://neodb.social/api/album/${albumId}`,
        {
          headers: {
            Authorization: AccessToken,
          },
        }
      );

      const albumData: AlbumData = await response.json();

      // Download cover image
      if (albumData.cover_image_url) {
        downloadImage(
          albumData.cover_image_url,
          `${albumData.title}_cover.jpg`
        );
      } else {
        console.log('No cover image URL found in the album data.');
      }

      // Send album data to background script
      try {
        chrome.runtime.sendMessage({
          action: 'fillDoubanForm',
          albumData: albumData,
        });
      } catch (chromeError) {
        // Ignore "Extension context invalidated" error
        if (
          typeof chromeError === 'object' &&
          chromeError !== null &&
          !chromeError.toString().includes('Extension context invalidated')
        ) {
          console.error('Error sending message:', chromeError);
        }
      }
    } catch (error) {
      // If the error is not "Extension context invalidated", display it
      if (
        error instanceof Error &&
        !error.message.includes('Extension context invalidated')
      ) {
        console.error('Failed to fetch album data:', error);
      }
    }
  }
}

// Download image function
function downloadImage(url: string, fileName: string) {
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
