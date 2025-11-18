import { AlbumData } from "../src/types";

// Helper function to log messages only in development mode
const isDev = process.env.NODE_ENV !== "production";
function devLog(...args: any[]) {
  if (isDev) {
    console.log(...args);
  }
}

export default defineBackground(() => {
  devLog("Neo2DB background script started");

  // Handle messages from content script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    devLog("Background received message:", message.action);

    if (message.action === "fillDoubanForm") {
      const { albumData } = message;

      // Store album data and open Douban form
      chrome.storage.local.set({ pendingAlbumData: albumData }, () => {
        devLog("Album data stored:", albumData.title);
        chrome.tabs.create(
          { url: "https://music.douban.com/new_subject" },
          (tab) => {
            devLog("Tab created with ID:", tab?.id, "- Waiting for page load");
            const tabId = tab?.id;
            if (tabId) {
              // Delay execution to ensure DOM is fully loaded
              setTimeout(() => {
                devLog(
                  "Initial delay complete, checking page state before filling form"
                );
                chrome.scripting.executeScript(
                  {
                    target: { tabId },
                    func: function () {
                      // Pass the isDev flag to the executed script
                      const isDev = process.env.NODE_ENV !== "production";
                      function devLog(...args: any[]) {
                        if (isDev) {
                          console.log(...args);
                        }
                      }

                      devLog("Page readyState:", document.readyState);
                      devLog("Page URL:", window.location.href);
                      devLog("Document title:", document.title);
                      const titleInput = document.querySelector(
                        'input[name="p_title"]'
                      );
                      const btnLink = document.querySelector(".btn-link");
                      devLog("Title input found:", !!titleInput);
                      devLog("Button link found:", !!btnLink);
                      return {
                        readyState: document.readyState,
                        elementsFound: !!titleInput && !!btnLink,
                      };
                    },
                  },
                  (results) => {
                    if (results && results[0] && results[0].result) {
                      devLog("Page check results:", results[0].result);
                      chrome.scripting.executeScript({
                        target: { tabId },
                        func: fillInitialForm,
                      });
                    }
                  }
                );
              }, 800);
            }
          }
        );
      });
    }

    // Return true to indicate that response will be sent asynchronously
    return true;
  });

  // Track tabs that have already been filled to prevent duplicate filling
  let formFilledTabs = new Set();

  // Listen for page navigation events to detect form expansion
  chrome.webNavigation.onCompleted.addListener((details) => {
    if (details.url.startsWith("https://music.douban.com/new_subject")) {
      devLog("Navigation completed event detected for URL:", details.url);

      const tabId = details.tabId;
      if (typeof tabId === "number") {
        // Skip if form was already filled for this tab
        if (formFilledTabs.has(tabId)) {
          devLog("Tab", tabId, "already had form filled, skipping");
          return;
        }

        // Delay to ensure page is fully loaded
        setTimeout(() => {
          devLog("About to check form state on tabId:", tabId);
          chrome.scripting.executeScript(
            {
              target: { tabId },
              func: function () {
                // Pass the isDev flag to the executed script
                const isDev = process.env.NODE_ENV !== "production";
                function devLog(...args: any[]) {
                  if (isDev) {
                    console.log(...args);
                  }
                }

                devLog("Checking form state before filling remaining form");
                const artistInput = document.getElementById("p_48_0");
                const otherInputs = {
                  company: !!document.querySelector('input[name="p_50"]'),
                  releaseDate: !!document.querySelector('input[name="p_51"]'),
                  trackList: !!document.querySelector(
                    'textarea[name="p_52_other"]'
                  ),
                };
                devLog("Artist input found:", !!artistInput);
                devLog("Other form inputs:", otherInputs);
                return {
                  artistInput: !!artistInput,
                  otherInputs,
                  url: window.location.href,
                };
              },
            },
            (results) => {
              if (results && results[0] && results[0].result) {
                devLog("Form state check results:", results[0].result);
                const formState = results[0].result;
                if (formState.artistInput) {
                  // Mark tab as filled
                  formFilledTabs.add(tabId);

                  // Fill the expanded form
                  chrome.scripting.executeScript({
                    target: { tabId },
                    func: fillRemainingForm,
                  });
                }
              }
            }
          );
        }, 800);
      }
    }
  });
});

// Function to fill initial form with title and click expand button
function fillInitialForm() {
  // Pass the isDev flag to the executed script
  const isDev = process.env.NODE_ENV !== "production";
  function devLog(...args: any[]) {
    if (isDev) {
      console.log(...args);
    }
  }

  devLog("Executing fillInitialForm");
  chrome.storage.local.get(["pendingAlbumData"], (result) => {
    const albumData = result.pendingAlbumData as AlbumData;
    if (albumData) {
      const titleInput = document.querySelector(
        'input[name="p_title"]'
      ) as HTMLInputElement;
      const btnLink = document.querySelector(".btn-link") as HTMLElement;

      if (titleInput && btnLink) {
        devLog("Form elements found, setting title:", albumData.title);
        titleInput.value = albumData.title;
        devLog("Clicking button to proceed");
        btnLink.click();
      } else {
        console.error("Form elements not found!");
      }
    }
  });
}

// Function to fill all remaining form fields after expansion
function fillRemainingForm() {
  // Pass the isDev flag to the executed script
  const isDev = process.env.NODE_ENV !== "production";
  function devLog(...args: any[]) {
    if (isDev) {
      console.log(...args);
    }
  }

  devLog("Executing fillRemainingForm");
  chrome.storage.local.get(["pendingAlbumData"], (result) => {
    const albumData = result.pendingAlbumData as AlbumData;
    if (albumData) {
      let fieldsFound = 0;
      let fieldsTotal = 0;

      // Fill artist field
      if (Array.isArray(albumData.artist)) {
        albumData.artist.forEach((artist: string, index: number) => {
          fieldsTotal++;
          const artistInput = document.getElementById(
            `p_48_${index}`
          ) as HTMLInputElement;
          if (artistInput) {
            fieldsFound++;
            artistInput.value = artist;
            artistInput.dispatchEvent(new Event("input", { bubbles: true }));
          }
        });
      }

      // Fill company field
      const company = albumData.company?.[0] || "";
      if (company) {
        fieldsTotal++;
        const companyInput = document.querySelector(
          'input[name="p_50"]'
        ) as HTMLInputElement;
        if (companyInput) {
          fieldsFound++;
          companyInput.value = company.replace(/^\d{4}\s*/, "");
        }
      }

      // Fill release_date field
      const releaseDate = albumData.release_date || "";
      if (releaseDate) {
        fieldsTotal++;
        const releaseDateInput = document.querySelector(
          'input[name="p_51"]'
        ) as HTMLInputElement;
        if (releaseDateInput) {
          fieldsFound++;
          releaseDateInput.value = releaseDate;
        }
      }

      // Fill track_list field
      const trackList = albumData.track_list || "";
      if (trackList) {
        fieldsTotal++;
        const trackListInput = document.querySelector(
          'textarea[name="p_52_other"]'
        ) as HTMLTextAreaElement;
        if (trackListInput) {
          fieldsFound++;
          trackListInput.value = trackList;
        }
      }

      // Fill description field
      const description = albumData.description || "";
      if (description) {
        fieldsTotal++;
        const descriptionInput = document.querySelector(
          'textarea[name="p_28_other"]'
        ) as HTMLTextAreaElement;
        if (descriptionInput) {
          fieldsFound++;
          descriptionInput.value = description;
        }
      }

      // Fill external_resources field
      const externalUrl = albumData.external_resources?.[0]?.url || "";
      if (externalUrl) {
        fieldsTotal++;
        const externalUrlInput = document.querySelector(
          'textarea[name="p_152_other"]'
        ) as HTMLTextAreaElement;
        if (externalUrlInput) {
          fieldsFound++;
          externalUrlInput.value = externalUrl;
        }
      }

      devLog(
        `Form filling completed: found ${fieldsFound}/${fieldsTotal} fields`
      );
      chrome.storage.local.remove("pendingAlbumData");
    }
  });
}
