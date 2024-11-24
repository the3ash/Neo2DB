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
      // 填充 artist 字段
      if (Array.isArray(albumData.artist)) {
        albumData.artist.forEach((artist, index) => {
          const artistInput = document.getElementById(`p_48_${index}`);
          if (artistInput) {
            artistInput.value = artist;
            artistInput.dispatchEvent(new Event("input", { bubbles: true }));
          }
        });
      }

      // 填充 company 字段
      const company = albumData.company?.[0] || "";
      if (company) {
        document.querySelector('input[name="p_50"]').value = company.replace(
          /^\d{4}\s*/,
          ""
        );
      }

      // 填充 release_date 字段
      const releaseDate = albumData.release_date || "";
      if (releaseDate) {
        document.querySelector('input[name="p_51"]').value = releaseDate;
      }

      // 填充 track_list 字段
      const trackList = albumData.track_list || "";
      if (trackList) {
        document.querySelector('textarea[name="p_52_other"]').value = trackList;
      }

      // 填充 descritption 字段
      const description = albumData.description || "";
      if (description) {
        document.querySelector('textarea[name="p_28_other"]').value =
          description;
      }

      // 填充 external_resources 字段
      const externalUrl = albumData.external_resources?.[0]?.url || "";
      if (externalUrl) {
        document.querySelector('textarea[name="p_152_other"]').value =
          externalUrl;
      }

      chrome.storage.local.remove("pendingAlbumData");
    }
  });
}
