import { AlbumData } from "../src/types";

export default defineBackground(() => {
  console.log("Neo2DB background script started");

  // Add from NeoDB
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Background received message:", message.action);

    if (message.action === "fillDoubanForm") {
      const { albumData } = message;

      // Storage album data
      chrome.storage.local.set({ pendingAlbumData: albumData }, () => {
        console.log("Album data stored:", albumData.title);
        chrome.tabs.create(
          { url: "https://music.douban.com/new_subject" },
          (tab) => {
            if (tab.id) {
              chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: fillInitialForm,
              });
            }
          }
        );
      });
    }

    // Return true to indicate that response will be sent asynchronously
    return true;
  });

  // Listen to the page loading completion event
  chrome.webNavigation.onCompleted.addListener((details) => {
    if (details.url.startsWith("https://music.douban.com/new_subject")) {
      console.log("Douban page loaded, preparing to fill form");

      // Add a short delay to ensure the page is fully loaded
      setTimeout(() => {
        chrome.scripting.executeScript({
          target: { tabId: details.tabId },
          func: fillRemainingForm,
        });
      }, 500);
    }
  });
});

// Function to fill initial form
function fillInitialForm() {
  chrome.storage.local.get(["pendingAlbumData"], (result) => {
    const albumData = result.pendingAlbumData;
    if (albumData) {
      const titleInput = document.querySelector(
        'input[name="p_title"]'
      ) as HTMLInputElement;
      const btnLink = document.querySelector(".btn-link") as HTMLElement;

      if (titleInput && btnLink) {
        titleInput.value = albumData.title;
        btnLink.click();
      }
    }
  });
}

// Function to fill remaining form
function fillRemainingForm() {
  chrome.storage.local.get(["pendingAlbumData"], (result) => {
    const albumData = result.pendingAlbumData as AlbumData;
    if (albumData) {
      // Fill artist field
      if (Array.isArray(albumData.artist)) {
        albumData.artist.forEach((artist: string, index: number) => {
          const artistInput = document.getElementById(
            `p_48_${index}`
          ) as HTMLInputElement;
          if (artistInput) {
            artistInput.value = artist;
            artistInput.dispatchEvent(new Event("input", { bubbles: true }));
          }
        });
      }

      // Fill company field
      const company = albumData.company?.[0] || "";
      if (company) {
        const companyInput = document.querySelector(
          'input[name="p_50"]'
        ) as HTMLInputElement;
        if (companyInput) {
          companyInput.value = company.replace(/^\d{4}\s*/, "");
        }
      }

      // Fill release_date field
      const releaseDate = albumData.release_date || "";
      if (releaseDate) {
        const releaseDateInput = document.querySelector(
          'input[name="p_51"]'
        ) as HTMLInputElement;
        if (releaseDateInput) {
          releaseDateInput.value = releaseDate;
        }
      }

      // Fill track_list field
      const trackList = albumData.track_list || "";
      if (trackList) {
        const trackListInput = document.querySelector(
          'textarea[name="p_52_other"]'
        ) as HTMLTextAreaElement;
        if (trackListInput) {
          trackListInput.value = trackList;
        }
      }

      // Fill description field
      const description = albumData.description || "";
      if (description) {
        const descriptionInput = document.querySelector(
          'textarea[name="p_28_other"]'
        ) as HTMLTextAreaElement;
        if (descriptionInput) {
          descriptionInput.value = description;
        }
      }

      // Fill external_resources field
      const externalUrl = albumData.external_resources?.[0]?.url || "";
      if (externalUrl) {
        const externalUrlInput = document.querySelector(
          'textarea[name="p_152_other"]'
        ) as HTMLTextAreaElement;
        if (externalUrlInput) {
          externalUrlInput.value = externalUrl;
        }
      }

      chrome.storage.local.remove("pendingAlbumData");
    }
  });
}
