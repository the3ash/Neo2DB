// Inject button into the page
const box = document.getElementById("item-cover");
box.style.position = "relative";
const button = document.createElement("button");
const svgIcon = `
  <svg
    t="1725420667709"
    class="icon"
    viewBox="0 0 1024 1024"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    p-id="1494"
    width="18"
    height="18"
  >
    <path
      d="M212.864 598.357333V317.482667H812.8v280.874666H212.864zM128 859.776v-72.96h185.002667l-43.264-190.165333h103.509333l46.677333 190.122666h184.149334l46.677333-190.122666h103.552l-44.16 190.122666H896v72.96H128z m190.976-334.378667h387.797333V389.589333h-387.84v135.808z m-167.253333-281.728V170.666667h721.365333v72.96H151.765333z"
      fill="#FFFFFF"
      p-id="1495"
    ></path>
  </svg>`;
button.innerHTML = svgIcon;
button.style.backgroundColor = "green";
button.style.width = "28px";
button.style.height = "28px";
button.style.borderRadius = "6px";
button.style.padding = "0";
button.style.border = "none";
button.style.position = "absolute";
button.style.top = "-64px";
button.style.left = "0";
button.style.display = "flex";
button.style.alignItems = "center";
button.style.justifyContent = "center";
box.appendChild(button);

button.addEventListener("click", async () => {
  const albumId = window.location.pathname.split("/").pop();

  try {
    const response = await fetch(`https://neodb.social/api/album/${albumId}`, {
      headers: {
        Authorization:
          "Bearer roaGViR6UqsNyCZHTwNxUg4XbGQ1njVzhyRZVib7k2_WGzWQgXqJUAD6Mw",
      },
    });
    const albumData = await response.json();

    // Download cover image
    if (albumData.cover_image_url) {
      downloadImage(albumData.cover_image_url, `${albumData.title}_cover.jpg`);
    } else {
      console.log("No cover image URL found in the album data.");
    }

    // Send the album data to the background script
    chrome.runtime.sendMessage({
      action: "fillDoubanForm",
      albumData: albumData,
    });
  } catch (error) {
    console.error("Failed to fetch album data:", error);
  }
});

// Function to download image
function downloadImage(url, fileName) {
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = fileName;

  document.body.appendChild(a);

  a.click();

  document.body.removeChild(a);
}
