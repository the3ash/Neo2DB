import { createRoot } from "react-dom/client";
import SearchButton from "../src/components/SearchButton";
import CreateButton from "../src/components/CreateButton";
import { AlbumData } from "../src/types";

// You need to fill in your own Access Token below
// 1. Visit https://neodb.social/developer/ and login with your account
// 2. Create a new application to get your Access Token
// 3. Copy the token and paste it below in the format: "Bearer YOUR_TOKEN_HERE"
const AccessToken = "Bearer"; // Replace with your NeoDB Access Token

export default defineContentScript({
  matches: [
    "https://neodb.social/*",
    "https://music.douban.com/subject/*",
    "https://movie.douban.com/subject/*",
    "https://book.douban.com/subject/*",
  ],
  main() {
    // NeoDB Page Search Btn
    if (
      window.location.href.startsWith("https://neodb.social/") &&
      !window.location.href.startsWith("https://neodb.social/game/") &&
      !window.location.href.startsWith("https://neodb.social/performance/")
    ) {
      const box = document.getElementById("item-cover");
      if (box) {
        box.style.position = "relative";

        // Create a container to render React components
        const searchButtonContainer = document.createElement("div");
        box.appendChild(searchButtonContainer);

        // Render SearchButton component
        const searchButtonRoot = createRoot(searchButtonContainer);
        searchButtonRoot.render(
          <SearchButton onClick={handleSearchButtonClick} />
        );

        // If this is an album page, add CreateButton
        if (window.location.href.startsWith("https://neodb.social/album/")) {
          const createButtonContainer = document.createElement("div");
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
      (window.location.hostname === "music.douban.com" ||
        window.location.hostname === "movie.douban.com" ||
        window.location.hostname === "book.douban.com") &&
      /^\/subject\/\d+\/?$/.test(window.location.pathname)
    ) {
      const wrapper = document.querySelector("#wrapper");
      if (wrapper) {
        // Implement search button for Douban page
        const searchButton = document.createElement("a");
        const svgIcon = `
        <svg height="20" viewBox="0 0 220.10335 107.60636">
          <path d="M81.67,32.5H47.42a4.34,4.34,0,0,0-4.34,4.34V62.94a4.34,4.34,0,0,0,4.34,4.34H81.67A4.34,4.34,0,0,0,86,62.94V36.84A4.34,4.34,0,0,0,81.67,32.5ZM80.31,56.72H51.93a2.47,2.47,0,0,1-2.47-2.46V43.36a2.47,2.47,0,0,1,2.47-2.47H80.31a2.47,2.47,0,0,1,2.47,2.47V54.26A2.47,2.47,0,0,1,80.31,56.72Z" fill="#008000"/>
          <path d="M50.36,5l-6.33,0h-35A4.37,4.37,0,0,0,4.68,9.4V99.06a4.36,4.36,0,0,0,4.36,4.35H44a4.36,4.36,0,0,0,4.36-4.35h0V90.34h2a4.38,4.38,0,0,0,4.37-4.37V70h0V9.41A4.38,4.38,0,0,0,50.36,5Zm-1.09,10H43.76a4.39,4.39,0,0,0-4.38,4.38v.55H12.55a2.46,2.46,0,0,1-2.45-2.47V9.91a2.46,2.46,0,0,1,2.45-2.47H47.25a2.47,2.47,0,0,1,2.47,2.47V14a.63.63,0,0,1-.45.94Z" fill="#008000"/>
          <path d="M132.58,32.5H98.33A4.34,4.34,0,0,0,94,36.84V62.94a4.34,4.34,0,0,0,4.34,4.34h34.25a4.34,4.34,0,0,0,4.34-4.34V36.84A4.34,4.34,0,0,0,132.58,32.5Zm-.73,23.49a.73.73,0,0,1-.73.73H101.53a.73.73,0,0,1-.73-.73V43.36a.73.73,0,0,1,.73-.73h29.59a.74.74,0,0,1,.73.73Z" fill="#008000"/>
          <path d="M183.5,32.5H149.25a4.34,4.34,0,0,0-4.34,4.34V62.94a4.34,4.34,0,0,0,4.34,4.34H183.5a4.34,4.34,0,0,0,4.34-4.34V36.84A4.34,4.34,0,0,0,183.5,32.5Zm-1.36,24.22H152.45A2.46,2.46,0,0,1,150,54.26V43.36a2.46,2.46,0,0,1,2.47-2.47h29.67a2.47,2.47,0,0,1,2.47,2.47V54.26A2.47,2.47,0,0,1,182.14,56.72Z" fill="#008000"/>
        </svg>`;
        searchButton.innerHTML = svgIcon;
        searchButton.style.position = "absolute";
        searchButton.style.right = "15px";
        searchButton.style.top = "15px";
        searchButton.style.width = "42px";
        searchButton.style.height = "42px";
        searchButton.style.display = "flex";
        searchButton.style.alignItems = "center";
        searchButton.style.justifyContent = "center";
        searchButton.style.cursor = "pointer";
        wrapper.appendChild(searchButton);

        searchButton.addEventListener("click", () => {
          const h1 = document.querySelector("h1");
          const ItemTitle = h1 ? h1.textContent?.trim() || "" : "";
          const category = window.location.hostname.split(".")[0];
          const match = window.location.pathname.match(/\/subject\/(\d+)/);
          const ItemId = match ? match[1] : "";
          const itemType = category === "music" ? "album" : category;
          window.open(
            `https://neodb.social/${itemType}/search/?q=${encodeURIComponent(
              ItemTitle
            )}`,
            "_blank"
          );
        });
      }
    }
  },
});

// Handle search button click event
function handleSearchButtonClick(e: React.MouseEvent<HTMLButtonElement>) {
  e.preventDefault();
  const h1 = document.querySelector("#item-title h1");
  const ItemTitle = h1?.firstChild?.textContent?.trim() || "";

  const artistSpan = document.querySelector(
    "#item-metadata > section > div:nth-child(2) span span"
  );
  const ItemArtist = artistSpan ? artistSpan.textContent?.trim() || "" : "";

  const url = window.location.href;
  const match = url.match(/\/([a-zA-Z]+)\//);
  if (match) {
    const Category =
      match[1] === "tv" ? "movie" : match[1] === "album" ? "music" : match[1];

    // Only include artist for music/album searches
    const searchQuery =
      match[1] === "album" ? `${ItemTitle} ${ItemArtist}` : `${ItemTitle}`;

    const doubanSearchUrl = `https://search.douban.com/${Category}/subject_search?search_text=${encodeURIComponent(
      searchQuery
    )}`;
    window.open(doubanSearchUrl, "_blank");
  }
}

// Handle create button click event
async function handleCreateButtonClick() {
  const albumId = window.location.pathname.split("/").pop();

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
        console.log("No cover image URL found in the album data.");
      }

      // Send album data to background script
      try {
        chrome.runtime.sendMessage({
          action: "fillDoubanForm",
          albumData: albumData,
        });
      } catch (chromeError) {
        // Ignore "Extension context invalidated" error
        if (
          typeof chromeError === "object" &&
          chromeError !== null &&
          !chromeError.toString().includes("Extension context invalidated")
        ) {
          console.error("Error sending message:", chromeError);
        }
      }
    } catch (error) {
      // If the error is not "Extension context invalidated", display it
      if (
        error instanceof Error &&
        !error.message.includes("Extension context invalidated")
      ) {
        console.error("Failed to fetch album data:", error);
      }
    }
  }
}

// Download image function
function downloadImage(url: string, fileName: string) {
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
