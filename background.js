// Add from NeoDB
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "fillDoubanForm") {
    const { albumData } = message;

    //Storage album data
    chrome.storage.local.set({ pendingAlbumData: albumData }, () => {
      chrome.tabs.create(
        { url: "https://music.douban.com/new_subject" },
        (tab) => {
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: fillInitialForm,
          });
        }
      );
    });
  }
});

function fillInitialForm() {
  chrome.storage.local.get(["pendingAlbumData"], (result) => {
    const albumData = result.pendingAlbumData;
    if (albumData) {
      document.querySelector('input[name="p_title"]').value = albumData.title;
      document.querySelector(".btn-link").click();
    }
  });
}

//Listen to the page loading completion event
chrome.webNavigation.onCompleted.addListener((details) => {
  if (details.url.startsWith("https://music.douban.com/new_subject")) {
    chrome.scripting.executeScript({
      target: { tabId: details.tabId },
      func: fillRemainingForm,
    });
  }
});

function fillRemainingForm() {
  chrome.storage.local.get(["pendingAlbumData"], (result) => {
    const albumData = result.pendingAlbumData;
    if (albumData) {
      if (Array.isArray(albumData.artist)) {
        albumData.artist.forEach((artist, index) => {
          const artistInput = document.getElementById(`p_48_${index}`);
          if (artistInput) {
            artistInput.value = artist;
            artistInput.dispatchEvent(new Event("input", { bubbles: true }));
          }
        });
      }

      document.querySelector('input[name="p_50"]').value =
        albumData.company[0].replace(/^\d{4}\s*/, "");
      document.querySelector('input[name="p_51"]').value =
        albumData.release_date;
      document.querySelector('textarea[name="p_52_other"]').value =
        albumData.track_list;
      document.querySelector('textarea[name="p_152_other"]').value =
        albumData.external_resources[0].url;

      chrome.storage.local.remove("pendingAlbumData");
    }
  });
}

// Search from Douban
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (
    changeInfo.status === "complete" &&
    tab.url.startsWith("https://neodb.social/")
  ) {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      function: autoFillNeoDBSearchUpdated,
    });
  }
});

function autoFillNeoDBSearchUpdated() {
  // Get Douban URL from chrome.storage
  chrome.storage.local.get(["doubanUrl"], (result) => {
    const doubanUrl = result.doubanUrl;

    if (doubanUrl) {
      const searchInput = document.getElementById("q");
      const searchForm = document.querySelector('form[role="search"]');

      if (searchInput) {
        searchInput.value = doubanUrl;
        searchInput.dispatchEvent(new Event("input", { bubbles: true }));
      }

      if (searchForm) {
        searchForm.submit();
      }

      chrome.storage.local.remove("doubanUrl");
    }
  });
}
